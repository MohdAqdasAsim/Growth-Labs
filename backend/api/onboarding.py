"""Onboarding API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime

from ..models.user import CreatorProfile
from ..api.auth import get_current_user_id
from ..storage.memory_store import memory_store
from ..agents.context_analyzer import ContextAnalyzer
from ..services.youtube_service import YouTubeService
from ..services.twitter_service import TwitterService

router = APIRouter(prefix="/onboarding", tags=["onboarding"])
context_analyzer = ContextAnalyzer()

# ⚠️ IMPORTANT: These services use SYSTEM API keys (config.YOUTUBE_API_KEY, config.TWITTER_API_KEY)
# NOT user's personal API keys. The system fetches public data on the user's behalf.
youtube_service = YouTubeService()  # Uses system's YOUTUBE_API_KEY from config
twitter_service = TwitterService()  # Uses system's TWITTER_API_KEY from config


@router.post("", response_model=CreatorProfile, status_code=status.HTTP_201_CREATED)
async def create_creator_profile(
    profile_data: CreatorProfile,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Phase 1: Onboarding - Create or update creator profile.
    Triggers Context Analyzer on first creation or when significant fields change.
    """
    profile_data.user_id = user_id
    
    # Check if profile exists
    existing_profile = memory_store.get_profile(user_id)
    should_reanalyze = False
    
    if not existing_profile:
        # First time onboarding - always analyze
        should_reanalyze = True
    else:
        # Check if critical fields changed (Phase 1 or Phase 2 updates)
        critical_fields = [
            'category', 'target_audience', 'platforms', 'best_content', 
            'worst_content', 'time_per_week', 'self_strengths', 
            'self_weaknesses', 'tools_skills'
        ]
        for field in critical_fields:
            if getattr(profile_data, field, None) != getattr(existing_profile, field, None):
                should_reanalyze = True
                break
    
    # Store profile
    profile = memory_store.create_or_update_profile(profile_data)
    
    # Run Context Analyzer if needed
    if should_reanalyze:
        try:
            creator_data = profile.model_dump()
            
            # ✨ Task 4.1: Fetch user's own historical content using SYSTEM API keys
            # This provides real performance data for Context Analyzer, not just self-reported
            user_youtube_videos = []
            user_tweets = []
            
            # Fetch user's YouTube videos if channel URL provided
            if profile.youtube_url:
                try:
                    user_youtube_videos = youtube_service.fetch_channel_videos(profile.youtube_url, max_items=10)
                    print(f"✅ YouTube: Fetched {len(user_youtube_videos)} videos from {profile.youtube_url}")
                except Exception as e:
                    print(f"Failed to fetch user's YouTube videos: {e}")
            
            # Fetch user's tweets if handle provided
            if profile.x_handle:
                try:
                    tweet_response = twitter_service.fetch_tweets(profile.x_handle, count=20)
                    user_tweets = tweet_response.get('data', tweet_response.get('tweets', []))
                    print(f"✅ Twitter: Fetched {len(user_tweets)} tweets from {profile.x_handle}")
                except Exception as e:
                    print(f"Failed to fetch user's tweets: {e}")
            
            # Classify user's own content (same 25% method as competitors)
            if user_youtube_videos:
                high_yt, low_yt = YouTubeService.classify_videos_by_traction(user_youtube_videos)
                creator_data['user_best_videos'] = high_yt
                creator_data['user_worst_videos'] = low_yt
                print(f"📊 YouTube: Classified {len(high_yt)} high-performing, {len(low_yt)} low-performing videos")
            else:
                creator_data['user_best_videos'] = []
                creator_data['user_worst_videos'] = []
                print(f"⚠️  YouTube: No videos to classify")
            
            if user_tweets and len(user_tweets) >= 4:
                high_tw, low_tw = TwitterService.classify_tweets_by_engagement(user_tweets)
                # Guard: skip if classified lists too small for meaningful pattern analysis
                if len(high_tw) < 2 or len(low_tw) < 2:
                    creator_data['user_best_tweets'] = []
                    creator_data['user_worst_tweets'] = []
                    print(f"⚠️  Twitter: Only {len(user_tweets)} tweets (high:{len(high_tw)}, low:{len(low_tw)}); insufficient for pattern analysis")
                else:
                    creator_data['user_best_tweets'] = list(high_tw)
                    creator_data['user_worst_tweets'] = list(low_tw)
                    print(f"📊 Twitter: Classified {len(high_tw)} high-performing, {len(low_tw)} low-performing tweets")
            else:
                creator_data['user_best_tweets'] = []
                creator_data['user_worst_tweets'] = []
                print(f"⚠️  Twitter: Only {len(user_tweets)} tweet(s); need at least 4 for classification")
            
            context_output = context_analyzer.analyze(creator_data)
            
            # Store in historical_metrics for future campaign use
            profile.historical_metrics["_analyzed_context"] = context_output.model_dump()
            profile.historical_metrics["_context_analyzed_at"] = datetime.utcnow().isoformat()
            
            # Calculate realistic posting frequency
            profile.posting_frequency = context_output.strategic_insights.get(
                'realistic_posting_frequency', 
                'Not yet determined'
            )
            
            memory_store.create_or_update_profile(profile)
            
        except Exception as e:
            print(f"Context analysis failed: {e}")
            # Don't fail onboarding if analysis fails
    
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


@router.put("", response_model=CreatorProfile)
async def update_creator_profile(
    profile_data: CreatorProfile,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """Update creator profile (full update)."""
    profile_data.user_id = user_id
    profile_data.updated_at = datetime.utcnow()
    return memory_store.create_or_update_profile(profile_data)


@router.patch("/phase2", response_model=CreatorProfile)
async def update_phase2_profile(
    phase2_data: dict,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Phase 2: Optional profile completion from settings/profile page.
    Re-runs Context Analyzer with enhanced data.
    """
    profile = memory_store.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Complete onboarding first.")
    
    # Update Phase 2 fields
    for key, value in phase2_data.items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)
    
    profile.updated_at = datetime.utcnow()
    
    # Re-run Context Analyzer with enhanced data
    try:
        creator_data = profile.model_dump()
        
        # ✨ Fetch user's own historical content (same as initial onboarding)
        user_youtube_videos = []
        user_tweets = []
        
        if profile.youtube_url:
            try:
                user_youtube_videos = youtube_service.fetch_channel_videos(profile.youtube_url, max_items=10)
            except Exception as e:
                print(f"Failed to fetch user's YouTube videos: {e}")
        
        if profile.x_handle:
            try:
                tweet_response = twitter_service.fetch_tweets(profile.x_handle, count=20)
                user_tweets = tweet_response.get('data', tweet_response.get('tweets', []))
            except Exception as e:
                print(f"Failed to fetch user's tweets: {e}")
        
        creator_data['user_youtube_videos'] = user_youtube_videos
        creator_data['user_tweets'] = user_tweets
        
        context_output = context_analyzer.analyze(creator_data)
        
        profile.historical_metrics["_analyzed_context"] = context_output.model_dump()
        profile.historical_metrics["_context_analyzed_at"] = datetime.utcnow().isoformat()
        profile.posting_frequency = context_output.strategic_insights.get(
            'realistic_posting_frequency',
            'Not yet determined'
        )
        
    except Exception as e:
        print(f"Context re-analysis failed: {e}")
    
    memory_store.create_or_update_profile(profile)
    return profile

