"""Agent 5: Content Execution Agent - Generates daily content."""
from typing import Dict, Any

from ...services.ai.gemini_service import GeminiService
from ...models.agents.agent_outputs import ContentAgentOutput


class ContentAgent:
    """
    Generates ready-to-post content per approved plan.
    
    Single responsibility: Generate platform-specific content
    Stateless: No internal state
    One call per day: N calls per campaign (one per day, where N = duration_days)
    """
    
    def __init__(self):
        """Initialize with Gemini service."""
        self.gemini = GeminiService()
    
    def generate_content(
        self,
        day_plan: Dict[str, Any],
        creator_context: Dict[str, Any],
        day_number: int,
        duration_days: int,
        content_intensity: str = "moderate",
        goal_type: str = "growth"
    ) -> ContentAgentOutput:
        """
        Generate content for a specific day.
        
        Args:
            day_plan: Plan for this day (from PlannerAgent output)
            creator_context: Creator profile context (from ContextAnalyzer)
            day_number: Day number (1 to duration_days)
            duration_days: Total campaign duration (3-30 days)
            content_intensity: Production intensity (light/moderate/intense)
            goal_type: Type of goal (growth, engagement, monetization, launch)
        
        Returns:
            ContentAgentOutput with ready-to-post content (scripts, titles, tweets, etc.)
            
        Raises:
            ValueError: If day_number is outside valid range
        """
        # Dynamic validation based on campaign duration
        if day_number < 1 or day_number > duration_days:
            raise ValueError(f"day_number must be between 1 and {duration_days}")
        
        return self.gemini.generate_content(
            day_plan=day_plan,
            creator_context=creator_context,
            day_number=day_number,
            content_intensity=content_intensity,
            goal_type=goal_type
        )

