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
    risk_label: str           
    recovery_plan: List[RecoveryStep]
    summary: str              # Plain English summary from groq


# ─── Link Scanner ─────────────────────────────────────────────────────────────

class LinkScanRequest(BaseModel):
    url: str

class VirusTotalResult(BaseModel):
    total_engines: int
    malicious_count: int
    suspicious_count: int
    clean_count: int
    engine_highlights: List[str]   

class LinkScanResponse(BaseModel):
    url: str
    is_safe: bool
    risk_score: int                # 0-100
    risk_label: str
    google_safe_browsing_flags: List[str]  
    virustotal: Optional[VirusTotalResult]
    verdict: str                   # Plain English e.g. "This URL is flagged by 12 engines as phishing"
    recommendation: str


# ─── Email / Text Analysis ───────────────────────────────────────────────────

class EmailAnalysisRequest(BaseModel):
    content: str            
    sender: Optional[str] = None
    subject: Optional[str] = None

class RedFlag(BaseModel):
    flag: str                  
    explanation: str           

class EmailAnalysisResponse(BaseModel):
    risk_score: int            # 0-100
    risk_label: str
    scam_type: Optional[str]   
    red_flags: List[RedFlag]
    links_found: List[str]     # URLs extracted from the email body
    verdict: str               # One-sentence plain English verdict
    recommendation: str

# ─── Media Detection ──────────────────────────────────────────────────────────

class MediaScanResponse(BaseModel):
    media_type: str
    filename: str
    risk_score: int
    risk_label: str
    verdict: str
    recommendation: str
    ai_generated_score: Optional[float] = None
    deepfake_score: Optional[float] = None
    ai_voice_score: Optional[float] = None


# ─── Unified / Combined ──────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    services: Dict[str, str]  
