"""User and Creator Profile models."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl, Field


class CreatorProfile(BaseModel):
    """Enhanced creator profile with Phase 1 (required) + Phase 2 (optional) data."""
    user_id: str
    
    # ===== PHASE 1: GLOBAL ONBOARDING (REQUIRED) - 5 fields =====
    user_name: str = Field(..., description="User's display name")
    creator_type: str = Field(..., description="Creator type: 'content_creator', 'student', 'marketing', 'business', 'freelancer'")
    niche: str = Field(..., description="Category/niche user operates in (e.g., 'Tech education', 'Fitness')")
    target_audience_niche: str = Field(..., description="Target audience's niche/interests (e.g., 'College students learning code')")
    
    # ===== PHASE 2: PROFILE COMPLETION (OPTIONAL) - 11 fields =====
    # Accessed via Dashboard → Profile Section
    # Identity (deeper)
    unique_angle: Optional[str] = Field(None, description="What makes you different (e.g., 'I teach through my mistakes')")
    content_mission: Optional[str] = Field(None, description="Your content purpose (e.g., 'Make AI accessible to non-engineers')")
    
    # Self-Assessment
    self_strengths: list[str] = Field(default_factory=list, description="What you're naturally good at")
    self_weaknesses: list[str] = Field(default_factory=list, description="What you struggle with")
    content_enjoys: list[str] = Field(default_factory=list, description="Content types you enjoy making")
    content_avoids: list[str] = Field(default_factory=list, description="Content types you want to avoid")
    
    # Audience Insights
    audience_demographics: Optional[str] = Field(None, description="Audience demographics (e.g., '18-24, college students, US')")
    
    # Resources
    tools_skills: list[str] = Field(default_factory=list, description="Tools/skills you have (e.g., ['Video editing', 'Canva'])")
    
    # Growth History
    past_attempts: list[dict] = Field(default_factory=list, description="Past growth attempts: [{attempt, outcome}]")
    what_worked_before: list[str] = Field(default_factory=list, description="Tactics that worked in the past")
    
    # Motivation
    why_create: Optional[str] = Field(None, description="Why you create content (e.g., 'Build personal brand')")
    
    # ===== SYSTEM FIELDS =====
    posting_frequency: Optional[str] = Field(None, description="Agent-calculated realistic posting frequency")
    historical_metrics: dict = Field(default_factory=dict, description="Stores analyzed context and campaign results")
    phase2_completed: bool = Field(default=False, description="Track Phase 2 completion status")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class User(BaseModel):
    """User account model."""
    user_id: str
    email: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


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

