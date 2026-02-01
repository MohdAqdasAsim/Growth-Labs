"""Campaign API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Dict, Any
import uuid
from datetime import datetime

from ..models.campaign import Campaign, CampaignCreate, CampaignResponse, CampaignStatus, DailyExecution
from ..api.auth import get_current_user_id
from ..storage.memory_store import memory_store
from ..services.agent_orchestrator import AgentOrchestrator

router = APIRouter(prefix="/campaigns", tags=["campaigns"])
orchestrator = AgentOrchestrator()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_campaign(
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Create empty campaign shell.
    Status: ONBOARDING_INCOMPLETE
    Frontend will populate data via PATCH /campaigns/{id}/onboarding
    """
    # Get creator profile
    profile = memory_store.get_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creator profile not found. Complete onboarding first."
        )
    
    # Get global memory snapshot at creation time
    global_memory_snapshot = profile.model_dump()
    
    # Create empty campaign
    campaign_id = str(uuid.uuid4())
    campaign = Campaign(
        campaign_id=campaign_id,
        user_id=user_id,
        status=CampaignStatus.ONBOARDING_INCOMPLETE,
        global_memory_snapshot=global_memory_snapshot,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    memory_store.create_campaign(campaign)
    
    return {
        "message": "Campaign created. Complete onboarding next.",
        "campaign_id": campaign_id,
        "status": campaign.status
    }


@router.patch("/{campaign_id}/onboarding")
async def update_campaign_onboarding(
    campaign_id: str,
    onboarding_data: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Update campaign onboarding data (Steps 1-4).
    Can be called multiple times as user progresses through wizard.
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status not in [CampaignStatus.ONBOARDING_INCOMPLETE, CampaignStatus.READY_TO_START]:
        raise HTTPException(status_code=400, detail="Campaign already started")
    
    # Initialize onboarding if not exists
    if not campaign.onboarding:
        from ..models.campaign import CampaignOnboarding, CampaignGoal, CampaignCompetitors, AgentConfig
        campaign.onboarding = CampaignOnboarding(
            name="",
            description="",
            goal=CampaignGoal(
                goal_aim="",
                goal_type="",
                platforms=[],
                metrics=[],
                duration_days=3,
                intensity="moderate"
            ),
            competitors=CampaignCompetitors(),
            agent_config=AgentConfig()
        )
    
    # Update fields from request data
    if "name" in onboarding_data:
        campaign.onboarding.name = onboarding_data["name"]
    if "description" in onboarding_data:
        campaign.onboarding.description = onboarding_data["description"]
    if "goal_aim" in onboarding_data:
        campaign.onboarding.goal.goal_aim = onboarding_data["goal_aim"]
    if "goal_type" in onboarding_data:
        campaign.onboarding.goal.goal_type = onboarding_data["goal_type"]
    if "platforms" in onboarding_data:
        campaign.onboarding.goal.platforms = onboarding_data["platforms"]
    if "metrics" in onboarding_data:
        from ..models.campaign import CampaignMetric
        campaign.onboarding.goal.metrics = [CampaignMetric(**m) for m in onboarding_data["metrics"]]
    if "duration_days" in onboarding_data:
        campaign.onboarding.goal.duration_days = onboarding_data["duration_days"]
    if "intensity" in onboarding_data:
        campaign.onboarding.goal.intensity = onboarding_data["intensity"]
    if "competitors" in onboarding_data:
        from ..models.campaign import CampaignCompetitors, CompetitorPlatform
        campaign.onboarding.competitors = CampaignCompetitors(
            platforms=[CompetitorPlatform(**p) for p in onboarding_data["competitors"].get("platforms", [])]
        )
    if "agent_config" in onboarding_data:
        from ..models.campaign import AgentConfig
        campaign.onboarding.agent_config = AgentConfig(**onboarding_data["agent_config"])
    if "image_generation_enabled" in onboarding_data:
        campaign.onboarding.image_generation_enabled = onboarding_data["image_generation_enabled"]
    if "seo_optimization_enabled" in onboarding_data:
        campaign.onboarding.seo_optimization_enabled = onboarding_data["seo_optimization_enabled"]
    
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign)
    
    return {
        "message": "Campaign onboarding updated",
        "campaign_id": campaign_id
    }


@router.post("/{campaign_id}/complete-onboarding")
async def complete_campaign_onboarding(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Mark onboarding complete and analyze previous campaigns for lessons.
    Status: ONBOARDING_INCOMPLETE → READY_TO_START
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate required fields
    if not campaign.onboarding:
        raise HTTPException(status_code=400, detail="Complete campaign onboarding first")
    
    if not campaign.onboarding.name or not campaign.onboarding.goal.goal_aim:
        raise HTTPException(status_code=400, detail="Name and goal are required")
    
    # Analyze previous campaigns for lessons
    insights = memory_store.get_previous_campaign_insights(user_id)
    
    if insights and insights.get("total_campaigns", 0) > 0:
        # Agent Orchestrator will fill detailed insights
        detailed_insights = await orchestrator.analyze_previous_campaigns(user_id)
        campaign.learning_from_previous = detailed_insights
    
    campaign.status = CampaignStatus.READY_TO_START
    campaign.onboarding_completed_at = datetime.now()
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign)
    
    return {
        "message": "Campaign onboarding complete. Ready to start!",
        "campaign_id": campaign_id,
        "status": campaign.status,
        "learning_from_previous": campaign.learning_from_previous
    }


@router.get("/{campaign_id}/lessons-learned")
async def get_lessons_learned(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """Get insights from previous campaigns."""
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not campaign.learning_from_previous:
        return {
            "has_previous_campaigns": False,
            "lessons": None
        }
    
    return {
        "has_previous_campaigns": True,
        "lessons": campaign.learning_from_previous,
        "approved": campaign.learning_approved
    }


@router.patch("/{campaign_id}/approve-lessons")
async def approve_lessons(
    campaign_id: str,
    lessons: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """User approves or modifies lessons from previous campaigns."""
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    campaign.learning_from_previous = lessons
    campaign.learning_approved = True
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign)
    
    return {
        "message": "Lessons approved",
        "lessons": campaign.learning_from_previous
    }


@router.post("/{campaign_id}/start")
async def start_campaign(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Manual start - executes agent workflow.
    Status: READY_TO_START → IN_PROGRESS
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status != CampaignStatus.READY_TO_START:
        raise HTTPException(status_code=400, detail=f"Campaign not ready to start. Current status: {campaign.status}")
    
    # Update status
    campaign.status = CampaignStatus.IN_PROGRESS
    campaign.started_at = datetime.now()
    campaign.updated_at = datetime.now()
    memory_store.update_campaign(campaign)
    
    # Execute agent workflow
    try:
        await orchestrator.run_campaign_workflow(campaign_id)
        
        return {
            "message": "Campaign started successfully",
            "campaign_id": campaign_id,
            "status": campaign.status
        }
    except Exception as e:
        # Mark as failed
        campaign.status = CampaignStatus.FAILED
        memory_store.update_campaign(campaign)
        raise HTTPException(status_code=500, detail=f"Campaign execution failed: {str(e)}")


@router.patch("/{campaign_id}")
async def edit_campaign(
    campaign_id: str,
    onboarding_data: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Edit campaign (only if not started).
    Alias for /onboarding endpoint with validation.
    """
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status not in [CampaignStatus.ONBOARDING_INCOMPLETE, CampaignStatus.READY_TO_START]:
        raise HTTPException(status_code=400, detail="Cannot edit campaign after it has started")
    
    # Call onboarding update logic
    return await update_campaign_onboarding(campaign_id, onboarding_data, user_id)


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """Delete campaign (only if not started)."""
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if campaign.status not in [CampaignStatus.ONBOARDING_INCOMPLETE, CampaignStatus.READY_TO_START]:
        raise HTTPException(status_code=400, detail="Cannot delete campaign after it has started")
    
    # Remove from memory
    del memory_store.campaigns[campaign_id]
    if user_id in memory_store.user_campaigns:
        memory_store.user_campaigns[user_id].remove(campaign_id)
    
    return {"message": "Campaign deleted successfully"}


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """Get campaign by ID."""
    campaign = memory_store.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return CampaignResponse(
        campaign_id=campaign.campaign_id,
        user_id=campaign.user_id,
        goal=campaign.onboarding.goal if campaign.onboarding else None,
        target_platforms=campaign.onboarding.goal.platforms if (campaign.onboarding and campaign.onboarding.goal) else None,
        status=campaign.status,
        plan=campaign.plan,
        plan_approved=campaign.plan_approved,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
    )


@router.post("/{campaign_id}/complete")
async def complete_campaign(
    campaign_id: str,
    actual_metrics: Dict[str, Any],
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Mark campaign as complete and generate outcome report.
    
    This executes:
    - Outcome Agent (1 call)
    """
    campaign = memory_store.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if campaign.status != CampaignStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campaign must be in progress. Current status: {campaign.status}"
        )
    
    try:
        campaign = orchestrator.analyze_campaign_outcome(campaign, actual_metrics)
        memory_store.update_campaign(campaign)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Outcome analysis failed: {str(e)}"
        )
    
    return campaign.report


@router.patch("/{campaign_id}/day/{day_number}/confirm")
async def confirm_daily_execution(
    campaign_id: str,
    day_number: int,
    execution_data: Dict[str, bool],  # {"youtube_posted": true, "twitter_posted": false}
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Confirm content posting for a specific day.
    Tracks execution adherence for outcome analysis.
    
    Args:
        campaign_id: Campaign UUID
        day_number: Day number (1 to duration_days)
        execution_data: {"youtube_posted": bool, "twitter_posted": bool}
    """
    campaign = memory_store.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if campaign.status not in [CampaignStatus.IN_PROGRESS, CampaignStatus.APPROVED]:
        raise HTTPException(status_code=400, detail=f"Campaign not active. Status: {campaign.status}")
    
    # Validate day_number
    duration_days = campaign.goal.duration_days if hasattr(campaign.goal, 'duration_days') else 3
    if day_number < 1 or day_number > duration_days:
        raise HTTPException(status_code=400, detail=f"day_number must be between 1 and {duration_days}")
    
    # Check if content exists for this day
    if day_number not in campaign.daily_content:
        raise HTTPException(status_code=400, detail=f"No content generated for day {day_number}")
    
    # Create or update execution tracking
    execution = DailyExecution(
        day_number=day_number,
        youtube_posted=execution_data.get("youtube_posted", False),
        twitter_posted=execution_data.get("twitter_posted", False),
        posted_at=datetime.utcnow()
    )
    
    campaign.daily_execution[day_number] = execution
    memory_store.update_campaign(campaign)
    
    return {
        "message": f"Day {day_number} execution confirmed",
        "execution": execution.model_dump()
    }


@router.get("/{campaign_id}/schedule")
async def get_campaign_schedule(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Get campaign schedule with execution tracking.
    Shows all days with content, plan, and posting status.
    """
    campaign = memory_store.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not campaign.plan:
        raise HTTPException(status_code=400, detail="Campaign plan not created yet")
    
    duration_days = campaign.goal.duration_days if hasattr(campaign.goal, 'duration_days') else 3
    
    schedule = []
    for day in range(1, duration_days + 1):
        # Get plan for this day
        if day <= 3:
            day_plan = getattr(campaign.plan, f"day_{day}", None)
        else:
            day_plan = campaign.plan.extra_days.get(day)
        
        # Get content for this day
        daily_content = campaign.daily_content.get(day)
        
        # Get execution tracking
        execution = campaign.daily_execution.get(day)
        
        schedule.append({
            "day": day,
            "plan": day_plan.model_dump() if day_plan else None,
            "content_generated": daily_content is not None,
            "execution": execution.model_dump() if execution else None,
            "posted": execution.youtube_posted or execution.twitter_posted if execution else False
        })
    
    return {
        "campaign_id": campaign_id,
        "duration_days": duration_days,
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "status": campaign.status,
        "schedule": schedule
    }


@router.get("/{campaign_id}/report")
async def get_campaign_report(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """Get campaign report (only available after completion)."""
    campaign = memory_store.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if not campaign.report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign report not available. Complete the campaign first."
        )
    
    return campaign.report


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """List all campaigns for current user."""
    campaigns = memory_store.get_user_campaigns(user_id)
    return [
        CampaignResponse(
            campaign_id=c.campaign_id,
            user_id=c.user_id,
            goal=c.onboarding.goal if c.onboarding else None,
            target_platforms=c.onboarding.goal.platforms if (c.onboarding and c.onboarding.goal) else None,
            status=c.status,
            plan=c.plan,
            plan_approved=c.plan_approved,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in campaigns
    ]


@router.delete("/{campaign_id}", status_code=status.HTTP_200_OK)
async def delete_campaign(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """Delete campaign (only if not started)."""
    campaign = memory_store.get_campaign(campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if campaign.status not in [CampaignStatus.ONBOARDING_INCOMPLETE, CampaignStatus.READY_TO_START]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete campaign after it has started"
        )
    
    # Delete campaign
    memory_store.delete_campaign(campaign_id)
    
    return {"message": "Campaign deleted successfully"}

