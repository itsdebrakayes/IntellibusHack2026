import httpx
import base64
from typing import List, Tuple, Optional
from app.config import settings
from app.models.schemas import VirusTotalResult

# ─── Google Safe Browsing ─────────────────────────────────────────────────────

GSB_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"

THREAT_TYPES = [
    "MALWARE",
    "SOCIAL_ENGINEERING",   # Phishing
    "UNWANTED_SOFTWARE",
    "POTENTIALLY_HARMFUL_APPLICATION",
]

async def check_google_safe_browsing(url: str) -> List[str]:
    """
    Check a URL against Google Safe Browsing API.
    Returns a list of threat type strings found, or empty list if clean.
    """
    payload = {
        "client": {"clientId": "breachbuddy", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": THREAT_TYPES,
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    params = {"key": settings.google_safe_browsing_api_key}

    async with httpx.AsyncClient() as client:
        response = await client.post(GSB_URL, json=payload, params=params, timeout=10.0)

    response.raise_for_status()
    data = response.json()

    # If matches key exists and has items, threats were found
    matches = data.get("matches", [])
    return [m.get("threatType", "UNKNOWN") for m in matches]


# ─── VirusTotal ───────────────────────────────────────────────────────────────

VT_BASE = "https://www.virustotal.com/api/v3"

async def scan_url_virustotal(url: str) -> VirusTotalResult:
    """
    Submit URL to VirusTotal and return aggregated engine results.
    Note: VirusTotal free tier = 4 requests/minute, 500/day.
    """
    headers = {"x-apikey": settings.virustotal_api_key}

    # VirusTotal requires the URL to be base64url encoded
    url_id = base64.urlsafe_b64encode(url.encode()).decode().rstrip("=")

    async with httpx.AsyncClient() as client:
        # First, submit the URL for analysis
        submit_resp = await client.post(
            f"{VT_BASE}/urls",
            headers=headers,
            data={"url": url},
            timeout=15.0
        )
        submit_resp.raise_for_status()

        # Then fetch the analysis results using the URL identifier
        result_resp = await client.get(
            f"{VT_BASE}/urls/{url_id}",
            headers=headers,
            timeout=15.0
        )
        result_resp.raise_for_status()

    data = result_resp.json()
    stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
    results = data.get("data", {}).get("attributes", {}).get("last_analysis_results", {})

    malicious = stats.get("malicious", 0)
    suspicious = stats.get("suspicious", 0)
    undetected = stats.get("undetected", 0)
    total = malicious + suspicious + undetected + stats.get("harmless", 0)

    # Pull engine names that flagged this URL
    flagging_engines = [
        engine for engine, detail in results.items()
        if detail.get("category") in ("malicious", "suspicious")
    ][:5]  # Top 5 only

    return VirusTotalResult(
        total_engines=total,
        malicious_count=malicious,
        suspicious_count=suspicious,
        clean_count=undetected,
        engine_highlights=flagging_engines,
    )


# ─── Risk Scoring ─────────────────────────────────────────────────────────────

def calculate_link_risk_score(
    gsb_flags: List[str],
    vt_result: Optional[VirusTotalResult]
) -> Tuple[int, str, bool]:
    """
    Combine GSB and VirusTotal signals into a single 0-100 risk score.
    Returns (score, label, is_safe)
    """
    score = 0

    # Google Safe Browsing is high-confidence — weight heavily
    if "MALWARE" in gsb_flags:
        score += 60
    if "SOCIAL_ENGINEERING" in gsb_flags:
        score += 55
    if "UNWANTED_SOFTWARE" in gsb_flags:
        score += 40

    # VirusTotal contribution
    if vt_result:
        vt_ratio = vt_result.malicious_count / max(vt_result.total_engines, 1)
        score += int(vt_ratio * 40)  # Up to 40 points from VT

    score = min(score, 100)
    is_safe = score < 20

    if score >= 70:
        label = "High Risk"
    elif score >= 40:
        label = "Suspicious"
    elif score >= 20:
        label = "Low Risk"
    else:
        label = "Safe"

    return score, label, is_safe
