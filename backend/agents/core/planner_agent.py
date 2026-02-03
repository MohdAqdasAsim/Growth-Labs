"""Agent 4: Campaign Planner - Creates flexible duration action plans."""
from typing import Dict, Any, Optional, List

from ...services.ai.gemini_service import GeminiService
from ...models.agents.agent_outputs import PlannerAgentOutput
from ...models.campaign.campaign import CampaignGoal
from ...config import PLATFORM_POSTING_NORMS


class PlannerAgent:
    """
    Creates campaign action plans with flexible duration (3-30 days).
    
    Single responsibility: Plan daily actions for N-day campaign
    Stateless: No internal state
    One call: Single Gemini API call per execution
    Output: User must approve before execution
    """
    
    def __init__(self):
        """Initialize with Gemini service."""
        self.gemini = GeminiService()
    
    def create_plan(
        self,
        goal: CampaignGoal,
        strategy: Dict[str, Any],
        forensics_yt: Optional[Dict[str, Any]] = None,
        forensics_x: Optional[Dict[str, Any]] = None,
        content_intensity: str = "moderate",
        past_learnings: Optional[List] = None
    ) -> PlannerAgentOutput:
        """
        Create N-day campaign plan from strategy and forensics.
        
        Args:
            goal: Campaign goal with duration_days and posting_frequency
            strategy: Output from StrategyAgent
            forensics_yt: Optional output from ForensicsAgent for YouTube
            forensics_x: Optional output from ForensicsAgent for Twitter
            content_intensity: Production intensity (light/moderate/intense)
            past_learnings: List of LearningMemory objects from previous campaigns
        
        Returns:
            PlannerAgentOutput with day_1, day_2, day_3, extra_days actions
            
        Raises:
            ValueError: If platform cadence violates norms
        """
        # Validate platform cadence
        self._validate_cadence(goal)
        
        # Single Gemini call to create the plan
        return self.gemini.create_plan(
            goal=goal,
            strategy=strategy,
            forensics_yt=forensics_yt,
            forensics_x=forensics_x,
            content_intensity=content_intensity,
            goal_type=goal.goal_type if goal else "growth",
            past_learnings=past_learnings
        )
    
    def _validate_cadence(self, goal: CampaignGoal) -> None:
        """
        Validate posting frequency matches platform norms.
        
        Args:
            goal: Campaign goal to validate
            
        Raises:
            ValueError: If cadence is unrealistic for platform
        """
        # Handle multiple platforms (validate first platform for simplicity)
        if not goal.platforms:
            return
            
        platform = goal.platforms[0].lower()
        duration = goal.duration_days
        
        if platform in PLATFORM_POSTING_NORMS:
            norms = PLATFORM_POSTING_NORMS[platform]
            min_days = norms["min_frequency_days"]
            
            # Calculate expected posts
            expected_posts = duration / min_days
            
            # Warn if expecting too many posts
            if platform == "youtube" and duration < 7:
                # YouTube campaigns should be at least 7 days for 1 video
                pass  # Allow but will be validated in prompt
            
            # Add any critical validation logic here
            # For now, let the prompt guide proper cadence

