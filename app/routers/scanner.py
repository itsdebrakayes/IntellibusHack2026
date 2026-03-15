from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import LinkScanRequest, LinkScanResponse
from app.services import scanner_service, supabase_service
from app.middleware.auth import get_optional_user
from app.utils.url_extractor import is_valid_url

router = APIRouter()


@router.post("/link", response_model=LinkScanResponse)
async def scan_link(request: LinkScanRequest, user=Depends(get_optional_user)):
    if not is_valid_url(request.url):
        raise HTTPException(status_code=422, detail="Invalid URL format.")

    cached = supabase_service.get_cached_url(request.url)
    if cached:
        print(f"[CACHE HIT] {request.url}")
        return LinkScanResponse(**cached["result"])

    gsb_flags = []
    vt_result = None

    try:
        gsb_flags = await scanner_service.check_google_safe_browsing(request.url)
    except Exception as e:
        print(f"[WARN] Google Safe Browsing failed: {e}")

    try:
        vt_result = await scanner_service.scan_url_virustotal(request.url)
    except Exception as e:
        print(f"[WARN] VirusTotal scan failed: {e}")

    risk_score, risk_label, is_safe = scanner_service.calculate_link_risk_score(
        gsb_flags, vt_result
    )

    if is_safe:
        verdict = "This URL appears safe based on our checks."
        recommendation = "You can proceed, but always stay cautious with unfamiliar links."
    elif risk_score >= 70:
        engines = vt_result.malicious_count if vt_result else 0
        verdict = (
            f"This URL is flagged as dangerous. "
            f"Google marked it as {', '.join(gsb_flags) or 'suspicious'}"
            + (f" and {engines} antivirus engines flagged it." if engines else ".")
        )
        recommendation = "Do NOT visit this link. Mark the email as phishing and delete it."
    else:
        verdict = "This URL shows some suspicious signals. Proceed with caution."
        recommendation = "Avoid entering any personal information on this site."

    response = LinkScanResponse(
        url=request.url,
        is_safe=is_safe,
        risk_score=risk_score,
        risk_label=risk_label,
        google_safe_browsing_flags=gsb_flags,
        virustotal=vt_result,
        verdict=verdict,
        recommendation=recommendation,
    )

    try:
        supabase_service.save_cached_url(
            url=request.url,
            risk_score=risk_score,
            risk_label=risk_label,
            result=response.model_dump(),
        )
    except Exception as e:
        print(f"[WARN] Could not cache URL result: {e}")

    return response

    try:
        vt_result = await scanner_service.scan_url_virustotal(request.url)
    except Exception as e:
        print(f"[WARN] VirusTotal scan failed: {e}")  # check terminal for this