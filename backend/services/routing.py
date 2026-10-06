"""
Stage 3: Department Routing & Chandigarh Sector Detection

This module performs:
1. Sector/Ward Detection: Automatically extracts Chandigarh sector mentions (e.g. Sector 22, Sector-46, Manimajra, Dhanas).
2. Department Routing: Matches complaint text against the official Chandigarh municipal departments
   (MCC Water Supply, CPDL Electricity, MCC Sanitation & Waste, MCC Roads & Infrastructure, RTI).
"""

import json
import os
import re

POLICY_PATH = os.path.join(
    os.path.dirname(__file__), "..", "mock_data", "department_policies.json"
)

# Known Chandigarh landmark / non-numeric sector mappings
CHANDIGARH_AREAS = {
    "manimajra": "Sector 13 (Manimajra)",
    "mani majra": "Sector 13 (Manimajra)",
    "sector 13": "Sector 13 (Manimajra)",
    "dhanas": "Sector 14 West (Dhanas)",
    "maloya": "Sector 39 West (Maloya)",
    "dadumajra": "Sector 39 West (Dadu Majra)",
    "dadu majra": "Sector 39 West (Dadu Majra)",
    "industrial area phase 1": "Industrial Area Phase 1",
    "industrial area phase 2": "Industrial Area Phase 2",
    "industrial area phase i": "Industrial Area Phase 1",
    "industrial area phase ii": "Industrial Area Phase 2",
    "industrial area": "Industrial Area",
    "burail": "Sector 45 (Burail)",
    "kajheri": "Sector 52 (Kajheri)",
    "hallomajra": "Hallomajra",
    "halo majra": "Hallomajra",
    "sarangpur": "Sector 12 West (Sarangpur)"
}


def _load_departments() -> dict:
    """Loads department metadata from JSON (or storage)."""
    with open(POLICY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def detect_chandigarh_sector(text: str) -> str:
    """Extracts mentioned Chandigarh sector or area from grievance text."""
    lower = text.lower()

    # Check known area names first
    for area, canonical in CHANDIGARH_AREAS.items():
        if area in lower:
            return canonical

    # Match numeric sectors: Sector 1 to Sector 63 with optional sub-sector
    # Handles: "Sector 22", "Sector-22-B", "Sec 35 C", "Sector 19C", "Sec-46"
    match = re.search(r"\b(?:sec(?:tor)?\.?)[-\s]*([0-9]{1,2})(?:[-\s]*([a-dA-D]))?\b", text, re.IGNORECASE)
    if match:
        sec_num = match.group(1)
        sub_sec = match.group(2).upper() if match.group(2) else ""
        if int(sec_num) <= 63:
            return f"Sector {sec_num}" + (f"-{sub_sec}" if sub_sec else "")

    return None


def _keyword_matches(keyword: str, text: str) -> bool:
    """Accurate keyword matching with word boundaries for short words to avoid substring false positives."""
    kw = keyword.lower()
    if len(kw) <= 4 and " " not in kw:
        return bool(re.search(r"\b" + re.escape(kw) + r"\b", text))
    return kw in text


def route_complaint(complaint_text: str) -> dict:
    """
    Returns the best-matching department id + name + score, along with any detected
    Chandigarh sector or municipal jurisdiction.
    """
    text = complaint_text.lower()
    departments = _load_departments()
    detected_sector = detect_chandigarh_sector(complaint_text)

    scores = {}
    for dept_id, dept in departments.items():
        scores[dept_id] = sum(1 for kw in dept["keywords"] if _keyword_matches(kw, text))

    best_id = max(scores, key=scores.get)
    if scores[best_id] == 0:
        return {
            "department_id": "general",
            "department_name": "General Municipal Administration",
            "score": 0,
            "detected_sector": detected_sector,
            "official_authority": "Municipal Corporation Chandigarh (MCC)",
            "helpline": "0172-2787200",
            "office_location": "New Deluxe Building, Sector 17, Chandigarh"
        }

    matched_dept = departments[best_id]
    return {
        "department_id": best_id,
        "department_name": matched_dept["department_name"],
        "official_authority": matched_dept.get("official_authority", "Municipal Corporation Chandigarh (MCC)"),
        "helpline": matched_dept.get("helpline", "0172-2787200"),
        "office_location": matched_dept.get("office_location", "Sector 17, Chandigarh"),
        "score": scores[best_id],
        "detected_sector": detected_sector,
    }
