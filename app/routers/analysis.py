from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import EmailAnalysisRequest, EmailAnalysisResponse
from app.services import gemini_service, scanner_service, supabase_service
from app.middleware.auth import get_optional_user
from app.utils.url_extractor import extract_urls, is_valid_url

router = APIRouter()


@router.post("/email", response_model=EmailAnalysisResponse)
async def analyze_email(request: EmailAnalysisRequest, user=Depends(get_optional_user)):
    found_urls = extract_urls(request.content)

    link_scores = []
    for url in found_urls[:3]:
        if not is_valid_url(url):
            continue
        try:
            cached = supabase_service.get_cached_url(url)
            if cached:
                print(f"[CACHE HIT] {url}")
                link_scores.append(cached["risk_score"])
                continue

            gsb_flags = await scanner_service.check_google_safe_browsing(url)
            vt_result = await scanner_service.scan_url_virustotal(url)
            score, risk_label, _ = scanner_service.calculate_link_risk_score(
                gsb_flags, vt_result
            )
            link_scores.append(score)

            supabase_service.save_cached_url(
                url=url,
                risk_score=score,
                risk_label=risk_label,
                result={"url": url, "risk_score": score, "risk_label": risk_label},
            )
        except Exception as e:
            print(f"[WARN] Could not scan URL {url}: {e}")

    try:
        ai_score, ai_label, scam_type, red_flags, verdict, recommendation = \
            await gemini_service.analyze_email_content(
                content=request.content,
                sender=request.sender,
                subject=request.subject,
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    max_link_score = max(link_scores, default=0)
    final_score = max(ai_score, max_link_score)

    if final_score >= 70:
        final_label = "High Risk"
    elif final_score >= 40:
        final_label = "Suspicious"
    elif final_score >= 20:
        final_label = "Low Risk"
    else:
        final_label = "Safe"

    response = EmailAnalysisResponse(
        risk_score=final_score,
        risk_label=final_label,
        scam_type=scam_type,
        red_flags=red_flags,
        links_found=found_urls,
        verdict=verdict,
        recommendation=recommendation,
    )

    if user:
        try:
            supabase_service.save_analysis_result(
                user_id=str(user.id),
                subject=request.subject or "No subject",
                risk_score=final_score,
                result=response.model_dump(),
            )
        except Exception as e:
            print(f"[WARN] Could not save analysis result: {e}")

    return response
