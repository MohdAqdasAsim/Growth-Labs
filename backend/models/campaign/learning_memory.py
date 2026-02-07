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
    memory_id: str = Field(..., description="Unique learning memory ID (UUID)")
    user_id: str = Field(..., description="User who owns this learning")
    campaign_id: str = Field(..., description="Campaign this learning came from")
    
    # Campaign context (for filtering)
    goal_type: str = Field(..., description="Type of goal: growth, engagement, monetization, launch")
    platform: str = Field(..., description="Primary platform: YouTube, Twitter, etc.")
    niche: str = Field(..., description="Content niche/category")
    campaign_duration_days: int = Field(..., description="Campaign duration in days")
    posting_frequency: str = Field(..., description="Content intensity: light, moderate, intense")
    
    # Learning insights (from OutcomeAgent)
    what_worked: List[str] = Field(default_factory=list, description="Strategies that succeeded")
    what_failed: List[str] = Field(default_factory=list, description="Strategies that failed")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for future campaigns")
    goal_achievement_summary: str = Field(default="", description="Goal achievement summary")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When this learning was captured")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "memory_id": "lm_001",
                "user_id": "user_123",
                "campaign_id": "camp_456",
                "goal_type": "growth",
                "platform": "YouTube",
                "niche": "tech tutorials",
                "campaign_duration_days": 7,
                "posting_frequency": "moderate",
                "what_worked": ["Short-form content", "Tutorial series"],
                "what_failed": ["Posting inconsistently"],
                "recommendations": ["Focus on consistency", "Leverage shorts"],
                "goal_achievement_summary": "Achieved 80% of subscriber goal",
                "created_at": "2026-02-03T10:00:00Z"
            }
        }
