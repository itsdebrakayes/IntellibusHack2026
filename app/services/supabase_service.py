from supabase import create_client, Client
from app.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


# ─── Breach History ───────────────────────────────────────────────────────────

def save_breach_result(user_id: str, email: str, breach_count: int,
                       risk_score: int, result: dict):
    supabase.table("breach_checks").insert({
        "user_id": user_id,
        "email": email,
        "breach_count": breach_count,
        "risk_score": risk_score,
        "result": result,
    }).execute()


def get_breach_history(user_id: str):
    res = supabase.table("breach_checks")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(20)\
        .execute()
    return res.data


# ─── URL Cache ────────────────────────────────────────────────────────────────

def get_cached_url(url: str):
    try:
        res = supabase.table("scanned_urls")\
            .select("*")\
            .eq("url", url)\
            .execute()
        if res.data:
            return res.data[0]
    except Exception:
        pass
    return None


def save_cached_url(url: str, risk_score: int, risk_label: str, result: dict):
    supabase.table("scanned_urls").upsert({
        "url": url,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "result": result,
    }).execute()


# ─── Email Analysis History ───────────────────────────────────────────────────

def save_analysis_result(user_id: str, subject: str,
                         risk_score: int, result: dict):
    supabase.table("email_analyses").insert({
        "user_id": user_id,
        "subject": subject,
        "risk_score": risk_score,
        "result": result,
    }).execute()


def get_analysis_history(user_id: str):
    res = supabase.table("email_analyses")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(20)\
        .execute()
    return res.data


# ─── Dashboard Summary ────────────────────────────────────────────────────────

def get_dashboard_summary(user_id: str):
    breaches = supabase.table("breach_checks")\
        .select("risk_score, created_at")\
        .eq("user_id", user_id)\
        .execute().data

    analyses = supabase.table("email_analyses")\
        .select("risk_score, created_at")\
        .eq("user_id", user_id)\
        .execute().data

    return {
        "total_breach_checks": len(breaches),
        "total_email_analyses": len(analyses),
        "avg_breach_risk": round(
            sum(b["risk_score"] for b in breaches) / len(breaches), 1
        ) if breaches else 0,
        "avg_email_risk": round(
            sum(a["risk_score"] for a in analyses) / len(analyses), 1
        ) if analyses else 0,
        "high_risk_count": len([
            x for x in breaches + analyses if x["risk_score"] >= 70
        ]),

        
    }
# ─── media Summary ────────────────────────────────────────────────────────
def save_media_scan(user_id: str, media_type: str, filename: str,
                    risk_score: int, result: dict):
    supabase.table("media_scans").insert({
        "user_id": user_id,
        "media_type": media_type,
        "filename": filename,
        "risk_score": risk_score,
        "result": result,
    }).execute()


def get_media_history(user_id: str):
    res = supabase.table("media_scans")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(20)\
        .execute()
    return res.data