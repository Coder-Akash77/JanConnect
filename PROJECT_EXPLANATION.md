# JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide

---

## 📖 Executive Summary

**JanConnect** is an AI-powered civic grievance navigation system engineered to bridge the gap between Indian citizens and municipal authorities. Public administration processes—such as billing disputes, electricity outages, and Right to Information (RTI) filings—are often bogged down by bureaucratic complexity, confusing jurisdictional boundaries, and language barriers. 

JanConnect solves this by implementing an autonomous **5-Stage Agentic Pipeline**:
1. **Multilingual Intake**: Transcribes and translates citizen complaints across regional Indian languages (Hindi, Punjabi, English).
2. **Document Intelligence**: Performs layout-aware OCR on uploaded proof documents (water bills, electricity bills, voter ID cards) and extracts structured JSON entities.
3. **Intent-Based Routing**: Accurately maps the grievance to the correct administrative department using zero-latency keyword and intent overlap algorithms.
4. **Policy-Grounded Specialist Agent**: Retrieves authoritative legal guidelines and municipal SLAs via Azure AI Search, prompting a reasoning model (GPT-5-mini) to generate verified citizen guidance.
5. **Filing & SLA Tracking**: Issues unique official tracking identifiers (`GRV-XXXXXX`) backed by an MCP-ready ticket store with transparent SLA deadlines.
6. **Policy Clarifier & Multilingual Q&A**: Ingests government policy circulars/rules (PDF/Image OCR via Document Intelligence or pre-loaded welfare schemes), resolves citizen doubts with cited clauses, and provides 1-click multilingual translation across 7 Indian regional languages.

---

## 🏛️ System Architecture Diagram

```
                       ┌──────────────────────────────────────┐
                       │     Citizen User (Web / Mobile)      │
                       │    Text / Voice / Document Upload    │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                ┌────────────────────────────────────────────────────┐
                │          Frontend (React 18 + Vite)                │
                │  • 5-Stage Stepper   • Voice Dictation (WebSpeech) │
                │  • Document Dropzone • Real-Time Tracking Lookup   │
                │  • Policy Clarifier  • Multilingual Translation    │
                └─────────────────────────┬──────────────────────────┘
                                          │ HTTP Proxy (/api)
                                          ▼
                ┌────────────────────────────────────────────────────┐
                │             Backend Gateway (Flask API)            │
                │                     `app.py`                       │
                └──────┬──────────────┬─────────────┬───────────┬────┘
                       │              │             │           │
      ┌────────────────┘              │             │           └────────────────┐
      ▼                               ▼             ▼                            ▼
┌──────────────┐             ┌──────────────┐ ┌──────────────┐            ┌──────────────┐
│   Stage 1:   │             │   Stage 2:   │ │   Stage 3:   │            │ Stage 4 & 5: │
│ Intake & NLP │             │ Document AI  │ │ Routing Unit │            │ Agent & File │
└──────┬───────┘             └──────┬───────┘ └──────┬───────┘            └──────┬───────┘
       │                            │                │                           │
       ▼                            ▼                ▼                           ▼
┌──────────────┐             ┌──────────────┐ ┌──────────────┐            ┌──────────────┐
│   Azure AI   │             │   Azure Doc  │ │   Keyword    │            │ Azure Search │
│  Translator  │             │ Intelligence │ │  Classifier  │            │ (Policy RAG) │
└──────────────┘             └──────┬───────┘ └──────────────┘            └──────┬───────┘
                                    │                                            │
                                    ▼                                            ▼
                             ┌──────────────┐                             ┌──────────────┐
                             │ Azure OpenAI │                             │ Azure OpenAI │
                             │ (GPT-5-mini) │                             │ (GPT-5-mini) │
                             └──────────────┘                             └──────┬───────┘
                                                                                 │
                                                                                 ▼
                                                                          ┌──────────────┐
                                                                          │ MCP Ticket & │
                                                                          │  Status DB   │
                                                                          └──────────────┘
```

---

## 🔍 Detailed Component Walkthrough

### 1. Flask API Server (`backend/app.py`)
Acts as the central orchestrator and gateway.
- **Unified Request Resolver (`_resolve_complaint_from_request`)**: Seamlessly accommodates both manual live citizen input (`raw_text`, `citizen_name`) and predefined scenario IDs (`complaint_id`). When custom text is provided, it dynamically calls Azure Translator to normalize non-English text.
- **Routing & Action Endpoints**:
  - `POST /api/respond`: Chained execution of intake normalization, routing classification, and grounded AI agent response.
  - `POST /api/file-complaint`: Registers a ticket with department assignment, citizen name, complaint summary, and generates a tracking ID.
  - `GET /api/status/<tracking_id>`: Looks up real-time complaint status, assigned officer, resolution notes, and milestone history.
  - `POST /api/extract-file`: Handles multipart uploads (`PDF`, `PNG`, `JPG`), streaming bytes to Azure Document Intelligence and Blob Storage.
  - `POST /api/extract-text`: Direct text entity extraction for pasted documents.
  - `POST /api/transcribe-audio`: Transcribes uploaded voice notes and audio clips using Azure Speech SDK with multilingual detection.
  - `GET /api/admin/complaints`: Administrative overview of all complaints with aggregated KPI metrics.
  - `POST /api/admin/update-status`: Transitions workflow state (`Filed` ➔ `Assigned to Field Engineer` ➔ `Resolved`) with audit remarks.
  - `GET /api/policy/samples` & `GET /api/policy/sample/<policy_id>`: Returns catalog and full text of official government welfare schemes (Delhi Jal Board Free Water, PM Surya Ghar Solar, RTI Act 2005).
  - `POST /api/policy/extract`: Ingests uploaded PDF/Image policy circulars using Azure Document Intelligence OCR or extracts pasted text.
  - `POST /api/policy/ask`: Policy doubt solver using Azure OpenAI reasoning with clause-by-clause citations.
  - `POST /api/policy/translate`: Instant multilingual translation of policy advice across 7 Indian regional languages via Azure AI Translator.

### 2. Stage 1: Multilingual Intake & Audio Transcription (`backend/services/intake.py` & `speech.py`)
- **`translate_text(text)`**: Uses the Azure AI Translator REST API (`/translate?api-version=3.0&to=en`). Auto-detects input language (`hi`, `pa`, etc.). If the language is not English, returns both the detected language code and an English working copy.
- **`transcribe_audio(file_bytes, filename)`**: Ingests citizen voice notes (`.wav`, `.mp3`, `.m4a`), using **Azure Cognitive Speech SDK** (`azure.cognitiveservices.speech`) with multi-language identification (`hi-IN`, `pa-IN`, `en-IN`) and offline fallback.
- **Fallback**: Returns the raw text as working text if translator keys are missing.

### 3. Stage 2: Document Intelligence (`backend/services/extraction.py`)
- **`extract_document_from_bytes(file_bytes, content_type, filename)`**: 
  - Optionally uploads the citizen's original uploaded document into **Azure Blob Storage** (`citizendocuments` container) for legal retention, returning a permanent blob URL.
  - Streams binary file bytes to Azure Document Intelligence using the `prebuilt-layout` model.
  - Retrieves full OCR content and layout structure.
  - Passes extracted text to `extract_document_from_text()`.
- **`extract_document_from_text(doc_text)`**:
  - Invokes Azure OpenAI (`gpt-5-mini`) with a specialized prompt requesting clean uppercase JSON key-value pairs (e.g., `CITIZEN_NAME`, `CA_NUMBER`, `BILL_DATE`, `UNITS_CONSUMED_KWH`, `NET_AMOUNT_PAYABLE`).
  - Employs token budget allocation (`max_completion_tokens=1500`) and markdown fence stripping to prevent JSON parsing errors.

### 4. Stage 3: Department Routing Classifier (`backend/services/routing.py`)
- **`route_complaint(complaint_text)`**:
  - Loads department profiles from `backend/mock_data/department_policies.json`.
  - Performs case-insensitive keyword overlap scoring against domain lexicons (e.g. `["water", "meter", "bill", "leak"]` vs `["electricity", "power", "outage", "bijli", "transformer"]`).
  - Returns best matching department ID, official name, and match score.

### 5. Stage 4: Grounded Specialist Agents (`backend/services/agents.py`)
- **`_search_grounding_policies(query, department_name)`**:
  - Uses `azure.search.documents.SearchClient` to query the Azure AI Search index (`department-policies-index`).
  - Retrieves relevant policy clauses and municipal SLA constraints.
- **`mock_department_response(department_id, complaint_text)`**:
  - Constructs a grounded prompt combining the citizen's complaint with retrieved policy clauses.
  - Executes Azure OpenAI (`gpt-5-mini`) with `DEPARTMENT_AGENT_PROMPT` to synthesize an authoritative advisory with specific resolution timelines and escalation steps.

### 6. Stage 5: Filing, SLA Tracking & Officer Desk (`backend/services/filing.py`)
- **`file_complaint(...)`**: Generates a cryptographically randomized tracking identifier (`GRV-XXXXXX`) and persists the complaint record directly into **Azure Table Storage** (`complaints` table) with PartitionKey `"complaint"` and RowKey as the tracking ID. Falls back gracefully to an in-memory dictionary if unconfigured.
- **`get_status(tracking_id)`**: Queries Azure Table Storage for current status (`Filed`, `Under Verification`, `Assigned to Field Engineer`, `Resolved`), assigned officer, resolution notes, and milestone history.
- **`list_all_complaints()` & `update_complaint_status(...)`**: Powers the **Officer Desk**, allowing municipal engineers and administrators to transition ticket workflows and attach official progress notes.

### 7. Stage 6: Government Policy Clarifier & Multilingual Q&A (`backend/services/policy_qa.py` & `intake.py`)
- **`extract_policy_content(file_bytes, content_type, text_content)`**:
  - Ingests official government scheme circulars, municipal rules, or gazette PDFs/images.
  - Employs **Azure Document Intelligence (`prebuilt-layout`)** for structural OCR, or processes direct text pastes.
- **`answer_policy_doubt(policy_text, user_doubt, policy_title)`**:
  - Uses **Azure OpenAI (`gpt-5-mini`)** with reasoning prompts instructing the model to verify eligibility, requirements, fee exemptions, and appeal channels directly from the provided policy.
  - Automatically identifies and highlights exact cited clauses (e.g. `Clause 2.2`, `Section 7(1)`, `Rule 4(A)`) in citizen-friendly language.
- **`translate_to_language(text, target_lang)`**:
  - Interactive multi-language translation engine powered by **Azure AI Translator** (with `gpt-5-mini` translation fallback).
  - Translates legal advice and policy answers into 7 Indian languages: English (`en`), Hindi (`hi`), Punjabi (`pa`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), and Marathi (`mr`).

### 8. Frontend User Interface (`frontend/src/App.jsx` & `index.css`)
- **Visual 5-Stage Stepper Ribbon**: Tracks citizen progress through the resolution lifecycle.
- **Dual Intake Modes & Voice Note Processing**:
  - ✍️ *Manual Entry / Voice*: Live voice dictation via browser `SpeechRecognition` plus **native Voice Note / Audio File upload** (`.wav`, `.mp3`, `.m4a`) processed via Azure Speech.
  - 📂 *Sample Library*: Immediate access to pre-configured test scenarios.
- **Document Intelligence Tab**:
  - Drag-and-drop file upload for PDFs/images with live progress feedback.
  - Plain-text document parser with one-click templates (Municipal Water Bill, Electricity Board Bill, RTI Form).
  - Clean table visualizer for extracted key-value entities.
- **📜 Policy Clarifier & Q&A Tab (Government Schemes & Doubt Resolver)**:
  - Official Scheme Library selector: *Delhi Jal Board 20kL Free Water Scheme*, *PM Surya Ghar Muft Bijli Yojana*, *RTI Act 2005 Statutory Rules*.
  - Upload Policy circulars/PDFs/images with Document Intelligence OCR.
  - Interactive doubts console with live mic dictation and suggested question chips.
  - Grounded answer box with highlighted clause citation badges.
  - **1-Click Multilingual Translation Toolbar**: Instantly renders advice in Hindi, Punjabi, Bengali, Tamil, Telugu, Marathi, or English, complete with text-to-speech audio reader and clipboard export.
- **Live Status Tracker Tab**: Instant search for any `GRV-XXXXXX` tracking ID with **Audit Timeline Milestones** and official resolution notes.
- **Municipal Officer Desk Tab (Feature D)**:
  - Real-time KPI summary tiles (Total Grievances, Pending Verification, In Progress, Resolved).
  - Search and filter bar (by department, status, citizen name, tracking ID).
  - Interactive table with one-click Status & Officer assignment modal dialog.
- **Department Knowledge Matrix Tab**: Public directory of supported municipal cells, keywords, and statutory resolution SLAs.


---

## 🔒 Security & Environment Variables

All secrets reside in `backend/.env`, strictly excluded from version control via `.gitignore`:

```env
# Azure OpenAI (Foundry)
AZURE_OPENAI_ENDPOINT=https://<your-foundry-resource>.openai.azure.com/
AZURE_OPENAI_KEY=<your-key>
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://<your-search-resource>.search.windows.net
AZURE_SEARCH_KEY=<your-key>
AZURE_SEARCH_INDEX=department-policies-index

# Azure Speech & Translator
AZURE_SPEECH_KEY=<your-key>
AZURE_SPEECH_REGION=eastus2
AZURE_TRANSLATOR_KEY=<your-key>
AZURE_TRANSLATOR_REGION=eastus2
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/

# Azure Document Intelligence
AZURE_DOC_INTEL_ENDPOINT=https://<your-doc-intel>.cognitiveservices.azure.com/
AZURE_DOC_INTEL_KEY=<your-key>

# Azure Storage Account (Table Database for Tickets + Blob Storage for Documents)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=<your-storage-account>;AccountKey=<your-key>;EndpointSuffix=core.windows.net
```


---

## 🗺️ Codebase Knowledge Graph (Graphify)

JanConnect features an integrated AST-parsed knowledge graph in `graphify-out/`:
- **Interactive Visualizer**: Open `graphify-out/graph.html` in any browser.
- **Mermaid Call-Flow Architecture**: Open `graphify-out/awaazsetu-callflow.html` for complete function interaction charts.
- **Codebase Querying**:
  ```bash
  graphify query "How does intake routing connect to department agents?"
  graphify path "route_complaint" "mock_department_response"
  graphify explain "_resolve_complaint_from_request"
  ```
- **Wiki**: Browse `graphify-out/wiki/index.md` for article-level component explanations.

---

## 🛠️ How to Extend JanConnect

### Adding a New Municipal Department (e.g., Sanitation / Roads):
1. **Add Department Profile**: In `backend/mock_data/department_policies.json`, define the new department key (e.g. `"sanitation"`), official name, keyword triggers (e.g. `["garbage", "waste", "cleaning", "drainage"]`), and official policy snippets.
2. **Update Policy Index**: Add the department's statutory policies to `policies.txt` and re-index in Azure AI Search.
3. **Frontend UI Badge**: Add the department entry and icon (`🧹`) to `departmentsList` in `frontend/src/App.jsx`.
4. **Update Knowledge Graph**: Run `graphify update .` to map the new connections.
