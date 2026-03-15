import httpx
from typing import Tuple, Dict, Any
from app.config import settings

SE_BASE = "https://api.sightengine.com/1.0"


def _auth() -> Dict[str, str]:
    return {
        "api_user": settings.sightengine_api_user,
        "api_secret": settings.sightengine_api_secret,
    }


# ─── Image Detection ──────────────────────────────────────────────────────────

async def detect_ai_image(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Detect AI-generated or manipulated images using Sightengine.
    Returns structured result with risk score.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SE_BASE}/check.json",
            data={
                **_auth(),
                "models": "genai",
            },
            files={"media": (filename, file_bytes)},
            timeout=30.0,
        )

    response.raise_for_status()
    data = response.json()

    ai_score = data.get("type", {}).get("ai_generated", 0)
    risk_score = int(ai_score * 100)

    if risk_score >= 70:
        verdict = "This image is very likely AI-generated or digitally manipulated."
        recommendation = "Do not trust this image as authentic evidence."
        risk_label = "High Risk"
    elif risk_score >= 40:
        verdict = "This image shows signs of AI generation or manipulation."
        recommendation = "Treat this image with caution and verify from other sources."
        risk_label = "Suspicious"
    else:
        verdict = "This image appears to be authentic."
        recommendation = "No significant manipulation detected."
        risk_label = "Safe"

    return {
        "media_type": "image",
        "filename": filename,
        "ai_generated_score": ai_score,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "verdict": verdict,
        "recommendation": recommendation,
        "raw": data,
    }


# ─── Video Detection ──────────────────────────────────────────────────────────

async def detect_ai_video(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Detect deepfake or AI-generated video using Sightengine.
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{SE_BASE}/video/check.json",
            data={
                **_auth(),
                "models": "deepfake",
            },
            files={"media": (filename, file_bytes)},
        )

    response.raise_for_status()
    data = response.json()

    deepfake_score = data.get("deepfake", {}).get("score", 0)
    risk_score = int(deepfake_score * 100)

    if risk_score >= 70:
        verdict = "This video is very likely a deepfake or AI-generated."
        recommendation = "Do not share or trust this video as authentic."
        risk_label = "High Risk"
    elif risk_score >= 40:
        verdict = "This video shows deepfake indicators. Verify before trusting."
        recommendation = "Cross-check this video with other reliable sources."
        risk_label = "Suspicious"
    else:
        verdict = "This video appears to be authentic."
        recommendation = "No significant deepfake signals detected."
        risk_label = "Safe"

    return {
        "media_type": "video",
        "filename": filename,
        "deepfake_score": deepfake_score,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "verdict": verdict,
        "recommendation": recommendation,
        "raw": data,
    }


# ─── Audio Detection ──────────────────────────────────────────────────────────

async def detect_ai_audio(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Detect synthetic or AI-generated audio using Sightengine.
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{SE_BASE}/audio/check.json",
            data={
                **_auth(),
                "models": "genai-voice",
            },
            files={"media": (filename, file_bytes)},
        )

    response.raise_for_status()
    data = response.json()

    ai_score = data.get("voice", {}).get("ai_generated", 0)
    risk_score = int(ai_score * 100)

    if risk_score >= 70:
        verdict = "This audio is very likely AI-generated or synthetic."
        recommendation = "Do not trust this audio as a genuine human voice."
        risk_label = "High Risk"
    elif risk_score >= 40:
        verdict = "This audio shows signs of AI voice synthesis."
        recommendation = "Verify the identity of the speaker through other means."
        risk_label = "Suspicious"
    else:
        verdict = "This audio appears to be authentic."
        recommendation = "No significant synthetic voice signals detected."
        risk_label = "Safe"

    return {
        "media_type": "audio",
        "filename": filename,
        "ai_voice_score": ai_score,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "verdict": verdict,
        "recommendation": recommendation,
        "raw": data,
    }