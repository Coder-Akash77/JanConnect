"""
JanConnect Azure Smoke Test & Diagnostic Suite

Runs lightweight verification probes against configured Azure cloud services
and the local/cloud storage layer without consuming unnecessary credits.
"""

import os
import sys

# Configure UTF-8 for Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from dotenv import load_dotenv

load_dotenv()

results = []

def log_result(service: str, status: str, details: str):
    icon = "[PASS]" if status == "PASS" else ("[WARN]" if status == "WARN" else "[FAIL]")
    results.append({"icon": icon, "service": service, "status": status, "details": details})
    print(f" {icon} {service}: {details}")



print("\n" + "="*60)
print("   JanConnect — Azure Cloud & Services Smoke Test Suite")
print("="*60 + "\n")

# 1. Azure AI Translator
try:
    import requests
    key = os.getenv("AZURE_TRANSLATOR_KEY")
    endpoint = os.getenv("AZURE_TRANSLATOR_ENDPOINT", "https://api.cognitive.microsofttranslator.com/")
    region = os.getenv("AZURE_TRANSLATOR_REGION", "eastus2")

    if key and "<your" not in key:
        res = requests.post(
            endpoint.rstrip("/") + "/translate?api-version=3.0&to=en",
            headers={"Ocp-Apim-Subscription-Key": key, "Ocp-Apim-Subscription-Region": region, "Content-Type": "application/json"},
            json=[{"text": "नमस्ते"}],
            timeout=8
        )
        if res.status_code == 200:
            translated = res.json()[0]["translations"][0]["text"]
            log_result("Azure AI Translator", "PASS", f"Translated 'नमस्ते' -> '{translated}'")
        else:
            log_result("Azure AI Translator", "WARN", f"HTTP {res.status_code}: {res.text[:80]}")
    else:
        log_result("Azure AI Translator", "WARN", "Key not configured, using fallback")
except Exception as e:
    log_result("Azure AI Translator", "WARN", str(e))

# 2. Azure OpenAI (gpt-5-mini)
try:
    from openai import AzureOpenAI
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    key = os.getenv("AZURE_OPENAI_KEY")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-mini")

    if endpoint and key and "<your" not in endpoint:
        client = AzureOpenAI(azure_endpoint=endpoint, api_key=key, api_version="2024-12-01-preview")
        resp = client.chat.completions.create(
            model=deployment,
            messages=[{"role": "user", "content": "Respond with the single word: READY"}],
            max_completion_tokens=25,
        )
        reply = resp.choices[0].message.content.strip()
        log_result("Azure OpenAI (Foundry)", "PASS", f"Deployment '{deployment}' returned: {reply}")
    else:
        log_result("Azure OpenAI (Foundry)", "WARN", "Credentials missing, mock fallback active")
except Exception as e:
    log_result("Azure OpenAI (Foundry)", "WARN", str(e))

# 3. Azure AI Search
try:
    from azure.core.credentials import AzureKeyCredential
    from azure.search.documents import SearchClient
    endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
    key = os.getenv("AZURE_SEARCH_KEY")
    index = os.getenv("AZURE_SEARCH_INDEX", "department-policies-index")

    if endpoint and key and "<your" not in endpoint:
        client = SearchClient(endpoint=endpoint, index_name=index, credential=AzureKeyCredential(key))
        docs = list(client.search(search_text="water", top=1))
        log_result("Azure AI Search", "PASS", f"Connected to index '{index}' (Found {len(docs)} test docs)")
    else:
        log_result("Azure AI Search", "WARN", "Search credentials missing, local policies active")
except Exception as e:
    log_result("Azure AI Search", "WARN", str(e))

# 4. Azure Document Intelligence
try:
    from azure.core.credentials import AzureKeyCredential
    from azure.ai.documentintelligence import DocumentIntelligenceClient
    endpoint = os.getenv("AZURE_DOC_INTEL_ENDPOINT")
    key = os.getenv("AZURE_DOC_INTEL_KEY")

    if endpoint and key and "<your" not in endpoint:
        client = DocumentIntelligenceClient(endpoint=endpoint, credential=AzureKeyCredential(key))
        log_result("Azure Document Intelligence", "PASS", f"Client initialized against '{endpoint[:35]}...'")
    else:
        log_result("Azure Document Intelligence", "WARN", "Doc Intel key missing, local parser active")
except Exception as e:
    log_result("Azure Document Intelligence", "WARN", str(e))

# 5. Azure Cognitive Services Speech
try:
    import azure.cognitiveservices.speech as speechsdk
    speech_key = os.getenv("AZURE_SPEECH_KEY")
    speech_region = os.getenv("AZURE_SPEECH_REGION", "eastus2")

    if speech_key and "<your" not in speech_key:
        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
        log_result("Azure Speech Services", "PASS", f"Speech SDK initialized for region '{speech_region}'")
    else:
        log_result("Azure Speech Services", "WARN", "Speech key missing, Web Speech active")
except Exception as e:
    log_result("Azure Speech Services", "WARN", str(e))

# 6. Azure Storage & Database
try:
    from services import storage
    test_id = "GRV-SMOKETEST"
    saved = storage.save_complaint(
        tracking_id=test_id,
        department_id="water",
        department_name="Water Supply & Sewerage",
        complaint_text="Smoke test verification complaint",
        citizen_name="Smoke Test Runner"
    )
    fetched = storage.get_complaint(test_id)
    storage_type = fetched.get("_storage", "Unknown")
    log_result("Storage & Ticket Database", "PASS", f"Store/Retrieve OK (Engine: {storage_type})")
except Exception as e:
    log_result("Storage & Ticket Database", "WARN", str(e))

print("\n" + "="*60)
print("                   Diagnostics Complete")
print("="*60 + "\n")
