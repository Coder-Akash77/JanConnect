"""
End-to-End API Integration Test Suite for Chandigarh JanConnect

Exercises every Flask endpoint with live Azure AI services, Chandigarh sector detection,
and Azure Table Storage.
"""

import os
import sys

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

import json
import io
from app import app


client = app.test_client()

print("\n" + "="*70)
print("     Chandigarh JanConnect End-to-End Live API Integration Test")
print("="*70 + "\n")

all_passed = True

def report(endpoint: str, success: bool, details: str):
    global all_passed
    if not success:
        all_passed = False
    badge = "[PASS]" if success else "[FAIL]"
    print(f" {badge} {endpoint: <34} | {details}")


# 1. Health check
res = client.get("/api/health")
data = res.get_json() or {}
report("GET /api/health", res.status_code == 200, f"Status: {data.get('status')}")

# 2. List complaints
res = client.get("/api/complaints")
data = res.get_json() or []
report("GET /api/complaints", res.status_code == 200 and len(data) >= 4, f"Loaded {len(data)} Chandigarh complaints")

# 3. Route endpoint: Sector 35 Streetlight (Hindi) -> MCC Roads & Infrastructure
hindi_complaint = "Sector 35-C ke inner park ki street lights pichhle 5 din se band hain, andhera rehta hai."
res = client.post("/api/route", json={"raw_text": hindi_complaint, "citizen_name": "Sunita Aggarwal"})
data = res.get_json() or {}
dept_id = data.get("routing", {}).get("department_id")
detected_sec = data.get("routing", {}).get("detected_sector")
report(
    "POST /api/route (Hindi Streetlight)",
    res.status_code == 200 and dept_id == "roads",
    f"Sector: {detected_sec}, Routed to: {dept_id}"
)

# 4. Route endpoint: Manimajra Power Cut (Punjabi) -> CPDL Electricity
punjabi_complaint = "Manimajra sub-division vich pichhle 4 ghante to bijli band hai. 19121 te koi phone nahi chuk reha."
res = client.post("/api/route", json={"raw_text": punjabi_complaint, "citizen_name": "Gurpreet Singh"})
data = res.get_json() or {}
dept_id = data.get("routing", {}).get("department_id")
detected_sec = data.get("routing", {}).get("detected_sector")
report(
    "POST /api/route (Punjabi Power Outage)",
    res.status_code == 200 and dept_id == "electricity",
    f"Sector: {detected_sec}, Routed to: {dept_id}"
)

# 5. Route endpoint: Sector 46 Waste Missed -> MCC Sanitation (MOH)
sanitation_complaint = "The door-to-door garbage collection vehicle has missed Sector 46 for 2 days. Kooda is piling up."
res = client.post("/api/route", json={"raw_text": sanitation_complaint, "citizen_name": "Deepak Mehta"})
data = res.get_json() or {}
dept_id = data.get("routing", {}).get("department_id")
detected_sec = data.get("routing", {}).get("detected_sector")
report(
    "POST /api/route (Sanitation & Waste)",
    res.status_code == 200 and dept_id == "sanitation",
    f"Sector: {detected_sec}, Routed to: {dept_id}"
)

# 6. Respond endpoint (Intake -> Translate -> Route -> Azure AI Search Grounding -> GPT-5-mini)
water_complaint = "Water bill received via e-Sampark in Sector 22 is inflated to Rs. 4850. Defective meter suspected."
res = client.post("/api/respond", json={"raw_text": water_complaint, "citizen_name": "Virender Sharma"})
data = res.get_json() or {}
answer = data.get("response", {}).get("answer", "")
source = data.get("response", {}).get("source", "")
report(
    "POST /api/respond (Grounded Agent)",
    res.status_code == 200 and len(answer) > 20,
    f"Source: {source} (Response length: {len(answer)} chars)"
)

# 7. File Complaint (Persist to Azure Table Storage)
res = client.post("/api/file-complaint", json={
    "raw_text": water_complaint,
    "citizen_name": "Virender Sharma"
})
data = res.get_json() or {}
tracking_id = data.get("tracking_id", "")
storage_engine = data.get("_storage", "")
sla_days = data.get("sla_target_days", 0)
report(
    "POST /api/file-complaint (Azure Table)",
    res.status_code == 200 and tracking_id.startswith("GRV-"),
    f"Ticket: {tracking_id}, SLA: {sla_days} days, Stored In: {storage_engine}"
)

# 8. Status Lookup (Fetch from Azure Table Storage)
if tracking_id:
    res = client.get(f"/api/status/{tracking_id}")
    data = res.get_json() or {}
    report(
        "GET /api/status/<id> (Azure Table)",
        res.status_code == 200 and data.get("tracking_id") == tracking_id,
        f"Fetched Status: {data.get('status')}, Dept: {data.get('department_name')}"
    )

    # 9. Advance Status (Lifecycle mutation in Azure Table Storage)
    res = client.post(f"/api/status/{tracking_id}/advance")
    data = res.get_json() or {}
    report(
        "POST /api/status/<id>/advance",
        res.status_code == 200 and data.get("status") in ["Under Verification", "Assigned to Field Officer"],
        f"Advanced Status: {data.get('status')}"
    )

# 10. Document Intelligence Entity Extraction (Azure OpenAI gpt-5-mini)
chd_bill = "MUNICIPAL CORPORATION CHANDIGARH WATER BILL\nAccount Number: CHD-WTR-22B-8902\nConsumer Name: Virender Sharma\nAmount Due: Rs. 4,850\nAddress: Sector 22-B, Chandigarh"
res = client.post("/api/extract-text", json={"text": chd_bill})
data = res.get_json() or {}
report(
    "POST /api/extract-text (GPT-5-mini)",
    res.status_code == 200 and len(data) >= 2,
    f"Extracted fields: {list(data.keys())[:3]}"
)

# 11. Document File Ingestion (Multipart attachment)
dummy_file = io.BytesIO(b"CHANDIGARH CIVIC RECORD: Account #CPDL-DS-35C-4410, Citizen: Harpreet Singh, Amount: 2640")
res = client.post("/api/extract-file", data={
    "file": (dummy_file, "cpdl_bill.txt")
}, content_type="multipart/form-data")
data = res.get_json() or {}
report(
    "POST /api/extract-file (Doc Intel)",
    res.status_code == 200 and len(data) > 0,
    f"Source: {data.get('_source')}"
)

print("\n" + "="*70)
if all_passed:
    print("      ALL CHANDIGARH E2E LIVE API INTEGRATION TESTS PASSED! 🚀")
else:
    print("      ONE OR MORE TESTS FAILED — CHECK LOGS ABOVE.")
print("="*70 + "\n")
