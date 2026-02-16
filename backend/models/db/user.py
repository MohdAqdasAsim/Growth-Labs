"""SQLAlchemy models for users and creator profiles."""
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from ...database.base import Base


class UserDB(Base):
    """
    User table - Central user record linked to Clerk authentication.
    
    Strategy: user_id remains internal primary key, clerk_user_id maps to Clerk.
    """
    __tablename__ = "users"
    
    # Primary Key (internal - stable across auth provider changes)
    user_id = Column(String(255), primary_key=True, comment="Internal user ID (UUID)")
    
    # Clerk Integration
    clerk_user_id = Column(String(255), unique=True, nullable=True, index=True, comment="Clerk user ID from webhook")
    
    # User Information
    email = Column(String(255), unique=True, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)


class CreatorProfileDB(Base):
    """
    Creator profile table - Phase 1 (required) and Phase 2 (optional) onboarding data.
    """
    __tablename__ = "creator_profiles"
    
    # Primary Key (FK to users)
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    
    # ===== Phase 1 Fields (Required - 6 fields) =====
    user_name = Column(String(255), nullable=False, comment="Display name")
    creator_type = Column(String(50), nullable=False, comment="content_creator, student, marketing, business, freelancer")
    niche = Column(Text, nullable=False, comment="Category/niche (e.g., 'Tech education')")
    target_audience_niche = Column(Text, nullable=False, comment="Target audience interests")
    existing_platforms = Column(JSONB, server_default=text("'[]'::jsonb"), nullable=False, comment="Array of platform names (Phase 1)")
    platform_urls = Column(JSONB, server_default=text("'{}'::jsonb"), nullable=False, comment="Platform URLs: {YouTube: url, Twitter: url, ...}")
    
    # ===== Phase 2 Fields (Optional - 9 fields) =====
    unique_angle = Column(Text, nullable=True, comment="What makes creator different")
    self_purpose = Column(Text, nullable=True, comment="Content purpose")
    self_strengths = Column(JSONB, server_default=text("'[]'::jsonb"), nullable=False, comment="Array of strings")
    target_platforms = Column(JSONB, server_default=text("'[]'::jsonb"), nullable=False, comment="Array of strings")
    self_topics = Column(JSONB, server_default=text("'[]'::jsonb"), nullable=False, comment="Array of strings")
    target_audience_demographics = Column(Text, nullable=True, comment="Demographics description")
    competitor_accounts = Column(JSONB, server_default=text("'{}'::jsonb"), nullable=False, comment="Platform-specific accounts: {youtube: [handles], twitter: [handles], instagram: [handles]}")
    existing_assets = Column(JSONB, server_default=text("'[]'::jsonb"), nullable=False, comment="Array of strings")
    self_motivation = Column(Text, nullable=True, comment="Motivation for creating")
    
    # ===== System Fields =====
    recommended_frequency = Column(String(50), nullable=True, comment="Agent-calculated frequency")
    agent_context = Column(JSONB, server_default=text("'{}'::jsonb"), nullable=False, comment="Context Analyzer output")
    phase2_completed = Column(Boolean, server_default=text("false"), nullable=False, comment="Track Phase 2 completion")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
