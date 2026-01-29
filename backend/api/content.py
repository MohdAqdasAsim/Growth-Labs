"""Content API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated

from ..models.campaign import DailyContent
from ..api.auth import get_current_user_id
from ..storage.memory_store import memory_store

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/campaigns/{campaign_id}/day/{day}", response_model=DailyContent)
async def get_daily_content(
    campaign_id: str,
    day: int,
    user_id: Annotated[str, Depends(get_current_user_id)]
):
    """
    Get generated content for a specific day of a campaign.
    
    Day must be 1, 2, or 3.
    Content is only available after campaign plan is approved.
    """
    campaign = memory_store.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    duration_days = campaign.goal.duration_days if hasattr(campaign.goal, 'duration_days') else 3
    if day < 1 or day > duration_days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Day must be between 1 and {duration_days}"
        )
    
    if campaign.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if not campaign.plan_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign plan not approved. Approve the plan first to generate content."
        )
    
    daily_content = campaign.daily_content.get(day)
    if not daily_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content for day {day} not found"
        )
    
    return daily_content

