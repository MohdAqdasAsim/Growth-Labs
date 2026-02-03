"""Onboarding API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime
from pydantic import BaseModel

from ...models.user.user import CreatorProfile
from ...api.auth.auth import get_current_user_id
from ...storage.memory_store import memory_store
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
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Phase 1: Global Onboarding (Required)
    Collects 4 essential fields and triggers Context Analyzer.
    """
    # Check if profile already exists
    existing_profile = memory_store.get_profile(user_id)
    
    # Create or update profile
    profile = CreatorProfile(
        user_id=user_id,
        user_name=request.user_name,
        creator_type=request.creator_type,
        niche=request.niche,
        target_audience_niche=request.target_audience_niche,
        created_at=existing_profile.created_at if existing_profile else datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    memory_store.create_or_update_profile(profile)
    
    # Trigger Context Analyzer (fetches historical content automatically)
    try:
        creator_data = profile.model_dump()
        
        # Note: Context Analyzer will attempt to auto-fetch user's content
        # based on niche and available public data
        # This replaces manual best/worst content entry
        
        context_output = context_analyzer.analyze(creator_data)
        
        # Update profile with analyzed data
        profile.historical_metrics["_analyzed_context"] = context_output.model_dump()
        profile.historical_metrics["_context_analyzed_at"] = datetime.utcnow().isoformat()
        profile.posting_frequency = context_output.strategic_insights.get(
            'realistic_posting_frequency', 
            'Not yet determined'
        )
        
        memory_store.create_or_update_profile(profile)
        
    except Exception as e:
        print(f"Context Analyzer failed: {e}")
        # Continue without analysis - not critical for onboarding
    
    return profile


@router.get("", response_model=CreatorProfile)
async def get_creator_profile(
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """Get creator profile for current user."""
    profile = memory_store.get_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found. Complete onboarding first."
        )
    return profile

