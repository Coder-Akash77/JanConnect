import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS

from services import intake, extraction, routing, agents, filing, speech, policy_qa


app = Flask(__name__)
CORS(app)



def _resolve_complaint_from_request(body: dict) -> dict:
    """Helper to resolve complaint from either an existing ID or manual custom user input."""
    if not body:
        raise ValueError("Missing request body")

    if "raw_text" in body and body["raw_text"].strip():
        raw_text = body["raw_text"].strip()
        citizen_name = body.get("citizen_name", "").strip() or "Citizen"
        
        # Live Azure Translator detection & translation
        trans_res = intake.translate_text(raw_text)
        return {
            "id": "manual_submission",
            "citizen_name": citizen_name,
            "language": trans_res.get("language", "en"),
            "raw_text": raw_text,
            "translated_text": trans_res.get("translated_text"),
        }
    elif "complaint_id" in body:
        return intake.get_complaint(body["complaint_id"])
    else:
        raise ValueError("Must provide either 'raw_text' or 'complaint_id'")


@app.route("/api/health", methods=["GET"])
def health_endpoint():
    """System health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Chandigarh JanConnect",
        "version": "2.0.0",
        "pilot": "UT Chandigarh"
    })


@app.route("/api/complaints", methods=["GET"])
def list_complaints():
    """List available mock complaints."""
    return jsonify(intake.list_complaints())


@app.route("/api/complaint/<complaint_id>", methods=["GET"])
def get_complaint(complaint_id):
    """Stage 1: intake."""
    try:
        return jsonify(intake.get_complaint(complaint_id))
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/departments", methods=["GET"])
def get_departments_endpoint():
    """Returns dynamic Chandigarh municipal departments catalog."""
    mock_file = os.path.join(os.path.dirname(__file__), "mock_data", "department_policies.json")
    if os.path.exists(mock_file):
        with open(mock_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return jsonify([
                {
                    "id": k,
                    "name": v.get("department_name"),
                    "authority": v.get("official_authority", "Municipal Corporation Chandigarh (MCC)"),
                    "office": v.get("office_location", "Sector 17, Chandigarh"),
                    "helpline": v.get("helpline", "0172-2787200"),
                    "sla": "15 working days" if k == "water" else "7 working days" if k == "electricity" else "24 to 48 hours" if k == "sanitation" else "7 working days",
                    "icon": "💧" if k == "water" else "⚡" if k == "electricity" else "🗑️" if k == "sanitation" else "🚧" if k == "roads" else "📜",
                    "badgeClass": f"badge-{k}",
                    "keywords": v.get("keywords", []),
                    "policies": v.get("policy_snippets", [])
                }
                for k, v in data.items()
            ])
    return jsonify([])


@app.route("/api/grievances", methods=["GET"])
def list_grievances_endpoint():
    """Lists all complaints filed in Azure Table Storage / persistent DB."""
    return jsonify(filing.list_all_complaints())


@app.route("/api/documents", methods=["GET"])
def list_documents():
    return jsonify(extraction.list_available_mock_documents())


@app.route("/api/extract/<doc_id>", methods=["GET"])
def extract(doc_id):
    """Stage 2: document extraction (mock ID)."""
    try:
        return jsonify(extraction.extract_document(doc_id))
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/extract-text", methods=["POST"])
def extract_text_endpoint():
    """Stage 2: extract entities from custom pasted text."""
    body = request.get_json() or {}
    text = body.get("text", "").strip()
    if not text:
        return jsonify({"error": "No document text provided"}), 400
    return jsonify(extraction.extract_document_from_text(text))


@app.route("/api/extract-file", methods=["POST"])
def extract_file_endpoint():
    """Stage 2: extract entities from uploaded document file using Azure Document Intelligence."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded in request"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    
    file_bytes = file.read()
    content_type = file.content_type or "application/pdf"
    result = extraction.extract_document_from_bytes(file_bytes, content_type=content_type, filename=file.filename)
    return jsonify(result)



@app.route("/api/route", methods=["POST"])
def route_endpoint():
    """Stage 3: department routing (supports custom text or mock id)."""
    try:
        body = request.get_json() or {}
        complaint = _resolve_complaint_from_request(body)
        text = intake.working_text(complaint)
        result = routing.route_complaint(text)
        return jsonify({"complaint": complaint, "routing": result})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/respond", methods=["POST"])
def respond_endpoint():
    """Stage 4: department agent response (supports custom text or mock id)."""
    try:
        body = request.get_json() or {}
        complaint = _resolve_complaint_from_request(body)
        text = intake.working_text(complaint)
        routing_result = routing.route_complaint(text)
        response = agents.mock_department_response(routing_result["department_id"], text)
        return jsonify({"complaint": complaint, "routing": routing_result, "response": response})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/transcribe-audio", methods=["POST"])
def transcribe_audio_endpoint():
    """Stage 1: Speech-to-Text audio file transcription via Azure Speech SDK."""
    if "file" not in request.files:
        return jsonify({"error": "No audio file provided in request"}), 400
    
    audio_file = request.files["file"]
    if audio_file.filename == "":
        return jsonify({"error": "Empty audio filename"}), 400
    
    file_bytes = audio_file.read()
    content_type = audio_file.content_type or "audio/wav"
    result = speech.transcribe_audio(file_bytes, filename=audio_file.filename, content_type=content_type)
    return jsonify(result)


@app.route("/api/file-complaint", methods=["POST"])
def file_complaint_endpoint():
    """Stage 5: filing (supports custom text or mock id)."""
    try:
        body = request.get_json() or {}
        complaint = _resolve_complaint_from_request(body)
        text = intake.working_text(complaint)
        routing_result = routing.route_complaint(text)
        filed = filing.file_complaint(
            department_id=routing_result["department_id"] or "general",
            department_name=routing_result["department_name"],
            complaint_text=text,
            citizen_name=complaint.get("citizen_name", "Citizen"),
            document_url=body.get("document_url")
        )
        return jsonify(filed)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/status/<tracking_id>", methods=["GET"])
def status_endpoint(tracking_id):
    return jsonify(filing.get_status(tracking_id))


@app.route("/api/status/<tracking_id>/advance", methods=["POST"])
def advance_status_endpoint(tracking_id):
    """Classroom demo route to advance lifecycle of a grievance ticket."""
    try:
        return jsonify(filing.advance_complaint_status(tracking_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/admin/complaints", methods=["GET"])
def admin_complaints_endpoint():
    """Admin / Officer Desk: lists all complaints and computes operational metrics."""
    complaints = filing.list_all_complaints()

    # Calculate operational metrics
    total = len(complaints)
    open_count = sum(1 for c in complaints if c.get("status") in ["Filed", "Under Verification"])
    in_progress_count = sum(1 for c in complaints if c.get("status") in ["Assigned to Field Engineer", "In Progress"])
    resolved_count = sum(1 for c in complaints if c.get("status") == "Resolved")

    by_department = {}
    for c in complaints:
        dept = c.get("department_name", "Unclassified")
        by_department[dept] = by_department.get(dept, 0) + 1

    return jsonify({
        "complaints": complaints,
        "metrics": {
            "total": total,
            "open": open_count,
            "in_progress": in_progress_count,
            "resolved": resolved_count,
            "by_department": by_department
        }
    })


@app.route("/api/admin/update-status", methods=["POST"])
def admin_update_status_endpoint():
    """Admin / Officer Desk: updates complaint status, resolution notes, and officer assignment."""
    try:
        body = request.get_json() or {}
        tracking_id = (body.get("tracking_id") or "").strip()
        new_status = (body.get("status") or body.get("new_status") or "").strip()
        remarks = (body.get("remarks") or "").strip()
        officer_name = (body.get("officer_name") or "").strip() or "Municipal Desk Officer"

        if not tracking_id or not new_status:
            return jsonify({"error": "tracking_id and status are required fields."}), 400

        updated = filing.update_complaint_status(
            tracking_id=tracking_id,
            new_status=new_status,
            remarks=remarks,
            officer_name=officer_name
        )
        return jsonify({"success": True, "complaint": updated})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to update status: {str(e)}"}), 500


# ========================================================
# POLICY CLARIFIER & DOUBTS RESOLUTION (Q&A + TRANSLATION)
# ========================================================

@app.route("/api/policy/samples", methods=["GET"])
def list_policy_samples_endpoint():
    """Returns catalog of pre-loaded official government schemes."""
    return jsonify(policy_qa.list_sample_policies())


@app.route("/api/policy/sample/<policy_id>", methods=["GET"])
def get_policy_sample_endpoint(policy_id):
    """Returns full text of a pre-loaded scheme."""
    policy = policy_qa.get_sample_policy(policy_id)
    if not policy:
        return jsonify({"error": f"Unknown policy id: {policy_id}"}), 404
    return jsonify(policy)


@app.route("/api/policy/extract", methods=["POST"])
def extract_policy_endpoint():
    """Extracts text from uploaded policy document (PDF/Image/Text)."""
    if "file" in request.files:
        f = request.files["file"]
        if f.filename == "":
            return jsonify({"error": "Empty filename"}), 400
        file_bytes = f.read()
        content_type = f.content_type or "application/pdf"
        result = policy_qa.extract_policy_content(file_bytes, filename=f.filename, content_type=content_type)
        return jsonify(result)

    body = request.get_json() or {}
    raw_text = body.get("text", "").strip()
    if not raw_text:
        return jsonify({"error": "Provide either an uploaded file or 'text' in body."}), 400

    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    title = lines[0][:100] if lines else "Government Policy Document"
    summary = lines[1][:250] if len(lines) > 1 else "Custom pasted official policy."
    blob_url = policy_qa.upload_policy_to_blob(raw_text.encode("utf-8"), filename="custom_policy.txt", content_type="text/plain")
    return jsonify({
        "title": title,
        "filename": "custom_policy.txt",
        "text": raw_text,
        "summary": summary,
        "char_count": len(raw_text),
        "blob_url": blob_url or "",
        "source": "Direct text input (Archived to Azure Blob)" if blob_url else "Direct text input"
    })


@app.route("/api/policy/ask", methods=["POST"])
def ask_policy_endpoint():
    """Answers citizen doubt grounded in policy text with clause citations."""
    body = request.get_json() or {}
    policy_text = body.get("policy_text", "").strip()
    question = body.get("question", "").strip()
    target_lang = body.get("language", "en").strip()

    if not policy_text:
        return jsonify({"error": "Missing 'policy_text' in request."}), 400
    if not question:
        return jsonify({"error": "Missing 'question' in request."}), 400

    result = policy_qa.answer_policy_doubt(policy_text, question, target_lang=target_lang)
    return jsonify(result)


@app.route("/api/policy/translate", methods=["POST"])
def translate_policy_endpoint():
    """Translates policy answer into target Indian regional language."""
    body = request.get_json() or {}
    text = body.get("text", "").strip()
    target_lang = body.get("target_lang", "hi").strip()

    if not text:
        return jsonify({"error": "Missing 'text' to translate."}), 400

    res = intake.translate_to_language(text, target_lang=target_lang)
    return jsonify(res)


if __name__ == "__main__":
    app.run(debug=True, port=5001)


