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


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Create a new campaign and automatically execute full workflow.
    
    This executes:
    1. Strategy Agent
    2. Forensics Agents (YT + X if applicable)
    3. Planner Agent
    4. Content Agent (generates content for all days)
    
    Campaign will be in 'in_progress' status after completion.
    """
    # Get creator profile
    profile = memory_store.get_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creator profile not found. Complete onboarding first."
        )
    
    # Task 2: Suggest content_intensity based on time_per_week
    # Parse time_per_week (e.g., "5-10 hours", "10+ hours", "Less than 5")
    content_intensity = "moderate"  # default
    time_per_week = profile.time_per_week.lower() if profile.time_per_week else ""
    
    if "less" in time_per_week or any(x in time_per_week for x in ["1", "2", "3", "4"]):
        content_intensity = "light"  # < 5 hours
    elif any(x in time_per_week for x in ["10+", "15", "20", "more than"]):
        content_intensity = "intense"  # 10+ hours
    else:
        content_intensity = "moderate"  # 5-10 hours
    
    # Create campaign
    campaign_id = str(uuid.uuid4())
    campaign = Campaign(
        campaign_id=campaign_id,
        user_id=user_id,
        goal=campaign_data.goal,
        target_platforms=campaign_data.target_platforms,
        content_intensity=content_intensity,
        status=CampaignStatus.PLANNING
    )
    
    # Execute full campaign (planning + content generation, no approval)
    try:
        orchestrator.reset_call_count()
        creator_profile_dict = profile.model_dump()
        
        # Get analyzed context if available
        creator_context = profile.historical_metrics.get("_analyzed_context")
        
        campaign = orchestrator.execute_full_campaign(
            campaign,
            creator_profile_dict,
            creator_context,
            competitor_youtube_urls=campaign_data.competitor_youtube_urls,
            competitor_x_handles=campaign_data.competitor_x_handles
        )
        
        # Check reality assessment and add warnings  # ADD THIS BLOCK
        reality_check = campaign.strategy_output.get("reality_check", {})
        concern_level = reality_check.get("concern_level", "low")
        
        if concern_level in ["medium", "high"]:
            warning_msg = reality_check.get("warning", "Goal may be unrealistic")
            suggested = reality_check.get("suggested_alternatives", [])
            
            # Log warning
            print(f"⚠️ Reality Check - {concern_level.upper()}: {warning_msg}")
            if suggested:
                print(f"💡 Suggested alternatives: {suggested}")
        
        memory_store.create_campaign(campaign)
        
    except Exception as e:
        # Log full error for debugging
        print(f"❌ Campaign planning error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Campaign planning failed: {str(e)}"
        )
    
    return CampaignResponse(
        campaign_id=campaign.campaign_id,
        user_id=campaign.user_id,
        goal=campaign.goal,
        target_platforms=campaign.target_platforms,
        status=campaign.status,
        plan=campaign.plan,
        plan_approved=campaign.plan_approved,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
    )


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
        goal=campaign.goal,
        target_platforms=campaign.target_platforms,
        status=campaign.status,
        plan=campaign.plan,
        plan_approved=campaign.plan_approved,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
    )


@router.post("/{campaign_id}/approve", response_model=CampaignResponse)
async def approve_campaign_plan(
    campaign_id: str,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    DEPRECATED: Campaigns are now auto-executed on creation.
    This endpoint is kept for backward compatibility but does nothing.
    
    Returns the campaign as-is.
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
    
    if not campaign.plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign plan not found"
        )
    
    # Campaign is already auto-executed on creation, just return it
    if campaign.status == CampaignStatus.IN_PROGRESS:
        # Already executed
        pass
    
    return CampaignResponse(
        campaign_id=campaign.campaign_id,
        user_id=campaign.user_id,
        goal=campaign.goal,
        target_platforms=campaign.target_platforms,
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
            goal=c.goal,
            status=c.status,
            plan=c.plan,
            plan_approved=c.plan_approved,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in campaigns
    ]

