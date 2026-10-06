# AGENTS.md — JanConnect Project Guide for AI Agents

Welcome to **JanConnect (जन कनेक्ट)**. This document is the primary onboarding and operational guide for any AI assistant or agent working on this codebase. Read this first to understand the architecture, data flow, integrations, and conventions.

---

## 1. Project Overview

**JanConnect** is a multilingual, AI-powered civic grievance navigation and resolution system. It assists citizens in submitting public service complaints (Water, Electricity, RTI, etc.) in their native language (Hindi, Punjabi, English), parses proof documents (bills, ID cards), classifies and routes grievances to the correct municipal department, generates grounded legal/policy advice using Azure OpenAI, and generates official tracking tickets.

### Core Architecture: 5-Stage Agentic Pipeline

| Stage | Name | Key Module | Description & Technology |
|---|---|---|---|
| **1** | **Intake & Multilingual Normalization** | `backend/services/intake.py` | Captures voice/text grievances in Hindi, Punjabi, or English. Uses **Azure AI Translator** to produce an English working copy. |
| **2** | **Document Intelligence & Storage** | `backend/services/extraction.py` | Ingests PDF/Image attachments (bills, IDs). Uses **Azure Document Intelligence (`prebuilt-layout`)** for OCR, **Azure OpenAI (`gpt-5-mini`)** for entity extraction, and **Azure Blob Storage (`citizendocuments`)** for file retention. |
| **3** | **Department Routing** | `backend/services/routing.py` | Fast, zero-latency local keyword/intent classifier matching grievances to departments (`water`, `electricity`, `rti`). |
| **4** | **Grounded Specialist Agents** | `backend/services/agents.py` | Queries **Azure AI Search (`department-policies-index`)** for statutory rules/SLAs, then prompts **Azure OpenAI (`gpt-5-mini`)** to synthesize an official citizen advisory. |
| **5** | **Filing & SLA Tracking** | `backend/services/filing.py` | Generates official tracking IDs (`GRV-XXXXXX`), persists complaint records into **Azure Table Storage (`complaints`)**, and provides real-time lifecycle lookup. |

---

## 2. Directory Structure

```text
JanConnect/                      # Project Root (JanConnect)
├── AGENTS.md                   # This file (Agent Instructions & Overview)
├── PROJECT_EXPLANATION.md      # Comprehensive deep-dive documentation
├── README.md                   # Human onboarding & setup guide
├── policies.txt                # Grounding policy text indexed in Azure AI Search
├── .gitignore                  # Git rules (blocks .env, node_modules, cache, temp pdfs)
│
├── backend/                    # Python Flask Backend
│   ├── app.py                  # Main Flask API server (Port 5001)
│   ├── requirements.txt        # Backend dependencies (Flask, Azure SDKs, OpenAI)
│   ├── .env                    # Live Azure credentials (PRIVATE - never commit)
│   ├── .env.example            # Template for environment variables
│   ├── mock_data/              # Sample complaints, departments & citizen documents
│   │   ├── complaints_sample.json
│   │   ├── department_policies.json
│   │   └── citizen_documents.json
│   └── services/               # Core Pipeline Services
│       ├── intake.py           # Stage 1: Multilingual translation & complaint loader
│       ├── speech.py           # Stage 1: Azure Speech audio transcription & voice notes
│       ├── extraction.py       # Stage 2: Doc Intelligence OCR & Entity extraction
│       ├── routing.py          # Stage 3: Keyword/intent routing classifier
│       ├── agents.py           # Stage 4: Azure AI Search + GPT-5-mini grounded agent
│       ├── filing.py           # Stage 5: Table Storage / Ticket store & Status lifecycle
│       └── policy_qa.py        # Policy Clarifier: OCR, Grounded Q&A, and Multilingual Translation
│
├── frontend/                   # React 18 + Vite Frontend (Port 5173)
│   ├── index.html              # HTML shell with Google Fonts (Inter + Outfit)
│   ├── package.json            # Vite scripts & React dependencies
│   ├── vite.config.js          # Vite config with /api proxy to http://localhost:5001
│   └── src/
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Main interactive UI (Stepper, Policy Clarifier, Officer Desk, Tracker)
│       └── index.css           # Curated civic CSS design system
│
└── graphify-out/               # Knowledge Graph & Codebase Maps
    ├── graph.json              # Codebase graph
    ├── graph.html              # Interactive 3D/WebGL graph visualizer
    ├── GRAPH_REPORT.md         # Architecture, god nodes, and cohesion analysis
    └── wiki/                   # Code wiki
```

---

## 3. Backend API Endpoints (`backend/app.py`)

All routes handle both **manual live citizen input** and **mock sample IDs**:

- `GET /api/complaints` — Returns sample mock complaints list.
- `GET /api/complaint/<id>` — Returns a specific mock complaint.
- `POST /api/route` — Accepts `{ "raw_text": "...", "citizen_name": "..." }` or `{ "complaint_id": "..." }`, returns matched department and score.
- `POST /api/respond` — Executes Stage 1 (Translation) + Stage 3 (Routing) + Stage 4 (Azure AI Search Grounded Agent Response).
- `POST /api/file-complaint` — Registers an official ticket and returns `{ "tracking_id": "GRV-XXXXXX", "status": "Filed", ... }`.
- `GET /api/status/<tracking_id>` — Fetches live status, resolution notes, and milestone history of any filed grievance.
- `POST /api/extract-text` — Takes `{ "text": "..." }`, returns structured JSON entities using Azure OpenAI.
- `POST /api/extract-file` — Takes multipart `file` (PDF/Image), runs Azure Document Intelligence OCR + Azure OpenAI structuring.
- `POST /api/transcribe-audio` — Takes multipart audio `file` (.wav/.mp3/.m4a), transcribes via Azure Speech SDK with multilingual detection.
- `GET /api/admin/complaints` — Returns all filed complaints and municipal KPI metrics for the Officer Desk.
- `POST /api/admin/update-status` — Allows officers to transition workflow status (`Filed` -> `Assigned` -> `Resolved`), record remarks, and assign engineers.
- `GET /api/policy/samples` & `GET /api/policy/sample/<id>` — Returns official government policy schemes.
- `POST /api/policy/extract` — Analyzes uploaded policy PDF/Image using Azure Document Intelligence.
- `POST /api/policy/ask` — Synthesizes grounded legal/policy answers with cited clauses using Azure OpenAI (`gpt-5-mini`).
- `POST /api/policy/translate` — Translates policy answers into Hindi, Punjabi, Bengali, Tamil, Telugu, etc.
- `GET /api/documents` & `GET /api/extract/<doc_id>` — Mock document fallbacks.



---

## 4. Live Cloud Services & Fallback Architecture

The project is connected to active Azure resources specified in `backend/.env`:

1. **Azure OpenAI (`gpt-5-mini`)**:
   - Used in `services/agents.py` for policy answers and in `services/extraction.py` for entity structuring.
   - *Note*: As a reasoning model, always use `max_completion_tokens` (e.g. 800–1500) rather than `max_tokens`.
2. **Azure AI Search (`department-policies-index`)**:
   - Indexes `policies.txt` to ground responses against official rules for Water, Electricity, and RTI.
3. **Azure AI Translator**:
   - Automatically detects Hindi (`hi`), Punjabi (`pa`), etc., and translates to English for routing and reasoning.
4. **Azure Document Intelligence**:
   - `prebuilt-layout` model reads binary streams (`io.BytesIO(file_bytes)`) to extract full OCR text from uploaded PDFs/images.
5. **Azure Storage Account (Table Database + Blob Storage)**:
   - Persists all filed grievance tickets into Azure Table Storage (`complaints` table).
   - Stores citizen proof documents and bills in Azure Blob Storage (`citizendocuments` container).
   - Automatically initializes tables and containers upon first interaction.
6. **Resilient Fallbacks**:
   - If any Azure service is ever missing credentials or unreachable, all modules gracefully fall back to local mock data so the application never crashes.


---

## 5. Knowledge Graph & Navigation (Graphify)

A pre-built knowledge graph exists in `graphify-out/`:
- **Rules**: For questions about codebase structure or relationships, check `graphify-out/graph.json` or run `graphify query "<question>"`.
- **Wiki**: Browse `graphify-out/wiki/index.md` for pre-indexed articles on each community.
- **Maintenance**: After modifying source code, keep the graph synchronized by running:
  ```bash
  graphify update .
  ```

---

## 6. How to Run & Verify

```bash
# Backend (Terminal 1)
cd backend
python app.py
# Runs at http://localhost:5001

# Frontend (Terminal 2)
cd frontend
npm run dev
# Runs at http://localhost:5173 (proxies /api to 5001)

# Frontend Production Build Test
cd frontend
npm run build
```

---

## 7. Guidelines for Modifying Code

1. **Maintain Dual-Mode Compatibility**: Whenever updating endpoints, support both manual citizen input (`raw_text`) and legacy mock IDs (`complaint_id`).
2. **Never Commit Secrets**: Ensure `backend/.env` is never staged or committed. Reference `backend/.env.example` for public configurations.
3. **Preserve Error Boundaries**: Keep `try...except` blocks with local fallbacks around all external Azure SDK network calls.
4. **Design Quality**: The frontend uses standard Vanilla CSS tokens in `index.css`. Preserve the vibrant Indian civic palette, badges, and responsive layouts.
