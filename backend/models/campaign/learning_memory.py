"""Learning Memory model for storing campaign outcome insights."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class LearningMemory(BaseModel):
    """
    Stores insights from completed campaigns for future learning.
    
    This model captures what worked/failed in previous campaigns so that
    future campaigns can benefit from past experience.
    """
    id: str = Field(..., description="Unique learning memory ID")
    user_id: str = Field(..., description="User who owns this learning")
    campaign_id: str = Field(..., description="Campaign this learning came from")
    
    # Campaign context
    goal_type: str = Field(..., description="Type of goal: growth, engagement, monetization, launch")
    platform: str = Field(..., description="Primary platform: YouTube, Twitter, etc.")
    niche: str = Field(..., description="Content niche/category")
    
    # Learning insights (from OutcomeAgent)
    what_worked: List[str] = Field(default_factory=list, description="Strategies that succeeded")
    what_failed: List[str] = Field(default_factory=list, description="Strategies that failed")
    next_campaign_suggestions: List[str] = Field(default_factory=list, description="Recommendations for future campaigns")
    
    # Additional context
    goal_vs_result: str = Field(default="", description="Goal achievement summary")
    duration_days: int = Field(..., description="Campaign duration")
    intensity: str = Field(..., description="Content intensity: light, moderate, intense")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When this learning was captured")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "id": "lm_001",
                "user_id": "user_123",
                "campaign_id": "camp_456",
                "goal_type": "growth",
                "platform": "YouTube",
                "niche": "tech tutorials",
                "what_worked": ["Short-form content", "Tutorial series"],
                "what_failed": ["Posting inconsistently"],
                "next_campaign_suggestions": ["Focus on consistency", "Leverage shorts"],
                "goal_vs_result": "Achieved 80% of subscriber goal",
                "duration_days": 7,
                "intensity": "moderate",
                "created_at": "2026-02-03T10:00:00Z"
            }
        }
