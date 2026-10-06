"""
JanConnect Azure Cloud Sync & Seeding Utility
Synchronizes:
1. Chandigarh Municipal Policies -> Azure AI Search (department-policies-index)
2. Chandigarh Department Matrix & SLAs -> Azure Table Storage (departments table)
3. Ensures Azure Blob Storage container (citizendocuments) is ready
"""

import os
import json
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.data.tables import TableServiceClient, TableClient
from azure.storage.blob import BlobServiceClient

ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(ENV_PATH)

CHANDIGARH_POLICIES_DOCS = [
    {
        "uid": "mcc-water-supply-policy-chd",
        "h1_header": "MCC Water Supply & Sewerage Operations (Public Health Wing)",
        "snippet": (
            "Municipal Corporation Chandigarh (MCC) Public Health Wing - Water Supply & Sewerage: "
            "A citizen may request water meter re-verification or dispute an inflated water bill within 30 days of bill receipt via e-Sampark centers or online. "
            "Disputed water bills are verified and re-metered within 15 working days under Chandigarh Right to Service (RTS) Rule 4. "
            "No testing fee is charged if the meter is found defective (+/- 3% error). "
            "Major pipeline leakages or contamination in sector lines must be inspected within 4 hours and repaired within 24 to 48 hours. "
            "Sewerage blockages and overflowing manholes are cleared via super-suction machines within 24 hours. "
            "Official Helplines: Water Supply Complaint Cell 0172-2540200, MCC ICCC 0172-2787200, e-Sampark 1800-180-1725."
        )
    },
    {
        "uid": "cpdl-electricity-policy-chd",
        "h1_header": "Chandigarh Power Distribution Limited (CPDL) / Electricity Dept",
        "snippet": (
            "Chandigarh Power Distribution Limited (CPDL) / Electricity Department UT Chandigarh: "
            "Power supply interruptions and outages in urban sectors must be restored within 4 hours under Chandigarh RTS Rule 2. "
            "In case of 11kV feeder tripping or distribution transformer burnout, replacement and supply restoration must be completed within 24 to 72 hours. "
            "Defective or burnt electricity meters must be inspected within 7 working days and replaced within 15 working days. "
            "Escalation Matrix: Unresolved outages exceeding 2 hours escalate to Sub-Divisional Officer (SDO); exceeding 4 hours escalate to Executive Engineer (XEN). "
            "Consumer Grievance Redressal Forum (CGRF) is located at Sector 18, Chandigarh. "
            "Official Helplines: 24x7 Electricity Call Centre 19121, Online portal chandigarhpower.com."
        )
    },
    {
        "uid": "mcc-sanitation-waste-policy-chd",
        "h1_header": "MCC Medical Officer of Health (MOH) — Sanitation & Waste Management",
        "snippet": (
            "Municipal Corporation Chandigarh (MCC) MOH Wing - Sanitation & Waste Management: "
            "Under Swachh Bharat & Chandigarh Municipal Solid Waste Rules, missed segregated door-to-door garbage collection vehicle must be resolved within 24 hours. "
            "Open garbage piles, overflowing Sehaj Safai Kendras (SSKs), or dead animal removal complaints must be cleared within 12 to 24 hours. "
            "Dadumajra waste plant or storm-water drain choking complaints must be addressed within 48 hours. "
            "Official Helplines: Dedicated MCC WhatsApp Grievance Hotline 9915762917, MCC ICCC 0172-2787200."
        )
    },
    {
        "uid": "mcc-roads-infrastructure-policy-chd",
        "h1_header": "MCC Buildings & Roads (B&R) — Streetlights & Infrastructure",
        "snippet": (
            "Municipal Corporation Chandigarh (MCC) B&R Division - Streetlights & Roads: "
            "Non-functional LED streetlights on sector roads (V3, V4, V5, V6) or dark spots must be repaired within 3 to 7 working days under the EESL contract. "
            "Dangerous potholes, road cave-ins, or broken footpaths on municipal sector roads must be repaired with bitumen patchwork within 7 working days under RTS Rule 6. "
            "Overgrown tree branches obstructing streetlights or road signages must be pruned by the horticulture wing within 5 working days. "
            "Official Helplines: MCC ICCC 0172-2787200, e-Sampark 1800-180-1725."
        )
    },
    {
        "uid": "chandigarh-right-to-service-policy-chd",
        "h1_header": "Punjab Right to Service (RTS) Act as Extended to UT Chandigarh",
        "snippet": (
            "Punjab Right to Service (RTS) Act as applicable to Union Territory of Chandigarh: "
            "Citizens are legally entitled to public services within notified statutory timelines. "
            "Failure by designated officers to provide services within notified RTS timelines attracts financial penalties and disciplinary action under the Chandigarh Right to Service Commission. "
            "Appeals can be filed before the First Appellate Authority within 30 days of timeline expiry."
        )
    }
]

CHANDIGARH_DEPARTMENTS = [
    {
        "PartitionKey": "chandigarh",
        "RowKey": "water",
        "department_id": "water",
        "department_name": "MCC Water Supply & Sewerage Operations (Public Health Wing)",
        "official_authority": "Municipal Corporation Chandigarh (MCC)",
        "office_location": "New Deluxe Building, Sector 17, Chandigarh",
        "helpline": "0172-2540200 / 0172-2787200",
        "sla_description": "15 working days for bill disputes, 24-48h for main leaks (RTS Rule 4)",
        "sla_days": 15,
        "icon": "💧",
        "badge_class": "badge-water",
        "keywords_json": json.dumps(["water", "meter", "bill", "pipeline", "leak", "sewerage", "tap", "pani", "paani", "low pressure", "e-sampark", "contamination"]),
        "policy_summary": "Disputed water bills received via e-Sampark re-metered within 15 working days. Leaks repaired in 24-48h."
    },
    {
        "PartitionKey": "chandigarh",
        "RowKey": "electricity",
        "department_id": "electricity",
        "department_name": "Chandigarh Power Distribution Limited (CPDL)",
        "official_authority": "Electricity Department, UT Chandigarh Administration",
        "office_location": "UT Secretariat, Sector 18, Chandigarh",
        "helpline": "19121 (24x7 Call Centre)",
        "sla_description": "4 hours for outages, 7 days for meter inspection, 15 days replacement (RTS Rule 2)",
        "sla_days": 7,
        "icon": "⚡",
        "badge_class": "badge-electricity",
        "keywords_json": json.dumps(["electricity", "power", "outage", "bijli", "transformer", "feeder", "voltage", "burnt meter", "cpdl", "19121", "powercut", "batti"]),
        "policy_summary": "Power outages restored within 4 hours. Defective meters inspected in 7 days and replaced in 15 days."
    },
    {
        "PartitionKey": "chandigarh",
        "RowKey": "sanitation",
        "department_id": "sanitation",
        "department_name": "MCC Medical Officer of Health (MOH) — Sanitation & Waste",
        "official_authority": "Municipal Corporation Chandigarh (MCC)",
        "office_location": "MOH Wing, Sector 17, Chandigarh",
        "helpline": "WhatsApp: 9915762917 / ICCC: 0172-2787200",
        "sla_description": "24 hours for missed door-to-door pickup, 12-24h for open dumps",
        "sla_days": 2,
        "icon": "🗑️",
        "badge_class": "badge-sanitation",
        "keywords_json": json.dumps(["sanitation", "garbage", "waste", "kooda", "kachra", "safai", "dustbin", "dumper", "door to door", "ssk", "dadumajra", "tipper"]),
        "policy_summary": "Missed door-to-door garbage collection resolved within 24h. WhatsApp hotline: 9915762917."
    },
    {
        "PartitionKey": "chandigarh",
        "RowKey": "roads",
        "department_id": "roads",
        "department_name": "MCC Roads, Streetlights & Infrastructure (B&R Division)",
        "official_authority": "Municipal Corporation Chandigarh (MCC)",
        "office_location": "B&R Division, Sector 17, Chandigarh",
        "helpline": "0172-2787200 / e-Sampark: 1800-180-1725",
        "sla_description": "3-7 working days for LED streetlights, 7 working days for pothole repair (RTS Rule 6)",
        "sla_days": 7,
        "icon": "🚧",
        "badge_class": "badge-roads",
        "keywords_json": json.dumps(["road", "roads", "streetlight", "street light", "pothole", "potholes", "sadak", "gaddha", "khamba", "dark spot", "footpath", "caving"]),
        "policy_summary": "Defective LED streetlights repaired in 3-7 working days. Dangerous potholes patched in 7 working days."
    }
]


def sync_azure_search():
    endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
    key = os.getenv("AZURE_SEARCH_KEY")
    index = os.getenv("AZURE_SEARCH_INDEX", "department-policies-index")
    
    print("\n[1/3] Syncing Chandigarh Policy Documents to Azure AI Search...")
    client = SearchClient(endpoint=endpoint, index_name=index, credential=AzureKeyCredential(key))
    results = client.merge_or_upload_documents(documents=CHANDIGARH_POLICIES_DOCS)
    for r in results:
        status = "[OK] Uploaded" if r.succeeded else f"[FAILED] {r.error_message}"
        print(f"  - {r.key}: {status}")


def sync_azure_table_departments():
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    print("\n[2/3] Seeding Departments into Azure Table Storage ('departments')...")
    service = TableServiceClient.from_connection_string(conn_str)
    service.create_table_if_not_exists("departments")
    table = service.get_table_client("departments")

    for dept in CHANDIGARH_DEPARTMENTS:
        table.upsert_entity(dept)
        print(f"  - Upserted department: {dept['RowKey']} ({dept['department_name']})")


def sync_azure_blob_container():
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    print("\n[3/3] Verifying Azure Blob Storage Container ('citizendocuments')...")
    blob_service = BlobServiceClient.from_connection_string(conn_str)
    container = blob_service.get_container_client("citizendocuments")
    if not container.exists():
        container.create_container()
        print("  - Created 'citizendocuments' container.")
    else:
        print("  - 'citizendocuments' container is ready.")


if __name__ == "__main__":
    print("==================================================")
    print("   JanConnect Cloud Sync to Active Azure Services")
    print("==================================================")
    sync_azure_search()
    sync_azure_table_departments()
    sync_azure_blob_container()
    print("\n[SUCCESS] Azure Cloud Synchronization Complete!")
