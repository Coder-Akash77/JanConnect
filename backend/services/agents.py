"""
Stage 4: Department Agents

This module uses Azure AI Search for grounded departmental policy retrieval
and Azure OpenAI (via Foundry) to synthesize verified citizen guidance.
If Azure services are unreachable or credentials are not configured, it
gracefully falls back to the local policy definitions.
"""

import json
import os
from dotenv import load_dotenv

load_dotenv()

POLICY_PATH = os.path.join(
    os.path.dirname(__file__), "..", "mock_data", "department_policies.json"
)

ORCHESTRATOR_PROMPT = """You are the intake orchestrator for a citizen
grievance system. Given a citizen's complaint, you determine which
department agent should handle it and delegate the task to that agent via
A2A. You never answer policy questions yourself — you only route."""

DEPARTMENT_AGENT_PROMPT = """You are an official municipal specialist advisory officer representing the Chandigarh Civic Administration (Municipal Corporation Chandigarh & Chandigarh Power Distribution Limited).
You assist citizens residing across the Union Territory of Chandigarh (Sectors 1-63, Manimajra/Sector 13, Dhanas, Maloya, Industrial Area).

Your task:
Analyze the citizen's specific grievance and provide a concrete, step-by-step Official Citizen Advisory & Redressal Procedure grounded in official Chandigarh policies and the Punjab Right to Service (RTS) Act.

Structure your response clearly:
1. Issue Assessment: Acknowledge the citizen's exact problem and jurisdiction.
2. Immediate Redressal Procedure: Step-by-step actions the citizen or department will take (e.g., site inspection, re-metering, meter testing, or crew dispatch).
3. Statutory Resolution SLA: Explicit timeline under Chandigarh Right to Service Act (e.g. 4h for outages, 24-48h for leaks/manholes, 15 days for disputed water bills, 7 days for potholes/streetlights).
4. Competent Authority & Contact Channels: Official helpline number, e-Sampark center, or nodal office to follow up with.

Keep the advice practical, authoritative, and citizen-friendly. Use concise bullet points where appropriate."""

TOOLS = [
    {
        "name": "fetch_policy",
        "description": "Retrieve this department's grounding policy documents from Azure AI Search.",
    },
    {
        "name": "file_complaint",
        "description": "File a structured complaint against this department via the MCP tool server, returning a tracking id.",
    },
    {
        "name": "check_status",
        "description": "Look up the status of a previously filed complaint by tracking id.",
    },
]

DEPARTMENT_METADATA = {
    "water": {
        "authority": "Municipal Corporation Chandigarh (MCC)",
        "rule": "Punjab Right to Service Act 2011 (Rule 4)",
        "office": "MCC Head Office, New Deluxe Building, Sector 17, Chandigarh",
        "helpline": "0172-2540200 / 0172-2787200",
        "statutory_sla": "15 Working Days (Billing) / 24-48 Hours (Leakage)",
    },
    "electricity": {
        "authority": "Electricity Department, UT Chandigarh (CPDL)",
        "rule": "Joint Electricity Regulatory Commission (JERC) Standards & RTS Act",
        "office": "Electricity Operation Circle, UT Secretariat, Sector 18, Chandigarh",
        "helpline": "19121 / 0172-2703201",
        "statutory_sla": "4 Hours (Outage) / 24-72 Hours (Fault/Transformer)",
    },
    "sanitation": {
        "authority": "Municipal Corporation Chandigarh (MOH Wing)",
        "rule": "Solid Waste Management Rules 2016 & Chandigarh Swachhata Charter",
        "office": "MOH Wing, Municipal Corporation, Sector 17, Chandigarh",
        "helpline": "WhatsApp: 9915762917 / MCC ICCC: 0172-2787200",
        "statutory_sla": "12 to 24 Hours (Garbage/SSK) / 24 Hours (Door-to-Door)",
    },
    "roads": {
        "authority": "Municipal Corporation Chandigarh (B&R Division)",
        "rule": "Punjab Municipal Corporation Act 1976 / B&R Citizen Charter",
        "office": "B&R Division, Municipal Corporation, Sector 17, Chandigarh",
        "helpline": "0172-2787200 / e-Sampark: 1800-180-1725",
        "statutory_sla": "3 to 7 Working Days (Potholes & Streetlights)",
    },
    "rti": {
        "authority": "UT Administration Chandigarh (RTI Cell)",
        "rule": "Right to Information Act 2005 (Section 6 & 7)",
        "office": "UT Secretariat, Sector 9, Chandigarh",
        "helpline": "e-Sampark: 1800-180-1725 / 0172-2740045",
        "statutory_sla": "30 Days (48 Hours for Life & Liberty)",
    },
}


def _load_departments() -> dict:
    with open(POLICY_PATH, "r") as f:
        return json.load(f)


def _search_grounding_policies(query: str, department_name: str) -> list[str]:
    """Retrieve grounded policy snippets from Azure AI Search."""
    load_dotenv(override=True)
    endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
    key = os.getenv("AZURE_SEARCH_KEY")
    index = os.getenv("AZURE_SEARCH_INDEX", "department-policies-index")

    if not endpoint or not key or "<your-search" in endpoint:
        return []

    try:
        from azure.core.credentials import AzureKeyCredential
        from azure.search.documents import SearchClient

        client = SearchClient(endpoint=endpoint, index_name=index, credential=AzureKeyCredential(key))
        search_query = f"Chandigarh {department_name} {query}"
        results = list(client.search(search_text=search_query, top=3))
        
        snippets = []
        for r in results:
            text = r.get("snippet") or r.get("content") or r.get("text")
            if text:
                snippets.append(text)
        return snippets
    except Exception as e:
        print(f"[Azure AI Search Warning] {e}")
        return []


def mock_department_response(department_id: str, complaint_text: str) -> dict:
    """
    Executes grounded department agent response.
    Queries Azure AI Search + Azure OpenAI if available, with automatic mock fallback.
    """
    load_dotenv(override=True)
    departments = _load_departments()
    dept = departments.get(department_id) or {}
    dept_name = dept.get("department_name", "Municipal Corporation Chandigarh")
    fallback_snippets = dept.get("policy_snippets", ["Standard Chandigarh grievance escalation: 14 working days. Call MCC ICCC 0172-2787200."])

    meta = DEPARTMENT_METADATA.get(department_id, {
        "authority": dept.get("official_authority", "Municipal Corporation Chandigarh"),
        "rule": "Punjab Right to Service Act 2011",
        "office": dept.get("office_location", "MCC Delux Building, Sector 17"),
        "helpline": dept.get("helpline", "0172-2787200"),
        "statutory_sla": "15 Days",
    })

    # Step 1: Grounding via Azure AI Search
    retrieved_snippets = _search_grounding_policies(complaint_text, dept_name)
    all_snippets = retrieved_snippets if retrieved_snippets else fallback_snippets
    policy_context = "\n".join(f"- {s}" for s in all_snippets)

    # Step 2: Generate response using Azure OpenAI (Foundry)
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
                f"Authority / Department: {dept_name}\n"
                f"Statutory Regulation: {meta['rule']}\n"
                f"Nodal Office: {meta['office']}\n"
                f"Official Helpline: {meta['helpline']}\n"
                f"Official Policy & RTS Knowledge:\n{policy_context}\n\n"
                f"Citizen Complaint: \"{complaint_text}\"\n\n"
                f"Provide clear, actionable, situation-specific official redressal procedures and instructions."
            )

            kwargs = {
                "model": openai_deployment,
                "messages": [
                    {"role": "system", "content": DEPARTMENT_AGENT_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "max_completion_tokens": 3000,
            }
            try:
                resp = client.chat.completions.create(
                    reasoning_effort="low",
                    **kwargs
                )
            except Exception:
                resp = client.chat.completions.create(**kwargs)

            answer = (resp.choices[0].message.content or "").strip()
            if answer:
                return {
                    "department_id": department_id,
                    "department_name": dept_name,
                    "answer": answer,
                    "statutory_advice": answer,
                    "grounded_response": answer,
                    "authority": meta["authority"],
                    "rule": meta["rule"],
                    "office": meta["office"],
                    "helpline": meta["helpline"],
                    "statutory_sla": meta["statutory_sla"],
                    "all_relevant_policy": all_snippets,
                    "source": "foundry_agent",
                }
        except Exception as e:
            print(f"[Azure OpenAI Agent Warning] {e}")

    # Fallback to local mock policy answer
    fallback_text = (
        f"Official Guidance for {dept_name}:\n"
        f"• Redressal Procedure: File an official grievance docket below. An automated inspection request will be routed to the jurisdictional officer at {meta['office']}.\n"
        f"• Statutory Regulation & SLA: Under {meta['rule']}, this issue has a mandatory resolution timeframe of {meta['statutory_sla']}.\n"
        f"• Escalation & Support: Call the official helpline at {meta['helpline']} or visit any Chandigarh e-Sampark centre."
    )
    if fallback_snippets:
        fallback_text += "\n\n• Applicable Department Policy:\n" + "\n".join(f"- {s}" for s in fallback_snippets[:2])

    return {
        "department_id": department_id,
        "department_name": dept_name,
        "answer": fallback_text,
        "statutory_advice": fallback_text,
        "grounded_response": fallback_text,
        "authority": meta["authority"],
        "rule": meta["rule"],
        "office": meta["office"],
        "helpline": meta["helpline"],
        "statutory_sla": meta["statutory_sla"],
        "all_relevant_policy": fallback_snippets,
        "source": "mock_agent",
    }
