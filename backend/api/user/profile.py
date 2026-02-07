"""Profile API routes for Phase 2 completion."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Optional
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...models.user.user import CreatorProfile
from ...models.db.user import CreatorProfileDB
from ...api.auth.auth import get_current_user_id
from ...database.session import get_db
from ...agents.core.context_analyzer import ContextAnalyzer

router = APIRouter(prefix="/profile", tags=["profile"])
context_analyzer = ContextAnalyzer()


class Phase2Update(BaseModel):
    """Phase 2 profile update request - matches database schema."""
    unique_angle: Optional[str] = None
    self_purpose: Optional[str] = None
    self_strengths: Optional[list[str]] = None
    existing_platforms: Optional[list[str]] = None
    target_platforms: Optional[list[str]] = None
    self_topics: Optional[list[str]] = None
    target_audience_demographics: Optional[str] = None
    competitor_accounts: Optional[dict] = None
    existing_assets: Optional[list[str]] = None
    self_motivation: Optional[str] = None


def _profile_db_to_pydantic(profile_db: CreatorProfileDB) -> CreatorProfile:
    """Convert CreatorProfileDB to Pydantic CreatorProfile."""
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
async def get_profile(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Get full creator profile (Phase 1 + Phase 2)."""
    result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == user_id))
    profile_db = result.scalar_one_or_none()
    
    if not profile_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Complete onboarding first."
        )
    
    return _profile_db_to_pydantic(profile_db)


@router.get("/completion")
async def get_profile_completion(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Get profile completion status."""
    result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == user_id))
    profile_db = result.scalar_one_or_none()
    
    if not profile_db:
        return {
            "phase1_complete": False,
            "phase2_complete": False,
            "completion_percentage": 0
        }
    
    # Calculate Phase 2 completion percentage (10 fields)
    phase2_fields = [
        profile_db.unique_angle,
        profile_db.self_purpose,
        profile_db.self_strengths,
        profile_db.existing_platforms,
        profile_db.target_platforms,
        profile_db.self_topics,
        profile_db.target_audience_demographics,
        profile_db.competitor_accounts,
        profile_db.existing_assets,
        profile_db.self_motivation
    ]
    
    filled_fields = sum(1 for field in phase2_fields if field)
    completion_percentage = (filled_fields / len(phase2_fields)) * 100
    
    return {
        "phase1_complete": True,
        "phase2_complete": profile_db.phase2_completed,
        "completion_percentage": round(completion_percentage, 1),
        "filled_fields": filled_fields,
        "total_fields": len(phase2_fields)
    }


@router.patch("/phase2", response_model=CreatorProfile)
async def update_phase2(
    request: Phase2Update,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Update Phase 2 fields (optional profile completion)."""
    result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == user_id))
    profile_db = result.scalar_one_or_none()
    
    if not profile_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complete Phase 1 onboarding first."
        )
    
    # Update only provided fields
    if request.unique_angle is not None:
        profile_db.unique_angle = request.unique_angle
    if request.self_purpose is not None:
        profile_db.self_purpose = request.self_purpose
    if request.self_strengths is not None:
        profile_db.self_strengths = request.self_strengths
    if request.existing_platforms is not None:
        profile_db.existing_platforms = request.existing_platforms
    if request.target_platforms is not None:
        profile_db.target_platforms = request.target_platforms
    if request.self_topics is not None:
        profile_db.self_topics = request.self_topics
    if request.target_audience_demographics is not None:
        profile_db.target_audience_demographics = request.target_audience_demographics
    if request.competitor_accounts is not None:
        profile_db.competitor_accounts = request.competitor_accounts
    if request.existing_assets is not None:
        profile_db.existing_assets = request.existing_assets
    if request.self_motivation is not None:
        profile_db.self_motivation = request.self_motivation
    
    # Check if all Phase 2 fields are filled
    phase2_fields = [
        profile_db.unique_angle,
        profile_db.self_purpose,
        profile_db.self_strengths,
        profile_db.existing_platforms,
        profile_db.target_platforms,
        profile_db.self_topics,
        profile_db.target_audience_demographics,
        profile_db.competitor_accounts,
        profile_db.existing_assets,
        profile_db.self_motivation
    ]
    
    if all(field for field in phase2_fields):
        profile_db.phase2_completed = True
    
    profile_db.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(profile_db)
    
    # Re-run Context Analyzer with enhanced data
    try:
        creator_data = {
            "user_id": profile_db.user_id,
            "user_name": profile_db.user_name,
            "creator_type": profile_db.creator_type,
            "niche": profile_db.niche,
            "target_audience_niche": profile_db.target_audience_niche,
            "unique_angle": profile_db.unique_angle,
            "self_purpose": profile_db.self_purpose,
            "self_strengths": profile_db.self_strengths,
            "existing_platforms": profile_db.existing_platforms,
            "target_platforms": profile_db.target_platforms,
            "self_topics": profile_db.self_topics,
            "target_audience_demographics": profile_db.target_audience_demographics,
            "competitor_accounts": profile_db.competitor_accounts,
            "existing_assets": profile_db.existing_assets,
            "self_motivation": profile_db.self_motivation
        }
        
        context_output = context_analyzer.analyze(creator_data)
        
        agent_context = profile_db.agent_context or {}
        agent_context["_analyzed_context"] = context_output.model_dump()
        agent_context["_context_analyzed_at"] = datetime.utcnow().isoformat()
        
        profile_db.agent_context = agent_context
        profile_db.recommended_frequency = context_output.strategic_insights.get(
            'realistic_posting_frequency',
            'Not yet determined'
        )
        
        await db.commit()
        await db.refresh(profile_db)
        
    except Exception as e:
        print(f"Context Analyzer failed: {e}")
    
    return _profile_db_to_pydantic(profile_db)
