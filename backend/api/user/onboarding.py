"""Onboarding API routes."""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...models.user.user import CreatorProfile
from ...models.db.user import CreatorProfileDB
from ...models.common.enums import PlatformEnum, PLATFORM_URL_PATTERNS
from ...api.auth.auth import get_current_user_id
from ...database.session import get_db
from ...agents.core.context_analyzer import ContextAnalyzer
from ...services.platforms.youtube_service import YouTubeService
from ...services.platforms.twitter_service import TwitterService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/onboarding", tags=["onboarding"])
context_analyzer = ContextAnalyzer()

# ⚠️ IMPORTANT: These services use SYSTEM API keys (config.YOUTUBE_API_KEY, config.TWITTER_API_KEY)
# NOT user's personal API keys. The system fetches public data on the user's behalf.
youtube_service = YouTubeService()  # Uses system's YOUTUBE_API_KEY from config
twitter_service = TwitterService()  # Uses system's TWITTER_API_KEY from config


class OnboardingRequest(BaseModel):
    """Phase 1 onboarding data."""
    user_name: str
    creator_type: str
    niche: str
    target_audience_niche: str
    existing_platforms: list[PlatformEnum] = Field(..., min_length=1, description="At least one platform required")
    platform_urls: dict[str, str] = Field(default_factory=dict, description="Platform URLs: {YouTube: url, Twitter: url, ...}")
    
    @field_validator('platform_urls')
    @classmethod
    def validate_platform_urls(cls, v: dict[str, str]) -> dict[str, str]:
        """Validate that each platform URL matches the expected pattern."""
        for platform_str, url in v.items():
            # Convert string to PlatformEnum
            try:
                platform = PlatformEnum(platform_str)
            except ValueError:
                raise ValueError(f"Invalid platform: {platform_str}. Must be one of: {', '.join([p.value for p in PlatformEnum])}")
            
            # Validate URL format
            if not url.startswith(('http://', 'https://')):
                raise ValueError(f"{platform.value} URL must start with http:// or https://")
            
            # Validate platform-specific URL pattern
            pattern = PLATFORM_URL_PATTERNS[platform]
            if not pattern.match(url):
                raise ValueError(f"Invalid {platform.value} URL format. Please check the URL.")
        
        return v
    
    @model_validator(mode='after')
    def validate_platform_urls_match_platforms(self):
        """Ensure platform_urls keys match existing_platforms."""
        if self.platform_urls:
            url_platforms = {PlatformEnum(p) for p in self.platform_urls.keys()}
            existing_set = set(self.existing_platforms)
            
            # Check for missing URLs
            missing = existing_set - url_platforms
            if missing:
                missing_names = ', '.join([p.value for p in missing])
                raise ValueError(f"Missing URLs for platforms: {missing_names}")
            
            # Check for extra URLs
            extra = url_platforms - existing_set
            if extra:
                extra_names = ', '.join([p.value for p in extra])
                raise ValueError(f"URLs provided for platforms not in existing_platforms: {extra_names}")
        
        return self


@router.post("", response_model=CreatorProfile, status_code=status.HTTP_201_CREATED)
async def create_creator_profile(
    request: OnboardingRequest,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Phase 1: Global Onboarding (Required)
    Collects 4 essential fields and triggers Context Analyzer.
    """
    # Check if profile already exists
    result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == user_id))
    existing_profile = result.scalar_one_or_none()
    
    # Convert PlatformEnum to string values for database storage
    platforms_str = [p.value for p in request.existing_platforms]
    platform_urls_str = {p: url for p, url in request.platform_urls.items()}
    
    if existing_profile:
        # Update existing profile using setattr to avoid Column type issues
        setattr(existing_profile, 'user_name', request.user_name)
        setattr(existing_profile, 'creator_type', request.creator_type)
        setattr(existing_profile, 'niche', request.niche)
        setattr(existing_profile, 'target_audience_niche', request.target_audience_niche)
        setattr(existing_profile, 'existing_platforms', platforms_str)
        setattr(existing_profile, 'platform_urls', platform_urls_str)
        setattr(existing_profile, 'updated_at', datetime.now(timezone.utc))
        profile_db = existing_profile
    else:
        # Create new profile
        profile_db = CreatorProfileDB(
            user_id=user_id,
            user_name=request.user_name,
            creator_type=request.creator_type,
            niche=request.niche,
            target_audience_niche=request.target_audience_niche,
            existing_platforms=platforms_str,
            platform_urls=platform_urls_str
        )
        db.add(profile_db)
    
    await db.commit()
    await db.refresh(profile_db)
    
    logger.info(f"Creator profile {'updated' if existing_profile else 'created'} for user_id={user_id}")
    
    # Trigger Context Analyzer (fetches historical content automatically)
    try:
        # Use getattr to avoid Column type issues
        platform_urls_val = getattr(profile_db, 'platform_urls') or {}
        creator_data = {
            "user_id": getattr(profile_db, 'user_id'),
            "user_name": getattr(profile_db, 'user_name'),
            "creator_type": getattr(profile_db, 'creator_type'),
            "category": getattr(profile_db, 'niche'),  # Map niche → category for Context Analyzer
            "target_audience": getattr(profile_db, 'target_audience_niche'),  # Map correctly
            "platforms": getattr(profile_db, 'existing_platforms') or [],
            "youtube_url": platform_urls_val.get("YouTube") if platform_urls_val else None,
            "twitter_url": platform_urls_val.get("Twitter") if platform_urls_val else None,
            "instagram_url": platform_urls_val.get("Instagram") if platform_urls_val else None,
            "linkedin_url": platform_urls_val.get("LinkedIn") if platform_urls_val else None,
            "tiktok_url": platform_urls_val.get("TikTok") if platform_urls_val else None,
            "facebook_url": platform_urls_val.get("Facebook") if platform_urls_val else None,
            "reddit_url": platform_urls_val.get("Reddit") if platform_urls_val else None,
        }
        
        # Note: Context Analyzer will attempt to auto-fetch user's content
        # based on niche and available public data
        # This replaces manual best/worst content entry
        
        context_output = context_analyzer.analyze(creator_data)
        
        # Update profile with analyzed data using getattr/setattr
        agent_context = getattr(profile_db, 'agent_context') or {}
        agent_context["_analyzed_context"] = context_output.model_dump()
        agent_context["_context_analyzed_at"] = datetime.now(timezone.utc).isoformat()
        
        setattr(profile_db, 'agent_context', agent_context)
        # Extract and truncate recommended_frequency to fit VARCHAR(50)
        raw_frequency = context_output.strategic_insights.get(
            'realistic_posting_frequency', 
            'Not yet determined'
        )
        truncated_frequency = raw_frequency[:50] if raw_frequency else 'Not yet determined'
        setattr(profile_db, 'recommended_frequency', truncated_frequency)
        
        await db.commit()
        await db.refresh(profile_db)
        
        logger.info(f"Context Analyzer completed successfully for user_id={user_id}")
        
    except Exception as e:
        logger.error(f"Context Analyzer failed for user_id={user_id}: {e}", exc_info=True)
        # Continue without analysis - not critical for onboarding
    
    # Convert to Pydantic model for response using getattr
    return CreatorProfile(
        user_id=getattr(profile_db, 'user_id'),
        user_name=getattr(profile_db, 'user_name'),
        creator_type=getattr(profile_db, 'creator_type'),
        niche=getattr(profile_db, 'niche'),
        target_audience_niche=getattr(profile_db, 'target_audience_niche'),
        existing_platforms=getattr(profile_db, 'existing_platforms') or [],
        platform_urls=getattr(profile_db, 'platform_urls') or {},
        unique_angle=getattr(profile_db, 'unique_angle'),
        self_purpose=getattr(profile_db, 'self_purpose'),
        self_strengths=getattr(profile_db, 'self_strengths') or [],
        target_platforms=getattr(profile_db, 'target_platforms') or [],
        self_topics=getattr(profile_db, 'self_topics') or [],
        target_audience_demographics=getattr(profile_db, 'target_audience_demographics'),
        competitor_accounts=getattr(profile_db, 'competitor_accounts') or {},
        existing_assets=getattr(profile_db, 'existing_assets') or [],
        self_motivation=getattr(profile_db, 'self_motivation'),
        recommended_frequency=getattr(profile_db, 'recommended_frequency'),
        agent_context=getattr(profile_db, 'agent_context') or {},
        phase2_completed=getattr(profile_db, 'phase2_completed'),
        created_at=getattr(profile_db, 'created_at'),
        updated_at=getattr(profile_db, 'updated_at')
    )


@router.get("", response_model=CreatorProfile)
async def get_creator_profile(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Get creator profile for current user."""
    result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == user_id))
    profile_db = result.scalar_one_or_none()
    
    if not profile_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found. Complete onboarding first."
        )
    
    # Convert to Pydantic model for response using getattr
    return CreatorProfile(
        user_id=getattr(profile_db, 'user_id'),
        user_name=getattr(profile_db, 'user_name'),
        creator_type=getattr(profile_db, 'creator_type'),
        niche=getattr(profile_db, 'niche'),
        target_audience_niche=getattr(profile_db, 'target_audience_niche'),
        existing_platforms=getattr(profile_db, 'existing_platforms') or [],
        platform_urls=getattr(profile_db, 'platform_urls') or {},
        unique_angle=getattr(profile_db, 'unique_angle'),
        self_purpose=getattr(profile_db, 'self_purpose'),
        self_strengths=getattr(profile_db, 'self_strengths') or [],
        target_platforms=getattr(profile_db, 'target_platforms') or [],
        self_topics=getattr(profile_db, 'self_topics') or [],
        target_audience_demographics=getattr(profile_db, 'target_audience_demographics'),
        competitor_accounts=getattr(profile_db, 'competitor_accounts') or {},
        existing_assets=getattr(profile_db, 'existing_assets') or [],
        self_motivation=getattr(profile_db, 'self_motivation'),
        recommended_frequency=getattr(profile_db, 'recommended_frequency'),
        agent_context=getattr(profile_db, 'agent_context') or {},
        phase2_completed=getattr(profile_db, 'phase2_completed'),
        created_at=getattr(profile_db, 'created_at'),
        updated_at=getattr(profile_db, 'updated_at')
    )

