from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict


# ─── Breach Check ────────────────────────────────────────────────────────────

class BreachRequest(BaseModel):
    email: str

class BreachEntry(BaseModel):
    name: str
    domain: str
    breach_date: str
    description: str
    data_classes: List[str]  # e.g. ["Passwords", "Email addresses"]

class RecoveryStep(BaseModel):
    timeframe: str            # "Next 10 minutes" / "Next hour" / "This week"
    actions: List[str]

class BreachResponse(BaseModel):
    email: str
    breach_count: int
    breaches: List[BreachEntry]
    risk_score: int           # 0-100
    risk_label: str           # "Low" / "Medium" / "High" / "Critical"
    recovery_plan: List[RecoveryStep]
    summary: str              # Plain English summary from Gemini


# ─── Link Scanner ─────────────────────────────────────────────────────────────

class LinkScanRequest(BaseModel):
    url: str

class VirusTotalResult(BaseModel):
    total_engines: int
    malicious_count: int
    suspicious_count: int
    clean_count: int
    engine_highlights: List[str]   # Top flagging engines

class LinkScanResponse(BaseModel):
    url: str
    is_safe: bool
    risk_score: int                # 0-100
    risk_label: str
    google_safe_browsing_flags: List[str]  # e.g. ["MALWARE", "SOCIAL_ENGINEERING"]
    virustotal: Optional[VirusTotalResult]
    verdict: str                   # Plain English e.g. "This URL is flagged by 12 engines as phishing"
    recommendation: str


# ─── Email / Text Analysis ───────────────────────────────────────────────────

class EmailAnalysisRequest(BaseModel):
    content: str               # Raw email text or message body
    sender: Optional[str] = None
    subject: Optional[str] = None

class RedFlag(BaseModel):
    flag: str                  # e.g. "Urgency language detected"
    explanation: str           # Why this is suspicious

class EmailAnalysisResponse(BaseModel):
    risk_score: int            # 0-100
    risk_label: str
    scam_type: Optional[str]   # e.g. "Phishing", "Prize Scam", "CEO Fraud"
    red_flags: List[RedFlag]
    links_found: List[str]     # URLs extracted from the email body
    verdict: str               # One-sentence plain English verdict
    recommendation: str


# ─── Unified / Combined ──────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    services: Dict[str, str]   # e.g. {"hibp": "ok", "virustotal": "ok"}
