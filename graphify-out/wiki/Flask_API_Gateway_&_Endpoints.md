# Flask API Gateway & Endpoints

> 15 nodes

## Key Concepts

- **file_complaint_endpoint()** (7 connections) — `backend/app.py`
- **_resolve_complaint_from_request()** (7 connections) — `backend/app.py`
- **respond_endpoint()** (7 connections) — `backend/app.py`
- **route_endpoint()** (6 connections) — `backend/app.py`
- **route_complaint()** (6 connections) — `backend/services/routing.py`
- **routing.py** (6 connections) — `backend/services/routing.py`
- **working_text()** (5 connections) — `backend/services/intake.py`
- **_load_departments()** (2 connections) — `backend/services/routing.py`
- **Stage 4: department agent response (supports custom text or mock id).** (1 connections) — `backend/app.py`
- **Helper to resolve complaint from either an existing ID or manual custom user…** (1 connections) — `backend/app.py`
- **Stage 5: filing (supports custom text or mock id).** (1 connections) — `backend/app.py`
- **Stage 3: department routing (supports custom text or mock id).** (1 connections) — `backend/app.py`
- **The English text routing/agents should reason over.** (1 connections) — `backend/services/intake.py`
- **Stage 3: Department Routing This stage does NOT need Azure. It's a simple…** (1 connections) — `backend/services/routing.py`
- **Returns the best-matching department id + name + score, based on keyword…** (1 connections) — `backend/services/routing.py`

## Relationships

- [Flask API Gateway & Endpoints](Flask_API_Gateway_&_Endpoints.md) (10 shared connections)
- [Azure Grounded Agents & Policies](Azure_Grounded_Agents_&_Policies.md) (5 shared connections)

## Source Files

- `backend/app.py`
- `backend/services/intake.py`
- `backend/services/routing.py`

## Audit Trail

- EXTRACTED: 34 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*