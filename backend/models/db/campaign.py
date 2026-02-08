"""SQLAlchemy models for campaigns and related tables."""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from ...database.base import Base


class CampaignDB(Base):
    """
    Campaign table - Store campaign configuration, status, agent outputs, and timestamps.
    """
    __tablename__ = "campaigns"
    
    # Primary Key
    campaign_id = Column(String(255), primary_key=True, comment="UUID")
    
    # Foreign Key
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # ===== Onboarding Data =====
    onboarding_data = Column(JSONB, nullable=True, comment="CampaignOnboarding model (name, description, goal, competitors, agent_config)")
    status = Column(String(50), nullable=False, default="onboarding_incomplete", comment="Enum: onboarding_incomplete, ready_to_start, processing, in_progress, generating_report, completed, processing_failed, failed, archived_plan_expired")
    task_id = Column(String(255), nullable=True, index=True, comment="Celery task ID for async operations")
    
    # ===== Archive Tracking =====
    archived_at = Column(DateTime(timezone=True), nullable=True, comment="When campaign was archived")
    archived_reason = Column(String(100), nullable=True, comment="plan_expired, user_deleted, abuse")
    
    # ===== Memory & Learning =====
    profile_snapshot = Column(JSONB, default=dict, comment="CreatorProfile snapshot at creation")
    learning_insights = Column(JSONB, nullable=True, comment="Insights from past campaigns")
    learning_approved = Column(Boolean, default=False, comment="User approved lessons")
    
    # ===== Agent Outputs =====
    strategy_output = Column(JSONB, default=dict, comment="Strategy Agent response")
    forensics_output = Column(JSONB, default=dict, comment="Forensics Agent response (all platforms)")
    campaign_plan = Column(JSONB, nullable=True, comment="CampaignPlan model (day-by-day plan)")
    content_warnings = Column(JSONB, nullable=True, comment="Realism assessment warnings")
    outcome_report = Column(JSONB, nullable=True, comment="CampaignReport model (outcome analysis)")
    
    # ===== Timestamps =====
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    onboarding_completed_at = Column(DateTime(timezone=True), nullable=True, comment="Onboarding finished")
    started_at = Column(DateTime(timezone=True), nullable=True, comment="User clicked 'Start'")
    completed_at = Column(DateTime(timezone=True), nullable=True, comment="Campaign finished")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class DailyContentDB(Base):
    """
    Daily content table - Store generated content per day per platform (normalized from campaign dict).
    """
    __tablename__ = "daily_content"
    
    # Primary Key
    content_id = Column(String(255), primary_key=True, comment="UUID")
    
    # Foreign Key
    campaign_id = Column(String(255), ForeignKey("campaigns.campaign_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Day & Platform
    day_number = Column(Integer, nullable=False)
    platform = Column(String(50), nullable=False, comment="youtube, twitter, linkedin, instagram, tiktok")
    
    # ===== YouTube Content =====
    video_script = Column(Text, nullable=True, comment="Video script")
    video_title = Column(String(500), nullable=True, comment="Video title")
    seo_tags = Column(JSONB, default=list, comment="Array of SEO tags")
    call_to_action = Column(Text, nullable=True, comment="Call to action")
    
    # ===== Twitter Content =====
    tweet_text = Column(String(280), nullable=True, comment="Single tweet")
    thread_tweets = Column(JSONB, nullable=True, comment="Array of tweets for thread")
    
    # ===== Image/Media (Platform-specific) =====
    thumbnail_urls = Column(JSONB, default=dict, comment="Platform-specific image URLs: {youtube: url, twitter: url, instagram: url}")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("day_number >= 1 AND day_number <= 30", name="check_day_number_range"),
        UniqueConstraint("campaign_id", "day_number", "platform", name="unique_content_per_day_platform"),
    )


class DailyExecutionDB(Base):
    """
    Daily execution table - Track when content was actually posted and engagement metrics.
    """
    __tablename__ = "daily_execution"
    
    # Primary Key
    execution_id = Column(String(255), primary_key=True, comment="UUID")
    
    # Foreign Key
    campaign_id = Column(String(255), ForeignKey("campaigns.campaign_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Day & Platform
    day_number = Column(Integer, nullable=False)
    platform = Column(String(50), nullable=False, comment="youtube, twitter, linkedin, instagram, tiktok")
    
    # Execution Status
    posted_to_youtube = Column(Boolean, default=False, comment="YouTube posted")
    posted_to_twitter = Column(Boolean, default=False, comment="Twitter posted")
    executed_at = Column(DateTime(timezone=True), nullable=True, comment="Confirmation timestamp")
    
    # Platform Data
    actual_platform_post_id = Column(String(255), nullable=True, comment="Platform's post ID (e.g., YouTube video ID)")
    engagement_metrics = Column(JSONB, default=dict, comment="Views, likes, comments, shares")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("campaign_id", "day_number", "platform", name="unique_execution_per_day_platform"),
    )


class LearningMemoryDB(Base):
    """
    Learning memories table - Store insights from completed campaigns for future learning (strategy optimization).
    """
    __tablename__ = "learning_memories"
    
    # Primary Key (note: Pydantic model uses 'memory_id' field name)
    memory_id = Column(String(255), primary_key=True, comment="UUID")
    
    # Foreign Keys
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(String(255), ForeignKey("campaigns.campaign_id", ondelete="CASCADE"), nullable=False)
    
    # ===== Context Fields (for filtering) =====
    goal_type = Column(String(50), nullable=False, index=True, comment="growth, engagement, monetization, launch")
    platform = Column(String(50), nullable=False, index=True, comment="YouTube, Twitter, Instagram, TikTok")
    niche = Column(String(255), nullable=False, index=True, comment="Content niche")
    campaign_duration_days = Column(Integer, nullable=False, comment="Campaign length")
    posting_frequency = Column(String(50), nullable=False, comment="light, moderate, intense")
    
    # ===== Outcome Analysis =====
    what_worked = Column(JSONB, default=list, comment="Array of successful strategies")
    what_failed = Column(JSONB, default=list, comment="Array of unsuccessful attempts")
    recommendations = Column(JSONB, default=list, comment="Recommendations")
    goal_achievement_summary = Column(Text, default="", comment="Goal achievement summary")
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Composite index for fast retrieval
    __table_args__ = (
        # Index on (user_id, goal_type, platform, niche) for fast filtering
    )
