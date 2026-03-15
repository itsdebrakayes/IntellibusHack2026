from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Load configuration from environment variables."""
    
    # optional environment marker (unused by app but often set by deploys)
    app_env: Optional[str] = None
    
    # HIBP API
    hibp_api_key: Optional[str] = None
    
    # Google Gemini AI
    gemini_api_key: Optional[str] = None
    
    # Google Safe Browsing
    google_safe_browsing_api_key: Optional[str] = None
    
    # VirusTotal
    virustotal_api_key: Optional[str] = None

    groq_api_key: Optional[str] = None
    
    supabase_url: Optional[str] = None
    
    supabase_key: Optional[str] = None

    sightengine_api_user: Optional[str] = None
    
    sightengine_api_secret: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
