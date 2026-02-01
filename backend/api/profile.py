"""Profile API routes for Phase 2 completion."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Optional
from datetime import datetime

from ..models.user import CreatorProfile
from ..api.auth import get_current_user_id
from ..storage.memory_store import memory_store
from ..agents.context_analyzer import ContextAnalyzer

router = APIRouter(prefix="/profile", tags=["profile"])
context_analyzer = ContextAnalyzer()


@router.get("", response_model=CreatorProfile)
async def get_profile(user_id: Annotated[str, Depends(get_current_user_id)]):
    """Get full creator profile (Phase 1 + Phase 2)."""
    profile = memory_store.get_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Complete onboarding first."
        )
    
    return profile


@router.get("/completion")
async def get_profile_completion(user_id: Annotated[str, Depends(get_current_user_id)]):
    """Get profile completion status."""
    profile = memory_store.get_profile(user_id)
    
    if not profile:
        return {
            "phase1_complete": False,
            "phase2_complete": False,
            "completion_percentage": 0
        }
    
    # Calculate Phase 2 completion percentage
    phase2_fields = [
        profile.unique_angle,
        profile.content_mission,
        profile.self_strengths,
        profile.self_weaknesses,
        profile.content_enjoys,
        profile.content_avoids,
        profile.audience_demographics,
        profile.tools_skills,
        profile.past_attempts,
        profile.what_worked_before,
        profile.why_create
    ]
    
    filled_fields = sum(1 for field in phase2_fields if field)
    completion_percentage = (filled_fields / len(phase2_fields)) * 100
    
    return {
        "phase1_complete": True,
        "phase2_complete": profile.phase2_completed,
        "completion_percentage": round(completion_percentage, 1),
        "filled_fields": filled_fields,
        "total_fields": len(phase2_fields)
    }


@router.patch("/phase2", response_model=CreatorProfile)
async def update_phase2(
    unique_angle: Optional[str] = None,
    content_mission: Optional[str] = None,
    self_strengths: Optional[list[str]] = None,
    self_weaknesses: Optional[list[str]] = None,
    content_enjoys: Optional[list[str]] = None,
    content_avoids: Optional[list[str]] = None,
    audience_demographics: Optional[str] = None,
    tools_skills: Optional[list[str]] = None,
    past_attempts: Optional[list[dict]] = None,
    what_worked_before: Optional[list[str]] = None,
    why_create: Optional[str] = None,
    user_id: Annotated[str, Depends(get_current_user_id)] = None
):
    """Update Phase 2 fields (optional profile completion)."""
    profile = memory_store.get_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complete Phase 1 onboarding first."
        )
    
    # Update only provided fields
    if unique_angle is not None:
        profile.unique_angle = unique_angle
    if content_mission is not None:
        profile.content_mission = content_mission
    if self_strengths is not None:
        profile.self_strengths = self_strengths
    if self_weaknesses is not None:
        profile.self_weaknesses = self_weaknesses
    if content_enjoys is not None:
        profile.content_enjoys = content_enjoys
    if content_avoids is not None:
        profile.content_avoids = content_avoids
    if audience_demographics is not None:
        profile.audience_demographics = audience_demographics
    if tools_skills is not None:
        profile.tools_skills = tools_skills
    if past_attempts is not None:
        profile.past_attempts = past_attempts
    if what_worked_before is not None:
        profile.what_worked_before = what_worked_before
    if why_create is not None:
        profile.why_create = why_create
    
    # Check if all Phase 2 fields are filled
    phase2_fields = [
        profile.unique_angle,
        profile.content_mission,
        profile.self_strengths,
        profile.self_weaknesses,
        profile.content_enjoys,
        profile.content_avoids,
        profile.audience_demographics,
        profile.tools_skills,
        profile.past_attempts,
        profile.what_worked_before,
        profile.why_create
    ]
    
    if all(field for field in phase2_fields):
        profile.phase2_completed = True
    
    profile.updated_at = datetime.utcnow()
    memory_store.create_or_update_profile(profile)
    
    # Re-run Context Analyzer with enhanced data
    try:
        creator_data = profile.model_dump()
        context_output = context_analyzer.analyze(creator_data)
        
        profile.historical_metrics["_analyzed_context"] = context_output.model_dump()
        profile.historical_metrics["_context_analyzed_at"] = datetime.utcnow().isoformat()
        profile.posting_frequency = context_output.strategic_insights.get(
            'realistic_posting_frequency',
            'Not yet determined'
        )
        
        memory_store.create_or_update_profile(profile)
        
    except Exception as e:
        print(f"Context Analyzer failed: {e}")
    
    return profile
