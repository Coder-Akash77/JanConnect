"""
Stage 2: Document Extraction & Content Understanding

Supports:
1. Live Azure Document Intelligence SDK (prebuilt-layout model) for OCR and layout parsing on uploaded files.
2. Azure OpenAI (gpt-5-mini) with robust JSON parsing to structure extracted OCR text into rich municipal key-value entities.
3. Fallback to mock documents for testing.
"""

import io
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

MOCK_PATH = os.path.join(
    os.path.dirname(__file__), "..", "mock_data", "citizen_documents.json"
)


def _load_documents():
    with open(MOCK_PATH, "r") as f:
        return json.load(f)


def extract_document(doc_id: str) -> dict:
    """Fallback / Mock document loader."""
    docs = _load_documents()
    if doc_id not in docs:
        raise ValueError(f"Unknown mock document id: {doc_id}")
    return docs[doc_id]


import uuid

def list_available_mock_documents() -> list:
    return list(_load_documents().keys())


def upload_document_to_blob(file_bytes: bytes, filename: str = "document.pdf", content_type: str = "application/pdf") -> str:
    """
    Uploads an uploaded citizen document to Azure Blob Storage ('citizendocuments' container).
    Returns the blob URL or None if unconfigured/failed.
    """
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str or "<your" in conn_str or "your_account_name" in conn_str or "your_key_here" in conn_str or "your_storage_account_name" in conn_str:
        return None

    try:
        from azure.storage.blob import BlobServiceClient, ContentSettings
        from azure.core.exceptions import ResourceExistsError

        blob_service = BlobServiceClient.from_connection_string(conn_str)
        container_name = "citizendocuments"
        container_client = blob_service.get_container_client(container_name)
        try:
            container_client.create_container()
            print("[Azure Blob Storage] Created 'citizendocuments' container successfully.")
        except ResourceExistsError:
            pass
        except Exception as ce:
            print(f"[Azure Blob Storage Notice] Container status: {ce}")

        safe_filename = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename or "document.pdf")
        unique_name = f"{uuid.uuid4().hex[:8]}_{safe_filename}"
        blob_client = container_client.get_blob_client(unique_name)
        blob_client.upload_blob(
            file_bytes,
            overwrite=True,
            content_settings=ContentSettings(content_type=content_type or "application/pdf")
        )
        print(f"[Azure Blob Storage] Successfully stored document: {blob_client.url}")
        return blob_client.url
    except Exception as e:
        print(f"[Azure Blob Storage Warning] Failed to upload document blob: {e}")
        return None


def extract_document_from_bytes(file_bytes: bytes, content_type: str = "application/pdf", filename: str = "document.pdf") -> dict:
    """
    Analyzes an uploaded citizen document (PDF, PNG, JPG) using Azure Document Intelligence,
    persists the document to Azure Blob Storage if available,
    then formats structured entities via Azure OpenAI.
    """
    blob_url = upload_document_to_blob(file_bytes, filename=filename, content_type=content_type)

    endpoint = os.getenv("AZURE_DOC_INTEL_ENDPOINT")
    key = os.getenv("AZURE_DOC_INTEL_KEY")
    extracted_text = ""

    if endpoint and key and "<your" not in endpoint:
        try:
            from azure.core.credentials import AzureKeyCredential
            from azure.ai.documentintelligence import DocumentIntelligenceClient

            client = DocumentIntelligenceClient(
                endpoint=endpoint,
                credential=AzureKeyCredential(key)
            )

            # Analyze document with prebuilt-layout
            poller = client.begin_analyze_document(
                model_id="prebuilt-layout",
                body=io.BytesIO(file_bytes),
                content_type=content_type or "application/pdf"
            )
            result = poller.result()

            if hasattr(result, "content") and result.content:
                extracted_text = result.content
                print(f"[Doc Intel Success] Extracted {len(extracted_text)} characters of OCR text.")

        except Exception as e:
            print(f"[Azure Document Intelligence Warning] {e}")

    # If OCR text was retrieved, extract structured entities using Azure OpenAI
    if extracted_text:
        structured = extract_document_from_text(extracted_text)
        structured["_source"] = "Azure Document Intelligence + Azure OpenAI (GPT-5-mini)"
        if blob_url:
            structured["_blob_url"] = blob_url
        return structured

    # Fallback to local text extraction if OCR is unavailable
    try:
        raw_preview = file_bytes[:2000].decode("utf-8", errors="ignore")
        fallback = extract_document_from_text(raw_preview)
        if blob_url:
            fallback["_blob_url"] = blob_url
        return fallback
    except Exception:
        fallback = {"DOCUMENT_TYPE": "Uploaded Document", "STATUS": "File received"}
        if blob_url:
            fallback["_blob_url"] = blob_url
        return fallback



def extract_document_from_text(doc_text: str) -> dict:
    """
    Uses Azure OpenAI (gpt-5-mini) to extract all structured key-value entities
    from raw/pasted/OCR document text with robust JSON sanitization.
    """
    openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    openai_key = os.getenv("AZURE_OPENAI_KEY")
    openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-mini")

    if openai_endpoint and openai_key and "<your" not in openai_endpoint:
        try:
            from openai import AzureOpenAI

            client = AzureOpenAI(
                azure_endpoint=openai_endpoint,
                api_key=openai_key,
                api_version="2024-12-01-preview",
            )

            prompt = (
                "You are an expert document analysis engine for Indian civic and municipal records (electricity bills, water bills, voter ID, RTI forms, property tax).\n"
                "Extract ALL available details from the document text below into a clean JSON dictionary.\n\n"
                "Include all identifiable fields present in the text, such as:\n"
                "- SERVICE_PROVIDER (e.g. Tata Power-DDL, Delhi Jal Board, PSPCL)\n"
                "- CITIZEN_NAME / CONSUMER_NAME\n"
                "- CA_NUMBER / CONSUMER_NUMBER / ACCOUNT_NUMBER\n"
                "- BILL_DATE\n"
                "- DUE_DATE\n"
                "- BILL_PERIOD\n"
                "- SANCTIONED_LOAD\n"
                "- TARIFF_CATEGORY / CONNECTION_TYPE\n"
                "- CURRENT_METER_READING / PREVIOUS_METER_READING\n"
                "- UNITS_CONSUMED_KWH\n"
                "- CURRENT_DEMAND\n"
                "- SUBSIDY_AMOUNT\n"
                "- NET_AMOUNT_PAYABLE / AMOUNT_DUE\n"
                "- SERVICE_ADDRESS / BILLING_ADDRESS\n\n"
                "Return ONLY a single valid JSON object. Keys must be clean UPPERCASE names with underscores. "
                "Do NOT include empty or null keys.\n\n"
                f"Document OCR Text:\n\"\"\"\n{doc_text}\n\"\"\""
            )

            resp = client.chat.completions.create(
                model=openai_deployment,
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=1500,
            )

            content = resp.choices[0].message.content.strip()
            
            # Strip potential ```json ... ``` markdown code fences
            clean_json_str = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
            clean_json_str = re.sub(r"^```\s*", "", clean_json_str)
            clean_json_str = re.sub(r"\s*```$", "", clean_json_str).strip()
            
            # Find the JSON object boundaries
            start_idx = clean_json_str.find("{")
            end_idx = clean_json_str.rfind("}")
            if start_idx != -1 and end_idx != -1:
                clean_json_str = clean_json_str[start_idx : end_idx + 1]

            data = json.loads(clean_json_str)
            data["_source"] = "Azure Document Intelligence + Azure OpenAI (GPT-5-mini)"
            return data
        except Exception as e:
            print(f"[LLM Entity Extraction Warning] {e}")

    # Fallback regex parser from raw text if LLM call fails
    extracted = {"_source": "Local OCR Parser"}
    for line in doc_text.splitlines():
        if ":" in line:
            parts = line.split(":", 1)
            k = parts[0].strip().upper().replace(" ", "_")
            v = parts[1].strip()
            if k and v and len(k) < 30:
                extracted[k] = v
    if len(extracted) > 1:
        return extracted

    return {
        "DOCUMENT_TYPE": "Civic Record",
        "PREVIEW": doc_text[:120],
        "_source": "local_parser"
    }
