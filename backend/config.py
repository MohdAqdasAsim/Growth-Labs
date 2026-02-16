"""Configuration settings for the application."""
import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL: str = "gemini-3-flash-preview"  # Using Gemini 2.0 Flash Experimental (closest to 3 Flash)

# JWT Authentication (legacy - will be removed after full Clerk migration)
_jwt_secret = os.getenv("JWT_SECRET_KEY")
if not _jwt_secret:
    raise ValueError("JWT_SECRET_KEY environment variable is required")
JWT_SECRET_KEY: str = _jwt_secret
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_HOURS: int = 24

# Clerk Authentication
_clerk_secret = os.getenv("CLERK_SECRET_KEY")
if not _clerk_secret:
    raise ValueError("CLERK_SECRET_KEY environment variable is required")
CLERK_SECRET_KEY: str = _clerk_secret

_clerk_publishable = os.getenv("CLERK_PUBLISHABLE_KEY")
if not _clerk_publishable:
    raise ValueError("CLERK_PUBLISHABLE_KEY environment variable is required")
CLERK_PUBLISHABLE_KEY: str = _clerk_publishable

_clerk_webhook = os.getenv("CLERK_WEBHOOK_SECRET")
if not _clerk_webhook:
    raise ValueError(
        "CLERK_WEBHOOK_SECRET environment variable is required. "
        "Get it from Clerk Dashboard → Webhooks → [Your Endpoint] → Signing Secret"
    )
CLERK_WEBHOOK_SECRET: str = _clerk_webhook

_clerk_jwks = os.getenv("CLERK_JWKS_URL")
if not _clerk_jwks:
    raise ValueError("CLERK_JWKS_URL environment variable is required")
CLERK_JWKS_URL: str = _clerk_jwks

# YouTube Data API v3 Configuration
YOUTUBE_API_KEY: Optional[str] = os.getenv("YOUTUBE_API_KEY")

# Twitter/X API Configuration (twitterapi.io)
TWITTER_API_KEY: Optional[str] = os.getenv("TWITTER_API_KEY")

# Platform-specific constants
YOUTUBE_MAX_ITEMS: int = 8
X_MAX_ITEMS: int = 15

# Platform posting norms (for validation and suggestions)
PLATFORM_POSTING_NORMS: dict[str, dict] = {
    "youtube": {
        "min_frequency_days": 3,  # YouTube should be every 3-7 days minimum
        "recommended_frequency_days": 7,
        "description": "YouTube thrives on weekly consistency, not daily uploads"
    },
    "twitter": {
        "min_frequency_days": 1,  # Twitter can be daily
        "recommended_frequency_days": 1,
        "description": "Twitter benefits from daily engagement"
    }
}

# Rate limiting (for future use)
MAX_REQUESTS_PER_MINUTE: int = 60

# CORS settings
ALLOWED_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default port
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",  # Vite default port
    "http://127.0.0.1:8000",
]

# Image Generation (Pollinations.ai Flux)
POLLINATIONS_API_KEY: str = os.getenv("POLLINATIONS_API_KEY")
if not POLLINATIONS_API_KEY:
    raise ValueError("POLLINATIONS_API_KEY environment variable is required")

# Database Configuration (Neon DB - PostgreSQL)
DATABASE_URL: str = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Database Connection Pooling
DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))

# Database Echo (for development)
DB_ECHO: bool = os.getenv("DB_ECHO", "False").lower() == "true"

# Celery / Redis Configuration
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_BROKER_URL: str = REDIS_URL
CELERY_RESULT_BACKEND: str = REDIS_URL

