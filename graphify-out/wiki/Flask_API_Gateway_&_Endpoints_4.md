# Flask API Gateway & Endpoints

> 8 nodes

## Key Concepts

- **extract_file_endpoint()** (4 connections) — `backend/app.py`
- **extract_text_endpoint()** (4 connections) — `backend/app.py`
- **extract_document_from_bytes()** (4 connections) — `backend/services/extraction.py`
- **extract_document_from_text()** (4 connections) — `backend/services/extraction.py`
- **Stage 2: extract entities from custom pasted text.** (1 connections) — `backend/app.py`
- **Stage 2: extract entities from uploaded document file using Azure Document…** (1 connections) — `backend/app.py`
- **Analyzes an uploaded citizen document (PDF, PNG, JPG) using Azure Document…** (1 connections) — `backend/services/extraction.py`
- **Uses Azure OpenAI (gpt-5-mini) to extract all structured key-value entities…** (1 connections) — `backend/services/extraction.py`

## Relationships

- [Flask API Gateway & Endpoints](Flask_API_Gateway_&_Endpoints.md) (4 shared connections)
- [Document Intelligence & Extraction](Document_Intelligence_&_Extraction.md) (2 shared connections)

## Source Files

- `backend/app.py`
- `backend/services/extraction.py`

## Audit Trail

- EXTRACTED: 13 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*