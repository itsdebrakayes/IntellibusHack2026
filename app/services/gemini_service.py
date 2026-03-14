import httpx
import json
import re
from typing import List, Tuple, Optional
from app.config import settings
from app.models.schemas import RecoveryStep, RedFlag

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


async def _call_gemini(prompt: str) -> str:
    """Core helper: send a prompt to Groq and return raw text response."""
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(GROQ_URL, headers=headers, json=payload, timeout=20.0)

    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


# ─── Recovery Plan Generation ─────────────────────────────────────────────────

async def generate_recovery_plan(
    email: str,
    breach_names: List[str],
    data_classes: List[str]
) -> Tuple[List[RecoveryStep], str]:
    prompt = f"""
You are a cybersecurity expert helping a non-technical user whose email was found in data breaches.

Email: {email}
Breached services: {', '.join(breach_names)}
Types of data exposed: {', '.join(set(data_classes))}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{{
  "summary": "A 2-sentence plain English explanation of what happened and the risk level.",
  "recovery_plan": [
    {{
      "timeframe": "Next 10 minutes",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }},
    {{
      "timeframe": "Next hour",
      "actions": ["Action 1", "Action 2"]
    }},
    {{
      "timeframe": "This week",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }}
  ]
}}

Keep actions short, specific, and actionable. No jargon.
"""
    raw = await _call_gemini(prompt)
    cleaned = _extract_json(raw)
    data = json.loads(cleaned)

    recovery_steps = [
        RecoveryStep(timeframe=step["timeframe"], actions=step["actions"])
        for step in data["recovery_plan"]
    ]

    return recovery_steps, data["summary"]


# ─── Email / Phishing Analysis ────────────────────────────────────────────────

async def analyze_email_content(
    content: str,
    sender: Optional[str],
    subject: Optional[str]
) -> Tuple[int, str, Optional[str], List[RedFlag], str, str]:
    prompt = f"""
You are a cybersecurity expert analyzing a suspicious email for phishing and scam indicators.

--- EMAIL ---
From: {sender or 'Unknown'}
Subject: {subject or 'Unknown'}
Body:
{content[:3000]}  
--- END EMAIL ---

Analyze this for phishing, scams, social engineering, and fraud. 
Respond ONLY with valid JSON (no markdown, no explanation):
{{
  "risk_score": <integer 0-100>,
  "risk_label": "<Safe|Low Risk|Suspicious|High Risk>",
  "scam_type": "<Phishing|Prize Scam|CEO Fraud|Romance Scam|Tech Support Scam|Advance Fee|None>",
  "red_flags": [
    {{
      "flag": "Short description of the red flag",
      "explanation": "Why this is suspicious in plain English"
    }}
  ],
  "verdict": "One sentence plain-English verdict.",
  "recommendation": "One sentence on what the user should do."
}}

Be specific. If no red flags exist, return an empty array and a low risk score.
"""
    raw = await _call_gemini(prompt)
    cleaned = _extract_json(raw)
    data = json.loads(cleaned)

    red_flags = [
        RedFlag(flag=f["flag"], explanation=f["explanation"])
        for f in data.get("red_flags", [])
    ]

    return (
        data["risk_score"],
        data["risk_label"],
        data.get("scam_type"),
        red_flags,
        data["verdict"],
        data["recommendation"],
    )


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> str:
    """Strip markdown code fences if model wraps the JSON in them."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text.strip()