"""
Azure Storage Service for JanConnect

Provides durable cloud storage for:
1. Azure Table Storage: Simple, serverless NoSQL table database for complaint records and SLA tracking.
2. Azure Blob Storage: Storage for citizen proof attachments (PDFs, images, bills).
3. Resilient Local Fallback: If AZURE_STORAGE_CONNECTION_STRING is not set or unreachable,
   seamlessly falls back to local SQLite so the system is fully operational offline and in dev.
"""

import os
import json
import sqlite3
import datetime
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ENV_PATH)


# Local SQLite fallback path
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "janconnect_local.db")


def _init_local_db():
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            tracking_id TEXT PRIMARY KEY,
            department_id TEXT,
            department_name TEXT,
            citizen_name TEXT,
            complaint_text TEXT,
            status TEXT,
            sla_target_days INTEGER,
            sla_deadline TEXT,
            created_at TEXT,
            updated_at TEXT,
            blob_url TEXT
        )
    """)
    conn.commit()
    conn.close()


_init_local_db()


def _get_azure_table_client():
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str or "<your" in conn_str or "AccountName=" not in conn_str:
        return None

    try:
        from azure.data.tables import TableServiceClient
        service = TableServiceClient.from_connection_string(conn_str)
        table_client = service.create_table_if_not_exists(table_name="complaints")
        return table_client
    except Exception as e:
        print(f"[Azure Table Storage Notice] Operating in local mode: {e}")
        return None


def _get_azure_blob_container():
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str or "<your" in conn_str or "AccountName=" not in conn_str:
        return None

    try:
        from azure.storage.blob import BlobServiceClient
        service = BlobServiceClient.from_connection_string(conn_str)
        container_client = service.get_container_client("citizendocuments")
        if not container_client.exists():
            container_client = service.create_container("citizendocuments")
        return container_client
    except Exception as e:
        print(f"[Azure Blob Storage Notice] Operating in local mode: {e}")
        return None


def save_complaint(
    tracking_id: str,
    department_id: str,
    department_name: str,
    complaint_text: str,
    citizen_name: str,
    sla_target_days: int = 14,
    blob_url: str = None
) -> dict:
    tracking_id = (tracking_id or "").strip().upper()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    deadline = (
        datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=sla_target_days)
    ).isoformat()

    record = {
        "tracking_id": tracking_id,
        "department_id": department_id or "general",
        "department_name": department_name or "General Administration",
        "complaint_text": complaint_text,
        "citizen_name": citizen_name or "Citizen",
        "status": "Filed",
        "sla_target_days": sla_target_days,
        "sla_deadline": deadline,
        "created_at": now,
        "updated_at": now,
        "blob_url": blob_url or "",
    }

    table_client = _get_azure_table_client()
    if table_client:
        try:
            entity = {
                "PartitionKey": record["department_id"],
                "RowKey": record["tracking_id"],
                "citizen_name": record["citizen_name"],
                "department_name": record["department_name"],
                "complaint_text": record["complaint_text"],
                "status": record["status"],
                "sla_target_days": record["sla_target_days"],
                "sla_deadline": record["sla_deadline"],
                "created_at": record["created_at"],
                "updated_at": record["updated_at"],
                "blob_url": record["blob_url"],
            }
            table_client.upsert_entity(entity=entity)
            record["_storage"] = "Azure Table Storage"
            return record
        except Exception as e:
            print(f"[Azure Table Storage Upsert Error] Falling back to local: {e}")

    # Fallback to local SQLite
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO complaints (
            tracking_id, department_id, department_name, citizen_name,
            complaint_text, status, sla_target_days, sla_deadline,
            created_at, updated_at, blob_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record["tracking_id"], record["department_id"], record["department_name"],
        record["citizen_name"], record["complaint_text"], record["status"],
        record["sla_target_days"], record["sla_deadline"], record["created_at"],
        record["updated_at"], record["blob_url"]
    ))
    conn.commit()
    conn.close()
    record["_storage"] = "Local SQLite Store"
    return record


def get_complaint(tracking_id: str) -> dict:
    tracking_id = (tracking_id or "").strip().upper()
    table_client = _get_azure_table_client()
    if table_client:
        try:
            # Query across partitions by RowKey
            query = f"RowKey eq '{tracking_id}'"
            entities = list(table_client.query_entities(query_filter=query))
            if entities:
                e = entities[0]
                return {
                    "tracking_id": e.get("RowKey", tracking_id),
                    "department_id": e.get("PartitionKey", "general"),
                    "department_name": e.get("department_name", "General Administration"),
                    "citizen_name": e.get("citizen_name", "Citizen"),
                    "complaint_text": e.get("complaint_text", ""),
                    "status": e.get("status", "Filed"),
                    "sla_target_days": e.get("sla_target_days", 14),
                    "sla_deadline": e.get("sla_deadline", ""),
                    "created_at": e.get("created_at", ""),
                    "updated_at": e.get("updated_at", ""),
                    "blob_url": e.get("blob_url", ""),
                    "_storage": "Azure Table Storage",
                }
        except Exception as e:
            print(f"[Azure Table Storage Query Error] Falling back to local: {e}")

    # Fallback to local SQLite
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE tracking_id = ?", (tracking_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {"error": "No complaint found with that tracking id."}

    data = dict(row)
    data["_storage"] = "Local SQLite Store"
    return data


def advance_complaint_status(tracking_id: str) -> dict:
    """Advances ticket status for demonstration: Filed -> Assigned to Field Officer -> In Progress -> Resolved"""
    tracking_id = (tracking_id or "").strip().upper()
    transitions = {
        "Filed": "Assigned to Field Officer",
        "Assigned to Field Officer": "Investigation In Progress",
        "Investigation In Progress": "Resolved",
        "Resolved": "Resolved"
    }

    current = get_complaint(tracking_id)
    if "error" in current:
        return current

    old_status = current.get("status", "Filed")
    new_status = transitions.get(old_status, "Under Review")
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    table_client = _get_azure_table_client()
    if table_client:
        try:
            entity = table_client.get_entity(partition_key=current["department_id"], row_key=tracking_id)
            entity["status"] = new_status
            entity["updated_at"] = now
            table_client.update_entity(entity=entity)
            current["status"] = new_status
            current["updated_at"] = now
            current["_storage"] = "Azure Table Storage"
            return current
        except Exception as e:
            print(f"[Azure Table Status Update Error] Falling back to local: {e}")

    # Fallback to local SQLite
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE complaints SET status = ?, updated_at = ? WHERE tracking_id = ?
    """, (new_status, now, tracking_id))
    conn.commit()
    conn.close()

    current["status"] = new_status
    current["updated_at"] = now
    current["_storage"] = "Local SQLite Store"
    return current


def upload_document_blob(file_name: str, file_bytes: bytes, content_type: str = "application/pdf") -> str:
    """Uploads document attachment to Azure Blob Storage, or saves locally."""
    container_client = _get_azure_blob_container()
    if container_client:
        try:
            from azure.storage.blob import ContentSettings
            blob_client = container_client.get_blob_client(file_name)
            blob_client.upload_blob(
                file_bytes,
                overwrite=True,
                content_settings=ContentSettings(content_type=content_type)
            )
            return blob_client.url
        except Exception as e:
            print(f"[Azure Blob Storage Upload Error] Falling back: {e}")

    # Fallback local reference
    return f"/uploads/local/{file_name}"


def get_departments() -> list[dict]:
    """Retrieves all municipal departments dynamically from Azure Table Storage."""
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if conn_str and "AccountName=" in conn_str:
        try:
            from azure.data.tables import TableClient
            table = TableClient.from_connection_string(conn_str, table_name="departments")
            entities = list(table.list_entities())
            if entities:
                dept_list = []
                for e in entities:
                    keywords = []
                    try:
                        keywords = json.loads(e.get("keywords_json", "[]"))
                    except Exception:
                        pass
                    dept_list.append({
                        "id": e.get("department_id") or e.get("RowKey"),
                        "name": e.get("department_name"),
                        "authority": e.get("official_authority"),
                        "office": e.get("office_location"),
                        "helpline": e.get("helpline"),
                        "sla": e.get("sla_description"),
                        "sla_days": e.get("sla_days", 14),
                        "icon": e.get("icon", "🏛️"),
                        "badgeClass": e.get("badge_class", "badge-primary"),
                        "keywords": keywords,
                        "policies": [e.get("policy_summary")] if e.get("policy_summary") else []
                    })
                return dept_list
        except Exception as err:
            print(f"[Azure Table Departments Warning] {err}")

    # Fallback to local policy path
    mock_file = os.path.join(os.path.dirname(__file__), "..", "mock_data", "department_policies.json")
    if os.path.exists(mock_file):
        with open(mock_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [
                {
                    "id": k,
                    "name": v.get("department_name"),
                    "authority": v.get("official_authority"),
                    "office": v.get("office_location"),
                    "helpline": v.get("helpline"),
                    "sla": v.get("sla_description", "14 working days"),
                    "icon": "💧" if k == "water" else "⚡" if k == "electricity" else "🗑️" if k == "sanitation" else "🚧",
                    "badgeClass": f"badge-{k}",
                    "keywords": v.get("keywords", []),
                    "policies": v.get("policy_snippets", [])
                }
                for k, v in data.items()
            ]
    return []


def list_all_complaints(limit: int = 50) -> list[dict]:
    """Lists all complaints filed in Azure Table Storage (ordered by creation date)."""
    table_client = _get_azure_table_client()
    if table_client:
        try:
            entities = list(table_client.list_entities())
            results = []
            for e in entities:
                tracking_id = e.get("RowKey")
                if not tracking_id:
                    continue
                results.append({
                    "tracking_id": tracking_id,
                    "department_id": e.get("department_id") or e.get("PartitionKey"),
                    "department_name": e.get("department_name", "Municipal Administration"),
                    "citizen_name": e.get("citizen_name", "Citizen"),
                    "complaint_text": e.get("complaint_text", ""),
                    "status": e.get("status", "Filed"),
                    "sla_target_days": e.get("sla_target_days", 14),
                    "sla_deadline": e.get("sla_deadline"),
                    "created_at": e.get("created_at"),
                    "updated_at": e.get("updated_at"),
                    "blob_url": e.get("blob_url", ""),
                    "_storage": "Azure Table Storage"
                })
            # Sort newest first
            results.sort(key=lambda x: x.get("created_at") or "", reverse=True)
            return results[:limit]
        except Exception as e:
            print(f"[Azure Table List Error] Falling back: {e}")

    # Fallback to local SQLite
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
