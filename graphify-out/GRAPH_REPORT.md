# Graph Report - JanConnect  (2026-09-23)

## Corpus Check
- 36 files · ~29,682 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 269 nodes · 382 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b9f7dc3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- app.py
- extraction.py
- filing.py
- ask_policy_endpoint
- extract_document_from_bytes
- 🔍 Detailed Component Walkthrough
- AGENTS.md — JanConnect Project Guide for AI Agents
- Quick CLI Reference
- JanConnect (जन कनेक्ट / ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ)
- rules/graphify.md
- workflows/graphify.md
- App.jsx
- storage.py
- extract_policy_endpoint
- routing.py
- get_policy_sample_endpoint
- transcribe_audio_endpoint

## God Nodes (most connected - your core abstractions)
1. `JanConnect (जन कनेक्ट / ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ)` - 10 edges
2. `🔍 Detailed Component Walkthrough` - 9 edges
3. `route_complaint()` - 8 edges
4. `AGENTS.md — JanConnect Project Guide for AI Agents` - 8 edges
5. `🚀 6-Stage Agentic Pipeline: Architectural Explanation` - 8 edges
6. `_resolve_complaint_from_request()` - 7 edges
7. `respond_endpoint()` - 7 edges
8. `file_complaint_endpoint()` - 7 edges
9. `JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide` - 7 edges
10. `route_endpoint()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `route_endpoint()` --calls--> `route_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/routing.py
- `respond_endpoint()` --calls--> `mock_department_response()`  [EXTRACTED]
  backend/app.py → backend/services/agents.py
- `respond_endpoint()` --calls--> `route_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/routing.py
- `file_complaint_endpoint()` --calls--> `file_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/filing.py
- `file_complaint_endpoint()` --calls--> `route_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/routing.py

## Import Cycles
- None detected.

## Communities (19 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (26): canvas-confetti, dependencies, canvas-confetti, gsap, @gsap/react, lucide-react, react, react-dom (+18 more)

### Community 1 - "app.py"
Cohesion: 0.07
Nodes (45): admin_update_status_endpoint(), advance_status_endpoint(), extract(), file_complaint_endpoint(), get_complaint(), get_departments_endpoint(), health_endpoint(), list_complaints() (+37 more)

### Community 2 - "extraction.py"
Cohesion: 0.11
Nodes (17): End-to-End API Integration Test Suite for Chandigarh JanConnect Exercises every…, _load_departments(), mock_department_response(), Stage 4: Department Agents This module uses Azure AI Search for grounded…, Retrieve grounded policy snippets from Azure AI Search., Executes grounded department agent response. Queries Azure AI Search + Azure…, _search_grounding_policies(), Stage 2: Document Extraction & Content Understanding Supports: 1. Live Azure… (+9 more)

### Community 3 - "filing.py"
Cohesion: 0.11
Nodes (23): admin_complaints_endpoint(), list_grievances_endpoint(), Admin / Officer Desk: lists all complaints and computes operational metrics., Lists all complaints filed in Azure Table Storage / persistent DB., status_endpoint(), advance_complaint_status(), file_complaint(), get_status() (+15 more)

### Community 4 - "ask_policy_endpoint"
Cohesion: 0.50
Nodes (4): ask_policy_endpoint(), Answers citizen doubt grounded in policy text with clause citations., answer_policy_doubt(), Uses Azure OpenAI (gpt-5-mini) to clarify citizen doubts with grounded clause…

### Community 5 - "extract_document_from_bytes"
Cohesion: 0.20
Nodes (10): extract_file_endpoint(), extract_text_endpoint(), Stage 2: extract entities from custom pasted text., Stage 2: extract entities from uploaded document file using Azure Document…, extract_document_from_bytes(), extract_document_from_text(), Uses Azure OpenAI (gpt-5-mini) to extract all structured key-value entities…, Uploads an uploaded citizen document to Azure Blob Storage ('citizendocuments'… (+2 more)

### Community 6 - "🔍 Detailed Component Walkthrough"
Cohesion: 0.12
Nodes (16): 1. Flask API Server (`backend/app.py`), 2. Stage 1: Multilingual Intake & Audio Transcription (`backend/services/intake.py` & `speech.py`), 3. Stage 2: Document Intelligence (`backend/services/extraction.py`), 4. Stage 3: Department Routing Classifier (`backend/services/routing.py`), 5. Stage 4: Grounded Specialist Agents (`backend/services/agents.py`), 6. Stage 5: Filing, SLA Tracking & Officer Desk (`backend/services/filing.py`), 7. Stage 6: Government Policy Clarifier & Multilingual Q&A (`backend/services/policy_qa.py` & `intake.py`), 8. Frontend User Interface (`frontend/src/App.jsx` & `index.css`) (+8 more)

### Community 7 - "AGENTS.md — JanConnect Project Guide for AI Agents"
Cohesion: 0.20
Nodes (9): 1. Project Overview, 2. Directory Structure, 3. Backend API Endpoints (`backend/app.py`), 4. Live Cloud Services & Fallback Architecture, 5. Knowledge Graph & Navigation (Graphify), 6. How to Run & Verify, 7. Guidelines for Modifying Code, AGENTS.md — JanConnect Project Guide for AI Agents (+1 more)

### Community 8 - "Quick CLI Reference"
Cohesion: 0.29
Nodes (6): 1. Build / Update the Knowledge Graph, 2. Query the Knowledge Graph, 3. Generate Visualizations & Reports, Generated Artifacts, Graphify — Codebase Knowledge Graph Skill, Quick CLI Reference

### Community 9 - "JanConnect (जन कनेक्ट / ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ)"
Cohesion: 0.09
Nodes (21): 1. Backend Server Setup, 2. Frontend Client Setup, 3. Frontend Production Build Verification, 🚀 6-Stage Agentic Pipeline: Architectural Explanation, 🏛️ Chandigarh Municipal Grounding Specifics, 🗺️ Codebase Knowledge Graph (Graphify), 📡 Complete Backend API Reference, 🏛️ End-to-End System Architecture (+13 more)

### Community 12 - "App.jsx"
Cohesion: 0.12
Nodes (13): App(), DEFAULT_CHANDIGARH_COMPLAINTS, AdminLoginModal(), DEFAULT_CHANDIGARH_DEPARTMENTS, DepartmentMatrix(), DocumentIntelligence(), GrievanceNavigator(), Navbar() (+5 more)

### Community 13 - "storage.py"
Cohesion: 0.13
Nodes (15): advance_complaint_status(), _get_azure_blob_container(), _get_azure_table_client(), get_complaint(), get_departments(), list_all_complaints(), Azure Storage Service for JanConnect Provides durable cloud storage for: 1.…, Advances ticket status for demonstration: Filed -> Assigned to Field Officer ->… (+7 more)

### Community 14 - "extract_policy_endpoint"
Cohesion: 0.40
Nodes (6): extract_policy_endpoint(), Extracts text from uploaded policy document (PDF/Image/Text)., extract_policy_content(), Uploads an official government policy circular into Azure Blob Storage…, Extracts policy text from uploaded files (PDF, image, text) using Azure…, upload_policy_to_blob()

### Community 15 - "routing.py"
Cohesion: 0.24
Nodes (10): detect_chandigarh_sector(), _keyword_matches(), _load_departments(), Stage 3: Department Routing & Chandigarh Sector Detection This module performs:…, Loads department metadata from JSON (or storage)., Extracts mentioned Chandigarh sector or area from grievance text., Accurate keyword matching with word boundaries for short words to avoid…, Returns the best-matching department id + name + score, along with any detected… (+2 more)

### Community 17 - "get_policy_sample_endpoint"
Cohesion: 0.50
Nodes (4): get_policy_sample_endpoint(), Returns full text of a pre-loaded scheme., get_sample_policy(), Retrieves full text of a pre-loaded scheme.

### Community 18 - "transcribe_audio_endpoint"
Cohesion: 0.50
Nodes (4): Stage 1: Speech-to-Text audio file transcription via Azure Speech SDK., transcribe_audio_endpoint(), Transcribes uploaded audio bytes (WAV, MP3, M4A, OGG) to text. Uses Azure…, transcribe_audio()

## Knowledge Gaps
- **61 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `respond_endpoint()` connect `app.py` to `extraction.py`, `routing.py`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `file_complaint_endpoint()` connect `app.py` to `filing.py`, `routing.py`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `extract_policy_endpoint()` connect `extract_policy_endpoint` to `app.py`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.0666049953746531 - nodes in this community are weakly interconnected._
- **Should `extraction.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11396011396011396 - nodes in this community are weakly interconnected._