from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from app.models.schemas import MediaScanResponse
from app.services import sightengine_service, supabase_service
from app.middleware.auth import get_optional_user

router = APIRouter()

ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO = {"video/mp4", "video/quicktime", "video/x-msvideo"}
ALLOWED_AUDIO = {"audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"}

class ImageUrlRequest(BaseModel):
    url: str


@router.post("/image", response_model=MediaScanResponse)
async def scan_image(
    file: UploadFile = File(...),
    user=Depends(get_optional_user)
):
    if file.content_type not in ALLOWED_IMAGE:
        raise HTTPException(status_code=422, detail="Unsupported file type. Allowed: JPEG, PNG, WEBP")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="File too large. Max 10MB.")

    try:
        result = await sightengine_service.detect_ai_image(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image scan failed: {str(e)}")

    if user:
        try:
            supabase_service.save_media_scan(
                user_id=str(user.id),
                media_type="image",
                filename=file.filename,
                risk_score=result["risk_score"],
                result=result,
            )
        except Exception as e:
            print(f"[WARN] Could not save image scan: {e}")

    return MediaScanResponse(**result)

class VideoUrlRequest(BaseModel):
    url: str

@router.post("/image-url", response_model=MediaScanResponse)
async def scan_image_url(
    request: ImageUrlRequest,
    user=Depends(get_optional_user)
):
    try:
        result = await sightengine_service.detect_ai_image_url(request.url)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image URL scan failed: {str(e)}")

    if user:
        try:
            supabase_service.save_media_scan(
                user_id=str(user.id),
                media_type="image_url",
                filename=request.url,
                risk_score=result["risk_score"],
                result=result,
            )
        except Exception as e:
            print(f"[WARN] Could not save image URL scan: {e}")

    return MediaScanResponse(**result)


@router.post("/video", response_model=MediaScanResponse)
async def scan_video(
    file: UploadFile = File(...),
    user=Depends(get_optional_user)
):
    if file.content_type not in ALLOWED_VIDEO:
        raise HTTPException(status_code=422, detail="Unsupported file type. Allowed: MP4, MOV, AVI")

    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="File too large. Max 50MB.")

    try:
        result = await sightengine_service.detect_ai_video(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Video scan failed: {str(e)}")

    if user:
        try:
            supabase_service.save_media_scan(
                user_id=str(user.id),
                media_type="video",
                filename=file.filename,
                risk_score=result["risk_score"],
                result=result,
            )
        except Exception as e:
            print(f"[WARN] Could not save video scan: {e}")

    return MediaScanResponse(**result)


@router.post("/audio", response_model=MediaScanResponse)
async def scan_audio(
    file: UploadFile = File(...),
    user=Depends(get_optional_user)
):
    if file.content_type not in ALLOWED_AUDIO:
        raise HTTPException(status_code=422, detail="Unsupported file type. Allowed: MP3, WAV, M4A")

    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="File too large. Max 20MB.")

    try:
        result = await sightengine_service.detect_ai_audio(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Audio scan failed: {str(e)}")

    if user:
        try:
            supabase_service.save_media_scan(
                user_id=str(user.id),
                media_type="audio",
                filename=file.filename,
                risk_score=result["risk_score"],
                result=result,
            )
        except Exception as e:
            print(f"[WARN] Could not save audio scan: {e}")

    return MediaScanResponse(**result)

class VideoUrlRequest(BaseModel):
    url: str

@router.post("/video-url", response_model=MediaScanResponse)
async def scan_video_url(
    request: VideoUrlRequest,
    user=Depends(get_optional_user)
):
    try:
        result = await sightengine_service.detect_ai_video_url(request.url)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Video URL scan failed: {str(e)}")

    if user:
        try:
            supabase_service.save_media_scan(
                user_id=str(user.id),
                media_type="video_url",
                filename=request.url,
                risk_score=result["risk_score"],
                result=result,
            )
        except Exception as e:
            print(f"[WARN] Could not save video URL scan: {e}")

    return MediaScanResponse(**result)