"""
Stage 1: Intake & Multilingual Processing

Supports Azure AI Translator for real-time translation of Hindi / Punjabi / Indian regional
languages into an English working copy for downstream routing and agent processing.
"""

import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

MOCK_PATH = os.path.join(
    os.path.dirname(__file__), "..", "mock_data", "complaints_sample.json"
)


def _load_complaints():
    with open(MOCK_PATH, "r") as f:
        return json.load(f)


def translate_text(text: str) -> dict:
    """Uses Azure AI Translator to detect language and translate to English."""
    key = os.getenv("AZURE_TRANSLATOR_KEY")
    region = os.getenv("AZURE_TRANSLATOR_REGION", "eastus2")
    endpoint = os.getenv("AZURE_TRANSLATOR_ENDPOINT", "https://api.cognitive.microsofttranslator.com/")

    if not key or "<your" in key:
        return {"language": "en", "translated_text": None}

    path = "/translate?api-version=3.0&to=en"
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-type": "application/json",
    }
    body = [{"text": text}]

    try:
        response = requests.post(endpoint.rstrip("/") + path, headers=headers, json=body, timeout=5)
        if response.status_code == 200:
            res = response.json()
            detected = res[0]["detectedLanguage"]["language"]
            translated = res[0]["translations"][0]["text"]
            return {
                "language": detected,
                "translated_text": translated if not detected.startswith("en") else None,
            }
    except Exception as e:
        print(f"[Azure Translator Warning] {e}")

    return {"language": "en", "translated_text": None}


def translate_to_language(text: str, target_lang: str = "hi") -> dict:
    """Translates text into any target language (e.g. hi, pa, bn, ta, te, mr, en)."""
    if not text or not text.strip():
        return {"target_language": target_lang, "translated_text": "", "source": "empty"}

    key = os.getenv("AZURE_TRANSLATOR_KEY")
    region = os.getenv("AZURE_TRANSLATOR_REGION", "eastus2")
    endpoint = os.getenv("AZURE_TRANSLATOR_ENDPOINT", "https://api.cognitive.microsofttranslator.com/")

    if key and "<your" not in key:
        path = f"/translate?api-version=3.0&to={target_lang}"
        headers = {
            "Ocp-Apim-Subscription-Key": key,
            "Ocp-Apim-Subscription-Region": region,
            "Content-type": "application/json",
        }
        body = [{"text": text}]
        try:
            response = requests.post(endpoint.rstrip("/") + path, headers=headers, json=body, timeout=8)
            if response.status_code == 200:
                res = response.json()
                translated = res[0]["translations"][0]["text"]
                return {
                    "target_language": target_lang,
                    "translated_text": translated,
                    "source": "Azure AI Translator"
                }
        except Exception as e:
            print(f"[Azure Translator Target Error] {e}")

    # Fallback to Azure OpenAI if configured
    openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    openai_key = os.getenv("AZURE_OPENAI_KEY")
    openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-mini")

    lang_names = {
        "hi": "Hindi (हिन्दी)",
        "pa": "Punjabi (ਪੰਜਾਬੀ)",
        "bn": "Bengali (বাংলা)",
        "ta": "Tamil (தமிழ்)",
        "te": "Telugu (తెలుగు)",
        "mr": "Marathi (मराठी)",
        "gu": "Gujarati (ગુજરાતી)",
        "en": "English",
    }
    lang_name = lang_names.get(target_lang, target_lang)

    if openai_endpoint and openai_key and "<your" not in openai_endpoint:
        try:
            from openai import AzureOpenAI
            client = AzureOpenAI(
                azure_endpoint=openai_endpoint,
                api_key=openai_key,
                api_version="2024-12-01-preview",
            )
            prompt = (
                f"Translate the following civic/policy text accurately into natural {lang_name}. "
                f"Maintain all numbers, dates, and official names verbatim.\n\n"
                f"Text:\n\"\"\"\n{text}\n\"\"\"\n\n"
                f"Return ONLY the translated text without conversational preamble."
            )
            resp = client.chat.completions.create(
                model=openai_deployment,
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=1200,
            )
            content = resp.choices[0].message.content.strip()
            return {
                "target_language": target_lang,
                "translated_text": content,
                "source": "Azure OpenAI (Foundry)"
            }
        except Exception as e:
            print(f"[OpenAI Translation Warning] {e}")

    return {
        "target_language": target_lang,
        "translated_text": text,
        "source": "Local Fallback"
    }



def get_complaint(complaint_id: str) -> dict:
    for c in _load_complaints():
        if c["id"] == complaint_id:
            return c
    raise ValueError(f"Unknown mock complaint id: {complaint_id}")


def list_complaints() -> list:
    return _load_complaints()


def working_text(complaint: dict) -> str:
    """The English text routing/agents should reason over."""
    return complaint.get("translated_text") or complaint["raw_text"]
