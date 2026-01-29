"""Campaign-related models."""
from datetime import datetime
from enum import Enum
from typing import Optional, Literal
from pydantic import BaseModel, Field


class CampaignGoal(BaseModel):
    """Campaign goal definition."""
    description: str = Field(..., description="Goal description, e.g., 'Gain +30 YouTube subscribers in 3 days'")
    goal_type: str = Field(..., description="Goal type: growth, engagement, launch, etc.")
    platform: Literal["YouTube", "Twitter"] = Field(..., description="Target platform")
    metric: str = Field(..., description="Metric: subscribers, views, engagement, followers, likes, etc.")
    target_value: Optional[float] = Field(None, description="Target value if numeric")
    duration_days: int = Field(default=3, ge=3, le=30, description="Campaign duration in days (3-30)")
    posting_frequency: str = Field(default="daily", description="Posting cadence: daily, every_2_days, weekly, etc.")


class CampaignStatus(str, Enum):
    """Campaign status enum."""
    PLANNING = "planning"
    APPROVAL_PENDING = "approval_pending"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DailyExecution(BaseModel):
    """Daily execution tracking."""
    day_number: int = Field(..., ge=1, description="Day number in campaign")
    youtube_posted: bool = Field(default=False, description="Whether YouTube content was posted")
    twitter_posted: bool = Field(default=False, description="Whether Twitter content was posted")
    posted_at: Optional[datetime] = Field(None, description="Timestamp of confirmation")


class DayPlan(BaseModel):
    """Plan for a single day."""
    youtube: Optional[str] = Field(None, description="YouTube action for this day")
    twitter: Optional[str] = Field(None, description="Twitter action for this day")


class CampaignPlan(BaseModel):
    """3-day campaign plan."""
    day_1: DayPlan
    day_2: DayPlan
    day_3: DayPlan
    extra_days: dict[int, DayPlan] = Field(default_factory=dict, description="Days 4+ for campaigns longer than 3 days")
    hypothesis: str = Field(..., description="Growth hypothesis")
    platform_focus: list[str] = Field(default_factory=list)


class DailyContent(BaseModel):
    """Generated content for a day."""
    day: int = Field(..., ge=1, description="Day number (1 to duration_days)")
    youtube_script: Optional[str] = None
    youtube_title: Optional[str] = None
    youtube_seo_tags: list[str] = Field(default_factory=list)
    youtube_cta: Optional[str] = None
    x_tweet: Optional[str] = Field(None, description="Twitter/X single tweet")
    x_thread: Optional[list[str]] = Field(None, description="Twitter/X thread (list of tweets)")


class CampaignReport(BaseModel):
    """Post-campaign analysis report."""
    goal_vs_result: dict = Field(default_factory=dict)
    what_worked: list[str] = Field(default_factory=list)
    what_failed: list[str] = Field(default_factory=list)
    next_campaign_suggestions: list[str] = Field(default_factory=list)
    actual_metrics: dict = Field(default_factory=dict)


class Campaign(BaseModel):
    """Campaign model."""
    campaign_id: str
    user_id: str
    goal: CampaignGoal
    target_platforms: list[str]
    content_intensity: str = "moderate"
    status: CampaignStatus = CampaignStatus.PLANNING
    
    # Planning phase outputs
    strategy_output: dict = Field(default_factory=dict)
    forensics_output_yt: dict = Field(default_factory=dict)
    forensics_output_x: dict = Field(default_factory=dict)
    plan: Optional[CampaignPlan] = None
    plan_approved: bool = False
    
    reality_warning: Optional[dict] = None  # NEW: Reality check warnings

    daily_content: dict[int, DailyContent] = Field(default_factory=dict)
    daily_execution: dict[int, DailyExecution] = Field(default_factory=dict, description="Track actual posting per day")
    report: Optional[CampaignReport] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CampaignCreate(BaseModel):
    """Campaign creation input."""
    goal: CampaignGoal
    target_platforms: list[str] = Field(default=["youtube"], description="Platforms for this campaign")
    competitor_youtube_urls: list[str] = Field(default_factory=list, description="Competitor YouTube channels for forensics")  # ADD
    competitor_x_handles: list[str] = Field(default_factory=list, description="Competitor X/Twitter handles for forensics")  # ADD


class CampaignResponse(BaseModel):
    """Campaign response model."""
    campaign_id: str
    user_id: str
    goal: CampaignGoal
    target_platforms: list[str]
    status: str
    plan: Optional[CampaignPlan] = None
    plan_approved: bool = False
    created_at: datetime
    updated_at: datetime

