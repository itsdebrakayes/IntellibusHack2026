from fastapi import APIRouter, HTTPException
from app.models.schemas import EmailAnalysisRequest, EmailAnalysisResponse
from app.services import gemini_service, scanner_service
from app.utils.url_extractor import extract_urls, is_valid_url

router = APIRouter()


@router.post("/email", response_model=EmailAnalysisResponse)
async def analyze_email(request: EmailAnalysisRequest):
    """
    Full phishing and scam analysis of an email.
    
    - Extracts all URLs from the body and scans them
    - Uses Gemini AI to detect social engineering patterns
    - Returns a unified risk score combining both signals
    """
    # Step 1: Extract URLs from the email body
    found_urls = extract_urls(request.content)

    # Step 2: Scan extracted URLs (scan up to 3 to stay within rate limits)
    link_scores = []
    for url in found_urls[:3]:
        if not is_valid_url(url):
            continue
        try:
            gsb_flags = await scanner_service.check_google_safe_browsing(url)
            vt_result = await scanner_service.scan_url_virustotal(url)
            score, _, _ = scanner_service.calculate_link_risk_score(gsb_flags, vt_result)
            link_scores.append(score)
        except Exception as e:
            print(f"[WARN] Could not scan URL {url}: {e}")

    # Step 3: Gemini AI content analysis
    try:
        ai_score, ai_label, scam_type, red_flags, verdict, recommendation = \
            await gemini_service.analyze_email_content(
                content=request.content,
                sender=request.sender,
                subject=request.subject,
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    # Step 4: Combine AI score with link scan scores
    # Take the worst signal — a single malicious link overrides a "safe" body
    max_link_score = max(link_scores, default=0)
    final_score = max(ai_score, max_link_score)

    # Recalculate label based on final combined score
    if final_score >= 70:
        final_label = "High Risk"
    elif final_score >= 40:
        final_label = "Suspicious"
    elif final_score >= 20:
        final_label = "Low Risk"
    else:
        final_label = "Safe"

    return EmailAnalysisResponse(
        risk_score=final_score,
        risk_label=final_label,
        scam_type=scam_type,
        red_flags=red_flags,
        links_found=found_urls,
        verdict=verdict,
        recommendation=recommendation,
    )
