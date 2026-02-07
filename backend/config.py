"""Configuration settings for the application."""
import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL: str = "gemini-3-flash-preview"  # Using Gemini 2.0 Flash Experimental (closest to 3 Flash)

# JWT Authentication (legacy - will be removed after full Clerk migration)
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_HOURS: int = 24

# Clerk Authentication
CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY", "")  # From Clerk Dashboard → API Keys
CLERK_PUBLISHABLE_KEY: str = os.getenv("CLERK_PUBLISHABLE_KEY", "")  # For frontend (FYI only)
CLERK_WEBHOOK_SECRET: str = os.getenv("CLERK_WEBHOOK_SECRET", "")  # From Clerk Dashboard → Webhooks
CLERK_JWKS_URL: str = "https://clerk.YOUR_DOMAIN.com/.well-known/jwks.json"  # Will update with actual domain

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
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# Image Generation (Pollinations.ai Flux)
POLLINATIONS_API_KEY: Optional[str] = os.getenv("POLLINATIONS_API_KEY", "")

# Database Configuration (Neon DB - PostgreSQL)
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost:5432/super_engine_lab"
)

# Database Connection Pooling
DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))

# Database Echo (for development)
DB_ECHO: bool = os.getenv("DB_ECHO", "False").lower() == "true"

