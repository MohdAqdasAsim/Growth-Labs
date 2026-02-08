"""Campaign-related models."""
from datetime import datetime
from enum import Enum
from typing import Optional, Literal
from pydantic import BaseModel, Field


class CampaignStatus(str, Enum):
    """Campaign status enum."""
    ONBOARDING_INCOMPLETE = "onboarding_incomplete"  # During campaign setup
    READY_TO_START = "ready_to_start"                # Onboarding done, awaiting manual start
    PROCESSING = "processing"                        # Agents running (async task)
    IN_PROGRESS = "in_progress"                      # Agents complete, content being posted
    GENERATING_REPORT = "generating_report"          # Outcome agent running (async task)
    COMPLETED = "completed"                          # All days executed, report generated
    PROCESSING_FAILED = "processing_failed"          # Agent execution failed (can retry)
    FAILED = "failed"                                # Permanent failure


# Campaign-specific competitor data
class CompetitorPlatform(BaseModel):
    """Competitor platform with URLs and descriptions."""
    platform: Literal["YouTube", "Twitter", "Instagram", "TikTok"]
    urls: list[dict] = Field(default_factory=list, description="[{'url': '...', 'desc': 'I like his thumbnails'}, ...]")


class CampaignCompetitors(BaseModel):
    """Campaign competitors across platforms."""
    platforms: list[CompetitorPlatform] = Field(default_factory=list)


# Metric with target
class CampaignMetric(BaseModel):
    """Campaign metric with target value."""
    type: str = Field(..., description="subscribers, views, followers, engagement")
    target: int = Field(..., description="Target value")


# UPDATED: Campaign Goal (supports multiple platforms)
class CampaignGoal(BaseModel):
    """Campaign goal definition with multiple platforms and metrics."""
    goal_aim: str = Field(..., description="What to achieve (free text)")
    goal_type: str = Field(..., description="growth, engagement, monetization, launch")
    platforms: list[str] = Field(..., description="['YouTube', 'Twitter'] - multiple platforms")
    metrics: list[CampaignMetric] = Field(..., description="Array of metric objects")
    duration_days: int = Field(default=3, ge=3, le=30, description="Campaign duration in days (3-30)")
    intensity: str = Field(default="moderate", description="light, moderate, intense")


# Agent Configuration (toggle switches)
class AgentConfig(BaseModel):
    """Agent execution configuration.
    
    Only forensics is toggleable. Other agents (strategy, planner, content, outcome) 
    are required for campaign execution. Context analyzer runs during onboarding 
    and results are reused during campaign.
    """
    run_forensics: bool = Field(default=True, description="Execute Forensics Agent (optional)")


# Campaign Onboarding Data
class CampaignOnboarding(BaseModel):
    """Campaign onboarding data collected through 4-step wizard."""
    name: str = Field(..., description="Campaign name")
    description: str = Field(..., description="Campaign description")
    goal: CampaignGoal
    competitors: CampaignCompetitors = Field(default_factory=CampaignCompetitors)
    agent_config: AgentConfig = Field(default_factory=AgentConfig)
    image_generation_enabled: bool = Field(default=True, description="Generate images/thumbnails")
    seo_optimization_enabled: bool = Field(default=True, description="Optimize content for SEO")


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
    thumbnail_url: Optional[str] = Field(None, description="Generated thumbnail image URL or data URI")


class CampaignReport(BaseModel):
    """Post-campaign analysis report."""
    goal_vs_result: dict = Field(default_factory=dict)
    what_worked: list[str] = Field(default_factory=list)
    what_failed: list[str] = Field(default_factory=list)
    next_campaign_suggestions: list[str] = Field(default_factory=list)
    actual_metrics: dict = Field(default_factory=dict)


class Campaign(BaseModel):
    """Campaign model with onboarding, learning, and detailed tracking."""
    campaign_id: str
    user_id: str
    
    # Campaign Onboarding Data
    onboarding_data: Optional[CampaignOnboarding] = None
    
    # Lifecycle Status
    status: CampaignStatus = Field(default=CampaignStatus.ONBOARDING_INCOMPLETE)
    
    # Global Memory Snapshot (taken at creation)
    profile_snapshot: dict = Field(default_factory=dict, description="Copy of CreatorProfile at campaign creation")
    
    # Archive Tracking
    archived_at: Optional[datetime] = Field(None, description="When campaign was archived")
    archived_reason: Optional[str] = Field(None, description="Reason for archival: plan_expired, user_deleted, abuse")
    
    # Learning from Previous Campaigns
    learning_insights: Optional[dict] = Field(None, description="Insights from past campaigns")
    learning_approved: bool = Field(default=False, description="User approved/modified lessons")
    
    # Planning Phase Outputs
    strategy_output: dict = Field(default_factory=dict)
    forensics_output: dict = Field(default_factory=dict, description="Combined all platforms")
    campaign_plan: Optional[CampaignPlan] = None
    plan_approved: bool = Field(default=False, description="User approved the generated plan")
    content_warnings: Optional[dict] = None
    
    # Execution Tracking
    daily_content: dict[int, DailyContent] = Field(default_factory=dict)
    daily_execution: dict[int, DailyExecution] = Field(default_factory=dict, description="Track actual posting per day")
    outcome_report: Optional[CampaignReport] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When campaign was created")
    onboarding_completed_at: Optional[datetime] = Field(None, description="When onboarding finished")
    started_at: Optional[datetime] = Field(None, description="When user clicked 'Start'")
    completed_at: Optional[datetime] = Field(None, description="When campaign finished")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last modification")


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
    goal: Optional[CampaignGoal] = None
    target_platforms: Optional[list[str]] = None
    status: str
    campaign_plan: Optional[CampaignPlan] = None
    plan_approved: bool = False
    created_at: datetime
    updated_at: datetime

