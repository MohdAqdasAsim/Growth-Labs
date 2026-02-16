"""User and Creator Profile models."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl, Field

from ..common.enums import PlatformEnum


class CreatorProfile(BaseModel):
    """Enhanced creator profile with Phase 1 (required) + Phase 2 (optional) data - matches database schema."""
    user_id: str
    
    # ===== PHASE 1: GLOBAL ONBOARDING (REQUIRED) - 6 fields =====
    user_name: str = Field(..., description="User's display name")
    creator_type: str = Field(..., description="Creator type: 'content_creator', 'student', 'marketing', 'business', 'freelancer'")
    niche: str = Field(..., description="Category/niche user operates in (e.g., 'Tech education', 'Fitness')")
    target_audience_niche: str = Field(..., description="Target audience's niche/interests (e.g., 'College students learning code')")
    existing_platforms: list[str] = Field(default_factory=list, description="Platforms user is active on (stored as strings from DB)")
    platform_urls: dict[str, str] = Field(default_factory=dict, description="Platform URLs: {YouTube: url, Twitter: url, ...}")
    
    # ===== PHASE 2: PROFILE COMPLETION (OPTIONAL) - 11 fields =====
    unique_angle: Optional[str] = Field(None, description="What makes you different (e.g., 'I teach through my mistakes')")
    self_purpose: Optional[str] = Field(None, description="Your content purpose (e.g., 'Make AI accessible to non-engineers')")
    self_strengths: list[str] = Field(default_factory=list, description="What you're naturally good at")
    target_platforms: list[str] = Field(default_factory=list, description="Platforms you want to grow on (stored as strings from DB)")
    self_topics: list[str] = Field(default_factory=list, description="Topics you want to cover")
    target_audience_demographics: Optional[str] = Field(None, description="Audience demographics (e.g., '18-24, college students, US')")
    competitor_accounts: dict[str, list[str]] = Field(default_factory=dict, description="Platform-specific competitor accounts: {youtube: [handles], twitter: [handles]}")
    existing_assets: list[str] = Field(default_factory=list, description="Existing resources (e.g., ['Blog with 50 posts', 'Email list 500'])")
    self_motivation: Optional[str] = Field(None, description="Why you create content (e.g., 'Build personal brand')")
    
    # Note: removed fields not in database - self_weaknesses, content_enjoys, content_avoids, tools_skills, past_attempts, what_worked_before
    
    # ===== SYSTEM FIELDS =====
    recommended_frequency: Optional[str] = Field(None, description="Agent-calculated realistic posting frequency")
    agent_context: dict = Field(default_factory=dict, description="Context Analyzer output and campaign results")
    phase2_completed: bool = Field(default=False, description="Track Phase 2 completion status")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class User(BaseModel):
    """User account model - matches database schema (no password stored)."""
    user_id: str
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None


class UserCreate(BaseModel):
    """User registration input."""
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="User password")


class UserLogin(BaseModel):
    """User login input."""
    email: str
    password: str


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"

