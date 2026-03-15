import httpx
from typing import Tuple, Dict, Any, Optional
from app.config import settings

SE_BASE = "https://api.sightengine.com/1.0"


def _auth() -> Dict[str, str]:
    return {
        "api_user": settings.sightengine_api_user,
        "api_secret": settings.sightengine_api_secret,
    }


# ─── Image Detection (file upload) ───────────────────────────────────────────

async def detect_ai_image(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Detect AI-generated images via file upload."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SE_BASE}/check.json",
            data={**_auth(), "models": "genai"},
            files={"media": (filename, file_bytes)},
            timeout=30.0,
        )

    print(f"[SIGHTENGINE IMAGE] Status: {response.status_code}")
    print(f"[SIGHTENGINE IMAGE] Response: {response.text}")

    response.raise_for_status()
    data = response.json()

    ai_score = data.get("type", {}).get("ai_generated", 0)
    return _build_image_result(filename, ai_score, data)


# ─── Image Detection (URL) ────────────────────────────────────────────────────

async def detect_ai_image_url(image_url: str) -> Dict[str, Any]:
    """Detect AI-generated images via URL."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SE_BASE}/check.json",
            params={
                **_auth(),
                "models": "genai",
                "url": image_url,
            },
            timeout=30.0,
        )

    print(f"[SIGHTENGINE IMAGE URL] Status: {response.status_code}")
    print(f"[SIGHTENGINE IMAGE URL] Response: {response.text}")

    response.raise_for_status()
    data = response.json()

    ai_score = data.get("type", {}).get("ai_generated", 0)
    return _build_image_result(image_url, ai_score, data)


def _build_image_result(filename: str, ai_score: float, raw: dict) -> Dict[str, Any]:
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
        "raw": raw,
    }


# ─── Video Detection ──────────────────────────────────────────────────────────

async def detect_ai_video(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Detect AI-generated video using Sightengine sync endpoint.
    Works for videos under 1 minute.
    """
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{SE_BASE}/video/check-sync.json",
            data={**_auth(), "models": "genai"},
            files={"media": (filename, file_bytes)},
        )

    print(f"[SIGHTENGINE VIDEO] Status: {response.status_code}")
    print(f"[SIGHTENGINE VIDEO] Response: {response.text}")

    response.raise_for_status()
    data = response.json()

    # Response returns frames list — take the max ai_generated score across all frames
    frames = data.get("data", {}).get("frames", [])
    if frames:
        ai_score = max(
            f.get("type", {}).get("ai_generated", 0) for f in frames
        )
    else:
        # Fallback — some responses return top-level type
        ai_score = data.get("type", {}).get("ai_generated", 0)

    risk_score = int(ai_score * 100)

    if risk_score >= 70:
        verdict = "This video is very likely AI-generated."
        recommendation = "Do not share or trust this video as authentic."
        risk_label = "High Risk"
    elif risk_score >= 40:
        verdict = "This video shows AI generation indicators. Verify before trusting."
        recommendation = "Cross-check this video with other reliable sources."
        risk_label = "Suspicious"
    else:
        verdict = "This video appears to be authentic."
        recommendation = "No significant AI generation signals detected."
        risk_label = "Safe"

    return {
        "media_type": "video",
        "filename": filename,
        "deepfake_score": ai_score,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "verdict": verdict,
        "recommendation": recommendation,
        "raw": data,
    }


# ─── Audio Detection ──────────────────────────────────────────────────────────

async def detect_ai_audio(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Detect synthetic or AI-generated audio using Sightengine."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{SE_BASE}/audio/check.json",
            data={**_auth(), "models": "genai"},
            files={"audio": (filename, file_bytes)},  # NOTE: "audio" not "media"
        )

    print(f"[SIGHTENGINE AUDIO] Status: {response.status_code}")
    print(f"[SIGHTENGINE AUDIO] Response: {response.text}")

    response.raise_for_status()
    data = response.json()

    # Audio response returns type.ai_generated same as image
    ai_score = data.get("type", {}).get("ai_generated", 0)
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

async def detect_ai_video_url(video_url: str) -> Dict[str, Any]:
    """Detect AI-generated video via URL using Sightengine sync endpoint."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{SE_BASE}/video/check-sync.json",
            data={
                **_auth(),
                "models": "genai",
                "url": video_url,
            },
        )

    print(f"[SIGHTENGINE VIDEO URL] Status: {response.status_code}")
    print(f"[SIGHTENGINE VIDEO URL] Response: {response.text}")

    response.raise_for_status()
    data = response.json()

    frames = data.get("data", {}).get("frames", [])
    if frames:
        ai_score = max(f.get("type", {}).get("ai_generated", 0) for f in frames)
    else:
        ai_score = data.get("type", {}).get("ai_generated", 0)

    risk_score = int(ai_score * 100)

    if risk_score >= 70:
        verdict = "This video is very likely AI-generated."
        recommendation = "Do not share or trust this video as authentic."
        risk_label = "High Risk"
    elif risk_score >= 40:
        verdict = "This video shows AI generation indicators. Verify before trusting."
        recommendation = "Cross-check this video with other reliable sources."
        risk_label = "Suspicious"
    else:
        verdict = "This video appears to be authentic."
        recommendation = "No significant AI generation signals detected."
        risk_label = "Safe"

    return {
        "media_type": "video",
        "filename": video_url,
        "deepfake_score": ai_score,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "verdict": verdict,
        "recommendation": recommendation,
        "raw": data,
    }