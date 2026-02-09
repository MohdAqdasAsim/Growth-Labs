"""SQLAlchemy model for plan features and quotas."""
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from ...database.base import Base


class PlanFeatureDB(Base):
    """
    Plan features table - Defines quotas and limits for each plan tier.
    
    This table stores feature flags and quotas for free/pro tiers. When checking permissions,
    query this table by plan_tier from user's subscription.
    
    Example usage:
        plan_features = db.query(PlanFeatureDB).filter_by(plan_tier='pro').first()
        if user.campaigns_created >= plan_features.max_campaigns_per_month:
            raise QuotaExceeded("Campaign limit reached")
    """
    __tablename__ = "plan_features"
    
    # Primary Key
    plan_tier = Column(String(50), primary_key=True, comment="free, pro")
    
    # ===== Display Information =====
    plan_display_name = Column(String(100), nullable=False, comment="Starter, Creator")
    plan_price_monthly_usd = Column(Integer, nullable=False, default=0, comment="Price in cents (2900 = $29.00)")
    plan_description = Column(String(500), nullable=True, comment="Short marketing description")
    
    # ===== Campaign Quotas =====
    max_campaigns_per_month = Column(Integer, nullable=False, comment="Monthly campaign quota (-1 = unlimited)")
    min_campaign_duration_days = Column(Integer, nullable=False, default=3, comment="Minimum days per campaign")
    max_campaign_duration_days = Column(Integer, nullable=False, comment="Maximum days per campaign (7 free, 30 pro)")
    max_platforms_per_campaign = Column(Integer, nullable=False, comment="Max platforms per campaign (1-4)")
    max_competitors_per_campaign = Column(Integer, nullable=False, comment="Max competitors for forensics (2 free, 10 pro)")
    max_concurrent_campaigns = Column(Integer, nullable=False, comment="Max campaigns running simultaneously (1 free, 3 pro)")
    
    # ===== Workspace & DNA Limits =====
    max_workspaces = Column(Integer, nullable=False, comment="Max workspaces (1 free, 2 pro)")
    max_dna_profiles = Column(Integer, nullable=False, comment="Max 'My DNA' profiles - Phase 1+2 combos (1 free, 2 pro)")
    
    # ===== Feature Flags =====
    forensics_enabled = Column(Boolean, nullable=False, default=True, comment="Enable Forensics Agent (competitor analysis)")
    image_generation_enabled = Column(Boolean, nullable=False, default=False, comment="Enable AI image generation (false free, true pro)")
    seo_optimization_enabled = Column(Boolean, nullable=False, default=False, comment="Enable SEO optimization (false free, true pro)")
    analytics_enabled = Column(Boolean, nullable=False, default=False, comment="Access analytics dashboard (false free, true pro)")
    export_enhanced = Column(Boolean, nullable=False, default=False, comment="Enhanced export: bulk, PDF (false free, true pro)")
    priority_support = Column(Boolean, nullable=False, default=False, comment="Priority email support (false free, true pro)")
    
    # ===== Image Credits =====
    image_credits_per_month = Column(Integer, nullable=False, default=0, comment="Monthly base credits (0 free, 150 pro)")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
