# Flask API Gateway & Endpoints

> 10 nodes

## Key Concepts

- **app.py** (19 connections) — `backend/app.py`
- **filing.py** (5 connections) — `backend/services/filing.py`
- **status_endpoint()** (3 connections) — `backend/app.py`
- **file_complaint()** (2 connections) — `backend/services/filing.py`
- **get_status()** (2 connections) — `backend/services/filing.py`
- **__init__.py** (1 connections) — `backend/services/__init__.py`
- **Stage 5: Filing & Tracking Real version (later): an MCP tool server exposing…** (1 connections) — `backend/services/filing.py`
- **flask** (1 connections)
- **flask_cors** (1 connections)
- **uuid** (1 connections)

## Relationships

- [Flask API Gateway & Endpoints](Flask_API_Gateway_&_Endpoints.md) (12 shared connections)
- [Azure Grounded Agents & Policies](Azure_Grounded_Agents_&_Policies.md) (2 shared connections)
- [Document Intelligence & Extraction](Document_Intelligence_&_Extraction.md) (2 shared connections)

## Source Files

- `backend/app.py`
- `backend/services/__init__.py`
- `backend/services/filing.py`

## Audit Trail

- EXTRACTED: 26 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*