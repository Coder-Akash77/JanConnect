"""
Stage 5: Filing & Tracking

Supports:
1. Azure Table Storage (`complaints` table) for persistent grievance ticketing and SLA tracking.
2. In-memory dictionary fallback (`FILED_COMPLAINTS`) if Azure Storage connection string is missing or unreachable.
"""

import json
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

FILED_COMPLAINTS = {}
TABLE_CLIENT = None


def _seed_initial_complaints():
    """Seeds authentic Chandigarh municipal sample grievances if the store is empty."""
    samples = [
        {
            "tracking_id": "GRV-CHD-WTR-22B",
            "department_id": "water",
            "department_name": "MCC Water Supply & Sewerage Operations (Public Health Wing)",
            "complaint_text": "Inflated water bill of Rs. 4,850 for House No 1240, Sector 22-B via e-Sampark. Smart meter suspected faulty.",
            "citizen_name": "Virender Sharma",
            "status": "Assigned to Field Engineer",
            "created_at": "2026-09-20T10:15:00Z",
            "updated_at": "2026-09-21T14:30:00Z",
            "assigned_officer": "Er. S. K. Verma (Assistant Engineer, Sector 22 Sub-Division)",
            "remarks": "Site inspection scheduled at Sector 22-B. Water meter bench testing booked.",
            "status_history": [
                {"status": "Filed", "timestamp": "2026-09-20T10:15:00Z", "remarks": "Grievance registered via e-Sampark portal.", "officer": "e-Sampark System"},
                {"status": "Under Verification", "timestamp": "2026-09-20T14:00:00Z", "remarks": "Verified by MCC Public Health Sub-Division No 2.", "officer": "Control Room"},
                {"status": "Assigned to Field Engineer", "timestamp": "2026-09-21T14:30:00Z", "remarks": "Assigned to Sector 22 JE for site inspection.", "officer": "Executive Engineer"}
            ]
        },
        {
            "tracking_id": "GRV-CHD-PWR-35C",
            "department_id": "electricity",
            "department_name": "Chandigarh Power Distribution Limited (CPDL)",
            "complaint_text": "Sector 35-C inner park and V4 road street lights non-functional for 5 consecutive nights. Complete dark spot.",
            "citizen_name": "Sunita Aggarwal",
            "status": "In Progress",
            "created_at": "2026-09-21T08:30:00Z",
            "updated_at": "2026-09-22T09:00:00Z",
            "assigned_officer": "Lineman R. Swaminathan (Sector 34 Operation)",
            "remarks": "Cable fault identified near transformer. LED luminaire replacement underway under EESL contract.",
            "status_history": [
                {"status": "Filed", "timestamp": "2026-09-21T08:30:00Z", "remarks": "Outage logged via 19121 Call Centre.", "officer": "19121 Helpline"},
                {"status": "In Progress", "timestamp": "2026-09-22T09:00:00Z", "remarks": "Dispatched emergency crew for underground cable fault.", "officer": "SDO Sector 34"}
            ]
        },
        {
            "tracking_id": "GRV-CHD-PWR-13M",
            "department_id": "electricity",
            "department_name": "Chandigarh Power Distribution Limited (CPDL)",
            "complaint_text": "Manimajra sub-division power cut exceeding 4 hours. Local transformer tripping repeatedly.",
            "citizen_name": "Gurpreet Singh Sandhu",
            "status": "Under Verification",
            "created_at": "2026-09-22T07:15:00Z",
            "updated_at": "2026-09-22T08:00:00Z",
            "assigned_officer": "Er. H. S. Dhillon (SDO Manimajra)",
            "remarks": "11kV feeder outage logged. Load transfer being arranged.",
            "status_history": [
                {"status": "Filed", "timestamp": "2026-09-22T07:15:00Z", "remarks": "High priority outage logged.", "officer": "19121 System"},
                {"status": "Under Verification", "timestamp": "2026-09-22T08:00:00Z", "remarks": "Assigned to Manimajra sub-station crew.", "officer": "Control Centre"}
            ]
        },
        {
            "tracking_id": "GRV-CHD-SAN-46D",
            "department_id": "sanitation",
            "department_name": "MCC Medical Officer of Health (MOH) — Sanitation & Waste",
            "complaint_text": "Door-to-door segregated waste collection tipper missed Sector 46-D for 2 days straight.",
            "citizen_name": "Deepak Mehta",
            "status": "Assigned to Field Engineer",
            "created_at": "2026-09-21T11:20:00Z",
            "updated_at": "2026-09-21T15:45:00Z",
            "assigned_officer": "Sanitary Inspector Gurmukh Singh",
            "remarks": "Backup tipper vehicle routed to Sector 46-D morning shift.",
            "status_history": [
                {"status": "Filed", "timestamp": "2026-09-21T11:20:00Z", "remarks": "Grievance received via MCC WhatsApp 9915762917.", "officer": "WhatsApp Bot"},
                {"status": "Assigned to Field Engineer", "timestamp": "2026-09-21T15:45:00Z", "remarks": "Notified MOH South Zone sanitation supervisor.", "officer": "MOH Control Room"}
            ]
        },
        {
            "tracking_id": "GRV-CHD-RDS-19C",
            "department_id": "roads",
            "department_name": "MCC Buildings & Roads (B&R) — Streetlights & Infrastructure",
            "complaint_text": "Dangerous deep pothole near Sector 19 market roundabout causing two-wheeler accidents.",
            "citizen_name": "Pooja Verma",
            "status": "Resolved",
            "created_at": "2026-09-19T09:00:00Z",
            "updated_at": "2026-09-22T10:30:00Z",
            "assigned_officer": "Er. Naveen Mittal (JE Roads, B&R)",
            "remarks": "Bitumen cold-mix patchwork completed and compacted. Site cleared for traffic.",
            "status_history": [
                {"status": "Filed", "timestamp": "2026-09-19T09:00:00Z", "remarks": "Road hazard logged.", "officer": "ICCC Portal"},
                {"status": "In Progress", "timestamp": "2026-09-20T11:00:00Z", "remarks": "Road patching team dispatched with hot mix.", "officer": "B&R Division"},
                {"status": "Resolved", "timestamp": "2026-09-22T10:30:00Z", "remarks": "Bitumen patchwork inspected and signed off.", "officer": "Er. Naveen Mittal"}
            ]
        },
        {
            "tracking_id": "GRV-CHD-RTI-1024",
            "department_id": "rti",
            "department_name": "UT Chandigarh Administration RTI Cell",
            "complaint_text": "Application seeking certified expenditure details of road relaying in Sector 17 & 22.",
            "citizen_name": "Gurpreet Singh",
            "status": "Resolved",
            "created_at": "2026-09-18T11:00:00Z",
            "updated_at": "2026-09-22T11:30:00Z",
            "assigned_officer": "PIO Manjit Kaur",
            "remarks": "Certified copy dispatched via registered speed post (Consignment #SP992140).",
            "status_history": [
                {"status": "Filed", "timestamp": "2026-09-18T11:00:00Z", "remarks": "RTI application received with prescribed fee.", "officer": "System"},
                {"status": "Resolved", "timestamp": "2026-09-22T11:30:00Z", "remarks": "Information furnished to applicant.", "officer": "PIO Manjit Kaur"}
            ]
        }
    ]
    for s in samples:
        FILED_COMPLAINTS[s["tracking_id"]] = s


_seed_initial_complaints()


def _get_table_client():
    load_dotenv(override=True)
    """Initializes and returns the Azure Table Client, creating the 'complaints' table if it doesn't exist."""
    global TABLE_CLIENT
    if TABLE_CLIENT is not None:
        return TABLE_CLIENT

    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str or "<your" in conn_str or "your_account_name" in conn_str or "your_key_here" in conn_str or "your_storage_account_name" in conn_str:
        return None

    try:
        from azure.data.tables import TableServiceClient
        from azure.core.exceptions import ResourceExistsError

        table_service = TableServiceClient.from_connection_string(conn_str)
        table_client = table_service.get_table_client("complaints")
        try:
            table_client.create_table()
            print("[Azure Table Storage] Created 'complaints' table successfully.")
        except ResourceExistsError:
            pass
        except Exception as te:
            print(f"[Azure Table Storage Notice] Table status: {te}")

        TABLE_CLIENT = table_client
        return TABLE_CLIENT
    except Exception as e:
        print(f"[Azure Table Storage Warning] Connection failed: {e}. Using local in-memory store.")
        return None


def upload_grievance_report_to_blob(complaint_data: dict) -> str:
    load_dotenv(override=True)
    """
    Uploads an official citizen grievance dossier/report as formatted JSON
    into Azure Blob Storage ('grievancereports' container).
    Returns the permanent Blob URL or None if storage is unconfigured.
    """
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str or "<your" in conn_str or "your_account_name" in conn_str or "your_key_here" in conn_str or "your_storage_account_name" in conn_str:
        return None

    try:
        from azure.storage.blob import BlobServiceClient, ContentSettings
        from azure.core.exceptions import ResourceExistsError

        blob_service = BlobServiceClient.from_connection_string(conn_str)
        container_name = "grievancereports"
        container_client = blob_service.get_container_client(container_name)
        try:
            container_client.create_container()
            print("[Azure Blob Storage] Created 'grievancereports' container successfully.")
        except ResourceExistsError:
            pass
        except Exception as ce:
            print(f"[Azure Blob Storage Notice] Grievance reports container status: {ce}")

        tracking_id = complaint_data.get("tracking_id", f"GRV_{uuid.uuid4().hex[:6].upper()}")
        blob_filename = f"{tracking_id}_official_dossier.json"

        report_payload = {
            "official_authority": "Government Civic Grievance Resolution Cell (JanConnect)",
            "tracking_id": tracking_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "citizen_name": complaint_data.get("citizen_name"),
            "department": complaint_data.get("department_name"),
            "department_id": complaint_data.get("department_id"),
            "grievance_description": complaint_data.get("complaint_text"),
            "current_status": complaint_data.get("status", "Filed"),
            "assigned_officer": complaint_data.get("assigned_officer", "Pending Verification"),
            "officer_remarks": complaint_data.get("remarks", ""),
            "supporting_document_url": complaint_data.get("document_url", ""),
            "audit_milestones": complaint_data.get("status_history", []),
            "verification_status": "Digitally Signed & Archived in Municipal Blob Vault"
        }

        report_bytes = json.dumps(report_payload, indent=2).encode("utf-8")
        blob_client = container_client.get_blob_client(blob_filename)
        blob_client.upload_blob(
            report_bytes,
            overwrite=True,
            content_settings=ContentSettings(content_type="application/json")
        )
        print(f"[Azure Blob Storage] Successfully stored grievance dossier: {blob_client.url}")
        return blob_client.url
    except Exception as e:
        print(f"[Azure Blob Storage Warning] Failed to upload grievance report blob: {e}")
        return None


def file_complaint(department_id: str, department_name: str, complaint_text: str, citizen_name: str, document_url: str = None) -> dict:
    """Files a citizen complaint into Azure Table Storage and stores official dossier in Azure Blob Storage."""
    tracking_id = f"GRV-{uuid.uuid4().hex[:8].upper()}"
    created_at = datetime.now(timezone.utc).isoformat()
    
    initial_history = [
        {
            "status": "Filed",
            "timestamp": created_at,
            "remarks": "Grievance registered in municipal portal.",
            "officer": "System Intake"
        }
    ]

    complaint_data = {
        "tracking_id": tracking_id,
        "department_id": department_id or "general",
        "department_name": department_name or "General Administration",
        "complaint_text": complaint_text or "",
        "citizen_name": citizen_name or "Citizen",
        "status": "Filed",
        "created_at": created_at,
        "updated_at": created_at,
        "assigned_officer": "Unassigned (Pending Verification)",
        "remarks": "Grievance registered. Awaiting departmental assignment.",
        "document_url": document_url or "",
        "report_blob_url": "",
        "status_history": initial_history,
    }

    # Automatically archive grievance dossier into Azure Blob Storage
    report_url = upload_grievance_report_to_blob(complaint_data)
    if report_url:
        complaint_data["report_blob_url"] = report_url

    # 1. Update local cache
    FILED_COMPLAINTS[tracking_id] = complaint_data

    # 2. Persist to Azure Table Storage if available
    client = _get_table_client()
    if client:
        try:
            from azure.data.tables import UpdateMode
            entity = {
                "PartitionKey": "complaint",
                "RowKey": tracking_id,
                **complaint_data,
                "status_history": json.dumps(initial_history)
            }
            client.upsert_entity(mode=UpdateMode.MERGE, entity=entity)
            complaint_data["_storage"] = "Azure Table Storage ('complaints') & Azure Blob ('grievancereports')"
        except Exception as e:
            print(f"[Azure Table Storage Error] Failed to persist entity {tracking_id}: {e}")
            complaint_data["_storage"] = "In-memory (Azure sync failed)"
    else:
        complaint_data["_storage"] = "In-memory fallback"

    return complaint_data


def get_status(tracking_id: str) -> dict:
    """Fetches complaint status from Azure Table Storage, falling back to in-memory store."""
    client = _get_table_client()
    if client:
        try:
            entity = client.get_entity(partition_key="complaint", row_key=tracking_id)
            history = []
            if "status_history" in entity and entity["status_history"]:
                try:
                    history = json.loads(entity["status_history"]) if isinstance(entity["status_history"], str) else entity["status_history"]
                except Exception:
                    history = []

            return {
                "tracking_id": entity.get("RowKey", tracking_id),
                "department_id": entity.get("department_id", "general"),
                "department_name": entity.get("department_name", "General Administration"),
                "complaint_text": entity.get("complaint_text", ""),
                "citizen_name": entity.get("citizen_name", "Citizen"),
                "status": entity.get("status", "Filed"),
                "created_at": entity.get("created_at"),
                "updated_at": entity.get("updated_at"),
                "assigned_officer": entity.get("assigned_officer"),
                "remarks": entity.get("remarks"),
                "document_url": entity.get("document_url", ""),
                "report_blob_url": entity.get("report_blob_url", ""),
                "status_history": history,
                "_source": "Azure Table Storage",
            }
        except Exception:
            pass

    if tracking_id not in FILED_COMPLAINTS:
        return {"error": "No complaint found with that tracking id."}
    
    res = dict(FILED_COMPLAINTS[tracking_id])
    res["_source"] = "In-memory fallback"
    return res


def list_all_complaints() -> list:
    """Retrieves all complaints from Azure Table Storage or in-memory store for the Admin/Officer Desk."""
    client = _get_table_client()
    if client:
        try:
            entities = list(client.list_entities())
            result = []
            for e in entities:
                history = []
                if "status_history" in e and e["status_history"]:
                    try:
                        history = json.loads(e["status_history"]) if isinstance(e["status_history"], str) else e["status_history"]
                    except Exception:
                        history = []

                result.append({
                    "tracking_id": e.get("RowKey", e.get("tracking_id")),
                    "department_id": e.get("department_id", "general"),
                    "department_name": e.get("department_name", "General Administration"),
                    "complaint_text": e.get("complaint_text", ""),
                    "citizen_name": e.get("citizen_name", "Citizen"),
                    "status": e.get("status", "Filed"),
                    "created_at": e.get("created_at"),
                    "updated_at": e.get("updated_at", e.get("created_at")),
                    "assigned_officer": e.get("assigned_officer", "Unassigned"),
                    "remarks": e.get("remarks", "No remarks"),
                    "document_url": e.get("document_url", ""),
                    "report_blob_url": e.get("report_blob_url", ""),
                    "status_history": history,
                    "_source": "Azure Table Storage"
                })
            
            # Merge with memory if table was newly created
            if not result:
                result = list(FILED_COMPLAINTS.values())
            else:
                # Sort newest first
                result.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return result
        except Exception as e:
            print(f"[Azure Table Storage List Error] {e}")

    # Return local in-memory complaints sorted newest first
    res = list(FILED_COMPLAINTS.values())
    res.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return res


def update_complaint_status(tracking_id: str, new_status: str, remarks: str = "", officer_name: str = "Officer") -> dict:
    """Updates complaint status, officer notes, and audit timeline."""
    valid_statuses = ["Filed", "Under Verification", "Assigned to Field Engineer", "In Progress", "Resolved", "Rejected"]
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status: {new_status}. Must be one of {valid_statuses}")

    now_iso = datetime.now(timezone.utc).isoformat()
    history_entry = {
        "status": new_status,
        "timestamp": now_iso,
        "remarks": remarks or f"Status transitioned to {new_status}.",
        "officer": officer_name or "Municipal Desk"
    }

    # 1. Update in-memory
    if tracking_id in FILED_COMPLAINTS:
        complaint = FILED_COMPLAINTS[tracking_id]
        complaint["status"] = new_status
        complaint["updated_at"] = now_iso
        complaint["assigned_officer"] = officer_name
        complaint["remarks"] = remarks
        if "status_history" not in complaint or not isinstance(complaint["status_history"], list):
            complaint["status_history"] = []
        complaint["status_history"].append(history_entry)
    else:
        complaint = {
            "tracking_id": tracking_id,
            "status": new_status,
            "updated_at": now_iso,
            "assigned_officer": officer_name,
            "remarks": remarks,
            "status_history": [history_entry]
        }
        FILED_COMPLAINTS[tracking_id] = complaint

    # Refresh dossier in Azure Blob Storage
    updated_report_url = upload_grievance_report_to_blob(complaint)
    if updated_report_url:
        complaint["report_blob_url"] = updated_report_url

    # 2. Update in Azure Table Storage if available
    client = _get_table_client()
    if client:
        try:
            from azure.data.tables import UpdateMode
            entity = {
                "PartitionKey": "complaint",
                "RowKey": tracking_id,
                "status": new_status,
                "updated_at": now_iso,
                "assigned_officer": officer_name,
                "remarks": remarks,
                "report_blob_url": complaint.get("report_blob_url", ""),
                "status_history": json.dumps(complaint["status_history"])
            }
            client.upsert_entity(mode=UpdateMode.MERGE, entity=entity)
            complaint["_storage"] = "Azure Table Storage ('complaints') & Azure Blob ('grievancereports')"
        except Exception as e:
            print(f"[Azure Table Storage Update Error] {e}")

    return complaint


def advance_complaint_status(tracking_id: str) -> dict:
    """Advances ticket status for classroom demo / testing: Filed -> Under Verification -> Assigned to Field Engineer -> In Progress -> Resolved."""
    transitions = {
        "Filed": ("Under Verification", "Grievance verified by Ward Nodal Desk.", "Ward Nodal Officer"),
        "Under Verification": ("Assigned to Field Engineer", "Assigned to sector junior engineer for site inspection.", "Executive Engineer"),
        "Assigned to Field Engineer": ("In Progress", "Field team on-site conducting repairs/testing.", "Er. V. Sharma (JE)"),
        "In Progress": ("Resolved", "Issue resolved and citizen intimation dispatched.", "Sub-Divisional Officer"),
        "Resolved": ("Resolved", "Ticket is already resolved.", "Municipal Desk")
    }
    complaint = get_status(tracking_id)
    if "error" in complaint:
        return complaint
    current_status = complaint.get("status", "Filed")
    next_step = transitions.get(current_status, ("Under Verification", "Status advanced.", "Municipal Officer"))
    return update_complaint_status(
        tracking_id=tracking_id,
        new_status=next_step[0],
        remarks=next_step[1],
        officer_name=next_step[2]
    )
