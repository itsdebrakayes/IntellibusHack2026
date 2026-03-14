import httpx
from typing import List, Tuple
from app.config import settings
from app.models.schemas import BreachEntry

XON_BASE = "https://api.xposedornot.com/v1"

async def check_email_breaches(email: str) -> List[BreachEntry]:
    url = f"{XON_BASE}/check-email/{email}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10.0)

    if response.status_code == 404:
        return []

    response.raise_for_status()
    raw = response.json()

    # Actual structure: {"breaches": [["MyFitnessPal"]], "status": "success"}
    breaches_raw = raw.get("breaches", [])

    breach_names = []
    for item in breaches_raw:
        if isinstance(item, list):
            breach_names.extend(item)
        elif isinstance(item, str):
            breach_names.append(item)

    return [
        BreachEntry(
            name=name,
            domain="",
            breach_date="Unknown",
            description="",
            data_classes=[],
        )
        for name in breach_names
    ]

def calculate_breach_risk_score(breach_count: int, data_classes_all: List[str]) -> Tuple[int, str]:
    """unchanged — keep your existing implementation"""
    HIGH_SENSITIVITY = {"Passwords", "Credit cards", "Bank account numbers", "Social security numbers"}
    MED_SENSITIVITY  = {"Phone numbers", "Physical addresses", "Dates of birth"}

    base_score = min(breach_count * 10, 50)

    flat = set(data_classes_all)
    if flat & HIGH_SENSITIVITY:
        sensitivity_bonus = 40
    elif flat & MED_SENSITIVITY:
        sensitivity_bonus = 20
    else:
        sensitivity_bonus = 10

    score = min(base_score + sensitivity_bonus, 100)

    if score >= 75:   label = "Critical"
    elif score >= 50: label = "High"
    elif score >= 25: label = "Medium"
    else:             label = "Low"

    return score, label


def _strip_html(text: str) -> str:
    import re
    return re.sub(r"<[^>]+>", "", text)