"""Campaign API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Dict, Any, Optional
import uuid
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ...models.campaign.campaign import Campaign, CampaignCreate, CampaignResponse, CampaignStatus, DailyExecution, DailyContent
from ...models.db.campaign import CampaignDB, DailyContentDB, DailyExecutionDB, LearningMemoryDB
from ...models.db.user import CreatorProfileDB
from ...api.auth.auth import get_current_user_id
from ...database.session import get_db
from ...services.core.agent_orchestrator import AgentOrchestrator
from ...tasks.campaign_tasks import (
    run_campaign_workflow_task,
    analyze_campaign_outcome_task,
    analyze_previous_campaigns_task
)

router = APIRouter(prefix="/campaigns", tags=["campaigns"])
orchestrator = AgentOrchestrator()


async def _load_daily_content(db: AsyncSession, campaign_id: str) -> dict[int, DailyContent]:
    """Load daily content from database into dict."""
    result = await db.execute(
        select(DailyContentDB).where(DailyContentDB.campaign_id == campaign_id)
    )
    content_records = result.scalars().all()
    
    daily_content = {}
    for record in content_records:
        daily_content[record.day_number] = DailyContent(
            day=record.day_number,
            youtube_script=record.video_script,
            youtube_title=record.video_title,
            youtube_seo_tags=record.seo_tags or [],
            youtube_cta=record.call_to_action,
            x_tweet=record.tweet_text,
            x_thread=record.thread_tweets,
            thumbnail_url=record.thumbnail_urls.get('youtube') if record.thumbnail_urls else None
        )
    return daily_content


async def _load_daily_execution(db: AsyncSession, campaign_id: str) -> dict[int, DailyExecution]:
    """Load daily execution from database into dict."""
    result = await db.execute(
        select(DailyExecutionDB).where(DailyExecutionDB.campaign_id == campaign_id)
    )
    execution_records = result.scalars().all()
    
    daily_execution = {}
    for record in execution_records:
        daily_execution[record.day_number] = DailyExecution(
            day_number=record.day_number,
            youtube_posted=record.posted_to_youtube,
            twitter_posted=record.posted_to_twitter,
            posted_at=record.executed_at
        )
    return daily_execution


async def _campaign_db_to_pydantic(db: AsyncSession, campaign_db: CampaignDB) -> Campaign:
    """Convert CampaignDB to Pydantic Campaign with daily data loaded."""
    daily_content = await _load_daily_content(db, campaign_db.campaign_id)
    daily_execution = await _load_daily_execution(db, campaign_db.campaign_id)
    
    # Parse onboarding_data from dict to Pydantic if present
    from ..models.campaign.campaign import CampaignOnboarding
    onboarding_data = None
    if campaign_db.onboarding_data:
        try:
            onboarding_data = CampaignOnboarding(**campaign_db.onboarding_data)
        except Exception:
            # If parsing fails, keep as dict (will be stored as Any/dict in Campaign)
            onboarding_data = campaign_db.onboarding_data
    
    return Campaign(
        campaign_id=campaign_db.campaign_id,
        user_id=campaign_db.user_id,
        onboarding_data=onboarding_data,
        status=CampaignStatus(campaign_db.status),
        profile_snapshot=campaign_db.profile_snapshot or {},
        archived_at=campaign_db.archived_at,
        archived_reason=campaign_db.archived_reason,
        learning_insights=campaign_db.learning_insights,
        learning_approved=campaign_db.learning_approved,
        strategy_output=campaign_db.strategy_output or {},
        forensics_output=campaign_db.forensics_output or {},
        campaign_plan=campaign_db.campaign_plan,
        plan_approved=False,  # Not in DB yet
        content_warnings=campaign_db.content_warnings,
        daily_content=daily_content,
        daily_execution=daily_execution,
        outcome_report=campaign_db.outcome_report,
        created_at=campaign_db.created_at,
        onboarding_completed_at=campaign_db.onboarding_completed_at,
        started_at=campaign_db.started_at,
        completed_at=campaign_db.completed_at,
        updated_at=campaign_db.updated_at
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_campaign(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Create empty campaign shell.
    Status: ONBOARDING_INCOMPLETE
    Frontend will populate data via PATCH /campaigns/{id}/onboarding
    """
    # Get creator profile
    result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == user_id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creator profile not found. Complete onboarding first."
        )
    
    # Get global memory snapshot at creation time
    profile_snapshot = {
        "user_name": profile.user_name,
        "creator_type": profile.creator_type,
        "niche": profile.niche,
        "target_audience_niche": profile.target_audience_niche,
        "self_purpose": profile.self_purpose,
        "unique_angle": profile.unique_angle
    }
    
    # Create empty campaign
    campaign_id = str(uuid.uuid4())
    campaign_db = CampaignDB(
        campaign_id=campaign_id,
        user_id=user_id,
        status="onboarding_incomplete",
        profile_snapshot=profile_snapshot,
        strategy_output={},
        forensics_output={}
    )
    
    db.add(campaign_db)
    await db.commit()
    
    return {
        "message": "Campaign created. Complete onboarding next.",
        "campaign_id": campaign_id,
        "status": "onboarding_incomplete"
    }


@router.patch("/{campaign_id}/onboarding")
async def update_campaign_onboarding(
    campaign_id: str,
    onboarding_data: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Update campaign onboarding data (Steps 1-4).
    Can be called multiple times as user progresses through wizard.
    """
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign_db.status not in ["onboarding_incomplete", "ready_to_start"]:
        raise HTTPException(status_code=400, detail="Campaign already started")
    
    # Initialize onboarding if not exists
    if not campaign_db.onboarding_data:
        from ...models.campaign.campaign import CampaignOnboarding, CampaignGoal, CampaignCompetitors, AgentConfig
        campaign_db.onboarding_data = {
            "name": "",
            "description": "",
            "goal": {
                "goal_aim": "",
                "goal_type": "",
                "platforms": [],
                "metrics": [],
                "duration_days": 3,
                "intensity": "moderate"
            },
            "competitors": {"platforms": []},
            "agent_config": {"run_forensics": True},
            "image_generation_enabled": True,
            "seo_optimization_enabled": True
        }
    
    # Update fields from request data
    onboarding = campaign_db.onboarding_data
    if "name" in onboarding_data:
        onboarding["name"] = onboarding_data["name"]
    if "description" in onboarding_data:
        onboarding["description"] = onboarding_data["description"]
    if "goal_aim" in onboarding_data:
        onboarding["goal"]["goal_aim"] = onboarding_data["goal_aim"]
    if "goal_type" in onboarding_data:
        onboarding["goal"]["goal_type"] = onboarding_data["goal_type"]
    if "platforms" in onboarding_data:
        onboarding["goal"]["platforms"] = onboarding_data["platforms"]
    if "metrics" in onboarding_data:
        onboarding["goal"]["metrics"] = onboarding_data["metrics"]
    if "duration_days" in onboarding_data:
        onboarding["goal"]["duration_days"] = onboarding_data["duration_days"]
    if "intensity" in onboarding_data:
        onboarding["goal"]["intensity"] = onboarding_data["intensity"]
    if "competitors" in onboarding_data:
        onboarding["competitors"] = onboarding_data["competitors"]
    if "agent_config" in onboarding_data:
        onboarding["agent_config"] = onboarding_data["agent_config"]
    if "image_generation_enabled" in onboarding_data:
        onboarding["image_generation_enabled"] = onboarding_data["image_generation_enabled"]
    if "seo_optimization_enabled" in onboarding_data:
        onboarding["seo_optimization_enabled"] = onboarding_data["seo_optimization_enabled"]
    
    campaign_db.onboarding_data = onboarding
    campaign_db.updated_at = datetime.utcnow()
    await db.commit()
    
    return {
        "message": "Campaign onboarding updated",
        "campaign_id": campaign_id,
        "status": "onboarding_updated"
    }


@router.post("/{campaign_id}/complete-onboarding")
async def complete_campaign_onboarding(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Mark onboarding complete and analyze previous campaigns for lessons.
    Status: ONBOARDING_INCOMPLETE → READY_TO_START
    """
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate required fields
    if not campaign_db.onboarding_data:
        raise HTTPException(status_code=400, detail="Complete campaign onboarding first")
    
    if not campaign_db.onboarding_data.get("name") or not campaign_db.onboarding_data.get("goal", {}).get("goal_aim"):
        raise HTTPException(status_code=400, detail="Name and goal are required")
    
    # Check for previous completed campaigns
    result = await db.execute(
        select(func.count(CampaignDB.campaign_id))
        .where(CampaignDB.user_id == user_id)
        .where(CampaignDB.status == "completed")
    )
    total_campaigns = result.scalar() or 0
    
    # Update status immediately
    campaign_db.status = "ready_to_start"
    campaign_db.onboarding_completed_at = datetime.utcnow()
    campaign_db.updated_at = datetime.utcnow()
    await db.commit()
    
    # If previous campaigns exist, analyze asynchronously
    if total_campaigns > 0:
        task = analyze_previous_campaigns_task.delay(user_id, campaign_id)
        campaign_db.task_id = task.id
        await db.commit()
        
        return {
            "message": "Campaign ready. Analyzing past campaigns...",
            "campaign_id": campaign_id,
            "status": "ready_to_start",
            "task_id": task.id,
            "status_url": f"/tasks/{task.id}"
        }
    else:
        return {
            "message": "Campaign onboarding complete. Ready to start!",
            "campaign_id": campaign_id,
            "status": "ready_to_start",
            "task_id": None
        }


@router.get("/{campaign_id}/lessons-learned")
async def get_lessons_learned(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Get insights from previous campaigns."""
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not campaign_db.learning_insights:
        return {
            "has_previous_campaigns": False,
            "lessons": None
        }
    
    return {
        "has_previous_campaigns": True,
        "lessons": campaign_db.learning_insights,
        "approved": campaign_db.learning_approved
    }


@router.patch("/{campaign_id}/approve-lessons")
async def approve_lessons(
    campaign_id: str,
    lessons: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """User approves or modifies lessons from previous campaigns."""
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    campaign_db.learning_insights = lessons
    campaign_db.learning_approved = True
    campaign_db.updated_at = datetime.utcnow()
    await db.commit()
    
    return {
        "message": "Lessons approved",
        "lessons": campaign_db.learning_insights
    }


@router.post("/{campaign_id}/start")
async def start_campaign(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Start campaign - executes agent workflow asynchronously.
    Status: READY_TO_START → PROCESSING → IN_PROGRESS
    
    Returns task_id for polling progress via GET /tasks/{task_id}
    """
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign_db.status not in ["ready_to_start", "processing_failed"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Campaign not ready to start. Current status: {campaign_db.status}"
        )
    
    # Update status to processing
    campaign_db.status = "processing"
    campaign_db.started_at = datetime.utcnow()
    campaign_db.task_id = None  # Clear old task_id if retrying
    campaign_db.updated_at = datetime.utcnow()
    await db.commit()
    
    # Enqueue Celery task
    task = run_campaign_workflow_task.delay(campaign_id)
    
    # Save task_id
    campaign_db.task_id = task.id
    await db.commit()
    
    return {
        "message": "Campaign workflow started",
        "campaign_id": campaign_id,
        "task_id": task.id,
        "status_url": f"/tasks/{task.id}",
        "poll_interval_seconds": 2
    }


@router.patch("/{campaign_id}")
async def edit_campaign(
    campaign_id: str,
    onboarding_data: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Edit campaign (only if not started).
    Alias for /onboarding endpoint with validation.
    """
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign_db.status not in ["onboarding_incomplete", "ready_to_start"]:
        raise HTTPException(status_code=400, detail="Cannot edit campaign after it has started")
    
    # Call onboarding update logic
    return await update_campaign_onboarding(campaign_id, onboarding_data, user_id, db)


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Delete campaign (only if not started)."""
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign_db.status not in ["onboarding_incomplete", "ready_to_start"]:
        raise HTTPException(status_code=400, detail="Cannot delete campaign after it has started")
    
    # Delete from database (cascades to daily_content and daily_execution)
    await db.delete(campaign_db)
    await db.commit()
    
    return {"message": "Campaign deleted successfully"}


@router.get("/{campaign_id}")
async def get_campaign(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Get campaign by ID - returns full campaign data."""
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign_db.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Convert to Pydantic and return as dict
    campaign = await _campaign_db_to_pydantic(db, campaign_db)
    return campaign.model_dump()


@router.post("/{campaign_id}/complete")
async def complete_campaign(
    campaign_id: str,
    actual_metrics: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Mark campaign as complete and generate outcome report asynchronously.
    Status: IN_PROGRESS → GENERATING_REPORT → COMPLETED
    
    Returns task_id for polling progress via GET /tasks/{task_id}
    """
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign_db.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if campaign_db.status not in ["in_progress", "processing_failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campaign must be in progress. Current status: {campaign_db.status}"
        )
    
    # Update status to generating_report
    campaign_db.status = "generating_report"
    campaign_db.task_id = None  # Clear old task_id
    campaign_db.updated_at = datetime.utcnow()
    await db.commit()
    
    # Enqueue Celery task
    task = analyze_campaign_outcome_task.delay(campaign_id, actual_metrics)
    
    # Save task_id
    campaign_db.task_id = task.id
    await db.commit()
    
    return {
        "message": "Generating outcome report",
        "campaign_id": campaign_id,
        "task_id": task.id,
        "status_url": f"/tasks/{task.id}",
        "poll_interval_seconds": 2
    }


@router.patch("/{campaign_id}/day/{day_number}/confirm")
async def confirm_daily_execution(
    campaign_id: str,
    day_number: int,
    execution_data: Dict[str, bool],  # {"youtube_posted": true, "twitter_posted": false}
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm content posting for a specific day.
    Tracks execution adherence for outcome analysis.
    
    Args:
        campaign_id: Campaign UUID
        day_number: Day number (1 to duration_days)
        execution_data: {"youtube_posted": bool, "twitter_posted": bool}
    """
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if campaign_db.status not in ["in_progress", "approved"]:
        raise HTTPException(status_code=400, detail=f"Campaign not active. Status: {campaign_db.status}")
    
    # Validate day_number
    duration_days = campaign_db.onboarding_data.get("goal", {}).get("duration_days", 3) if campaign_db.onboarding_data else 3
    if day_number < 1 or day_number > duration_days:
        raise HTTPException(status_code=400, detail=f"day_number must be between 1 and {duration_days}")
    
    # Check if content exists for this day
    result = await db.execute(
        select(DailyContentDB)
        .where(DailyContentDB.campaign_id == campaign_id)
        .where(DailyContentDB.day_number == day_number)
    )
    content_exists = result.scalar_one_or_none() is not None
    
    if not content_exists:
        raise HTTPException(status_code=400, detail=f"No content generated for day {day_number}")
    
    # Create or update execution tracking
    result = await db.execute(
        select(DailyExecutionDB)
        .where(DailyExecutionDB.campaign_id == campaign_id)
        .where(DailyExecutionDB.day_number == day_number)
    )
    execution_db = result.scalar_one_or_none()
    
    if execution_db:
        # Update existing
        execution_db.posted_to_youtube = execution_data.get("youtube_posted", False)
        execution_db.posted_to_twitter = execution_data.get("twitter_posted", False)
        execution_db.executed_at = datetime.utcnow()
    else:
        # Create new
        execution_db = DailyExecutionDB(
            execution_id=str(uuid.uuid4()),
            campaign_id=campaign_id,
            day_number=day_number,
            platform="youtube",  # Default platform
            posted_to_youtube=execution_data.get("youtube_posted", False),
            posted_to_twitter=execution_data.get("twitter_posted", False),
            executed_at=datetime.utcnow()
        )
        db.add(execution_db)
    
    await db.commit()
    await db.refresh(execution_db)
    
    return {
        "message": f"Day {day_number} execution confirmed",
        "execution": {
            "day_number": execution_db.day_number,
            "youtube_posted": execution_db.posted_to_youtube,
            "twitter_posted": execution_db.posted_to_twitter,
            "posted_at": execution_db.executed_at
        }
    }


@router.get("/{campaign_id}/schedule")
async def get_campaign_schedule(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get campaign schedule with execution tracking.
    Shows all days with content, plan, and posting status.
    """
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign_db.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not campaign_db.campaign_plan:
        raise HTTPException(status_code=400, detail="Campaign plan not created yet")
    
    duration_days = campaign_db.onboarding_data.get("goal", {}).get("duration_days", 3) if campaign_db.onboarding_data else 3
    campaign_plan = campaign_db.campaign_plan
    
    # Load daily content and execution
    daily_content = await _load_daily_content(db, campaign_id)
    daily_execution = await _load_daily_execution(db, campaign_id)
    
    schedule = []
    for day in range(1, duration_days + 1):
        # Get plan for this day
        if day <= 3:
            day_plan = campaign_plan.get(f"day_{day}")
        else:
            day_plan = campaign_plan.get("extra_days", {}).get(day)
        
        # Get content and execution
        content = daily_content.get(day)
        execution = daily_execution.get(day)
        
        schedule.append({
            "day": day,
            "plan": day_plan,
            "content_generated": content is not None,
            "execution": execution.model_dump() if execution else None,
            "posted": (execution.youtube_posted or execution.twitter_posted) if execution else False
        })
    
    return {
        "campaign_id": campaign_id,
        "duration_days": duration_days,
        "start_date": campaign_db.started_at,
        "end_date": None,  # Calculate if needed
        "status": campaign_db.status,
        "schedule": schedule
    }


@router.get("/{campaign_id}/report")
async def get_campaign_report(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """Get campaign report (only available after completion)."""
    result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
    campaign_db = result.scalar_one_or_none()
    
    if not campaign_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign_db.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if not campaign_db.outcome_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign report not available. Complete the campaign first."
        )
    
    return campaign_db.outcome_report


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: AsyncSession = Depends(get_db)
):
    """List all campaigns for current user."""
    result = await db.execute(
        select(CampaignDB)
        .where(CampaignDB.user_id == user_id)
        .order_by(CampaignDB.created_at.desc())
    )
    campaigns_db = result.scalars().all()
    
    return [
        CampaignResponse(
            campaign_id=c.campaign_id,
            user_id=c.user_id,
            goal=c.onboarding_data.get("goal") if c.onboarding_data else None,
            target_platforms=c.onboarding_data.get("goal", {}).get("platforms") if c.onboarding_data else None,
            status=c.status,
            campaign_plan=c.campaign_plan,
            plan_approved=False,  # Not in DB yet
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in campaigns_db
    ]

