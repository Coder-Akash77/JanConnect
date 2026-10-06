# Flask API Gateway & Endpoints

> 9 nodes

## Key Concepts

- **route** (10 connections)
- **extract()** (4 connections) — `backend/app.py`
- **list_complaints()** (4 connections) — `backend/app.py`
- **get_complaint()** (4 connections) — `backend/services/intake.py`
- **get_complaint()** (3 connections) — `backend/app.py`
- **list_complaints()** (3 connections) — `backend/services/intake.py`
- **_load_complaints()** (3 connections) — `backend/services/intake.py`
- **List available mock complaints.** (1 connections) — `backend/app.py`
- **Stage 2: document extraction (mock ID).** (1 connections) — `backend/app.py`

## Relationships

- [Flask API Gateway & Endpoints](Flask_API_Gateway_&_Endpoints.md) (10 shared connections)
- [Azure Grounded Agents & Policies](Azure_Grounded_Agents_&_Policies.md) (3 shared connections)
- [Document Intelligence & Extraction](Document_Intelligence_&_Extraction.md) (2 shared connections)

## Source Files

- `backend/app.py`
- `backend/services/intake.py`

## Audit Trail

- EXTRACTED: 24 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*