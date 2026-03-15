from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import BreachRequest, BreachResponse
from app.services import XposedorNot, gemini_service, supabase_service
from app.middleware.auth import get_optional_user

router = APIRouter()


@router.post("/check", response_model=BreachResponse)
async def check_breach(request: BreachRequest, user=Depends(get_optional_user)):
    try:
        breaches = await XposedorNot.check_email_breaches(request.email)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Breach service error: {str(e)}")

    all_data_classes = [cls for b in breaches for cls in b.data_classes]
    risk_score, risk_label = XposedorNot.calculate_breach_risk_score(
        len(breaches), all_data_classes
    )

    if breaches:
        try:
            breach_names = [b.name for b in breaches]
            recovery_plan, summary = await gemini_service.generate_recovery_plan(
                email=request.email,
                breach_names=breach_names,
                data_classes=all_data_classes,
            )
        except Exception:
            recovery_plan = []
            summary = f"Your email was found in {len(breaches)} data breach(es). Update your passwords immediately."
    else:
        recovery_plan = []
        summary = "Great news — your email was not found in any known data breaches."
        risk_score = 0
        risk_label = "Low"

    response = BreachResponse(
        email=request.email,
        breach_count=len(breaches),
        breaches=breaches,
        risk_score=risk_score,
        risk_label=risk_label,
        recovery_plan=recovery_plan,
        summary=summary,
    )

    if user:
        try:
            supabase_service.save_breach_result(
                user_id=str(user.id),
                email=request.email,
                breach_count=len(breaches),
                risk_score=risk_score,
                result=response.model_dump(),
            )
        except Exception as e:
            print(f"[WARN] Could not save breach result: {e}")

    return response