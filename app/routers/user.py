from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.services import supabase_service

router = APIRouter()


@router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    return supabase_service.get_dashboard_summary(str(user.id))


@router.get("/breach-history")
async def breach_history(user=Depends(get_current_user)):
    return supabase_service.get_breach_history(str(user.id))


@router.get("/email-history")
async def email_history(user=Depends(get_current_user)):
    return supabase_service.get_analysis_history(str(user.id))

@router.get("/media-history")
async def media_history(user=Depends(get_current_user)):
    return supabase_service.get_media_history(str(user.id))