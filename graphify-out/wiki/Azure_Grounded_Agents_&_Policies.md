# Azure Grounded Agents & Policies

> 15 nodes

## Key Concepts

- **intake.py** (11 connections) — `backend/services/intake.py`
- **agents.py** (8 connections) — `backend/services/agents.py`
- **mock_department_response()** (5 connections) — `backend/services/agents.py`
- **json** (4 connections)
- **os** (4 connections)
- **_search_grounding_policies()** (3 connections) — `backend/services/agents.py`
- **translate_text()** (3 connections) — `backend/services/intake.py`
- **dotenv** (3 connections)
- **_load_departments()** (2 connections) — `backend/services/agents.py`
- **Stage 4: Department Agents This module uses Azure AI Search for grounded…** (1 connections) — `backend/services/agents.py`
- **Retrieve grounded policy snippets from Azure AI Search.** (1 connections) — `backend/services/agents.py`
- **Executes grounded department agent response. Queries Azure AI Search + Azure…** (1 connections) — `backend/services/agents.py`
- **Stage 1: Intake & Multilingual Processing Supports Azure AI Translator for…** (1 connections) — `backend/services/intake.py`
- **Uses Azure AI Translator to detect language and translate to English.** (1 connections) — `backend/services/intake.py`
- **requests** (1 connections)

## Relationships

- [Flask API Gateway & Endpoints](Flask_API_Gateway_&_Endpoints.md) (10 shared connections)
- [Document Intelligence & Extraction](Document_Intelligence_&_Extraction.md) (3 shared connections)

## Source Files

- `backend/services/agents.py`
- `backend/services/intake.py`

## Audit Trail

- EXTRACTED: 31 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*