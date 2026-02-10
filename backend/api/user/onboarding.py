"""Onboarding API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime, timezone
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...models.user.user import CreatorProfile
from ...models.db.user import CreatorProfileDB
from ...api.auth.auth import get_current_user_id
from ...database.session import get_db
from ...agents.core.context_analyzer import ContextAnalyzer
from ...services.platforms.youtube_service import YouTubeService
from ...services.platforms.twitter_service import TwitterService

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
    
    if existing_profile:
        # Update existing profile
        existing_profile.user_name = request.user_name
        existing_profile.creator_type = request.creator_type
        existing_profile.niche = request.niche
        existing_profile.target_audience_niche = request.target_audience_niche
        existing_profile.updated_at = datetime.now(timezone.utc)
        profile_db = existing_profile
    else:
        # Create new profile
        profile_db = CreatorProfileDB(
            user_id=user_id,
            user_name=request.user_name,
            creator_type=request.creator_type,
            niche=request.niche,
            target_audience_niche=request.target_audience_niche
        )
        db.add(profile_db)
    
    await db.commit()
    await db.refresh(profile_db)
    
    # Trigger Context Analyzer (fetches historical content automatically)
    try:
        creator_data = {
            "user_id": profile_db.user_id,
            "user_name": profile_db.user_name,
            "creator_type": profile_db.creator_type,
            "niche": profile_db.niche,
            "target_audience_niche": profile_db.target_audience_niche
        }
        
        # Note: Context Analyzer will attempt to auto-fetch user's content
        # based on niche and available public data
        # This replaces manual best/worst content entry
        
        context_output = context_analyzer.analyze(creator_data)
        
        # Update profile with analyzed data
        agent_context = profile_db.agent_context or {}
        agent_context["_analyzed_context"] = context_output.model_dump()
        agent_context["_context_analyzed_at"] = datetime.now(timezone.utc).isoformat()
        
        profile_db.agent_context = agent_context
        profile_db.recommended_frequency = context_output.strategic_insights.get(
            'realistic_posting_frequency', 
            'Not yet determined'
        )
        
        await db.commit()
        await db.refresh(profile_db)
        
    except Exception as e:
        print(f"Context Analyzer failed: {e}")
        # Continue without analysis - not critical for onboarding
    
    # Convert to Pydantic model for response
    return CreatorProfile(
        user_id=profile_db.user_id,
        user_name=profile_db.user_name,
        creator_type=profile_db.creator_type,
        niche=profile_db.niche,
        target_audience_niche=profile_db.target_audience_niche,
        unique_angle=profile_db.unique_angle,
        self_purpose=profile_db.self_purpose,
        self_strengths=profile_db.self_strengths or [],
        existing_platforms=profile_db.existing_platforms or [],
        target_platforms=profile_db.target_platforms or [],
        self_topics=profile_db.self_topics or [],
        target_audience_demographics=profile_db.target_audience_demographics,
        competitor_accounts=profile_db.competitor_accounts or {},
        existing_assets=profile_db.existing_assets or [],
        self_motivation=profile_db.self_motivation,
        recommended_frequency=profile_db.recommended_frequency,
        agent_context=profile_db.agent_context or {},
        phase2_completed=profile_db.phase2_completed,
        created_at=profile_db.created_at,
        updated_at=profile_db.updated_at
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
    
    # Convert to Pydantic model for response
    return CreatorProfile(
        user_id=profile_db.user_id,
        user_name=profile_db.user_name,
        creator_type=profile_db.creator_type,
        niche=profile_db.niche,
        target_audience_niche=profile_db.target_audience_niche,
        unique_angle=profile_db.unique_angle,
        self_purpose=profile_db.self_purpose,
        self_strengths=profile_db.self_strengths or [],
        existing_platforms=profile_db.existing_platforms or [],
        target_platforms=profile_db.target_platforms or [],
        self_topics=profile_db.self_topics or [],
        target_audience_demographics=profile_db.target_audience_demographics,
        competitor_accounts=profile_db.competitor_accounts or {},
        existing_assets=profile_db.existing_assets or [],
        self_motivation=profile_db.self_motivation,
        recommended_frequency=profile_db.recommended_frequency,
        agent_context=profile_db.agent_context or {},
        phase2_completed=profile_db.phase2_completed,
        created_at=profile_db.created_at,
        updated_at=profile_db.updated_at
    )

