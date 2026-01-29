"""Agent 2: Campaign Strategy Agent - Runs once per campaign."""
from typing import Dict, Any

from ..services.gemini_service import GeminiService
from ..models.agent_outputs import StrategyAgentOutput


class StrategyAgent:
    """
    Forms growth hypothesis and experimental strategy for campaign goal.
    
    Single responsibility: Decide what experiment to run for goal
    Stateless: No internal state
    One call: Single Gemini API call per execution
    No web access: Pure reasoning from creator context and goal
    """
    
    def __init__(self):
        """Initialize with Gemini service."""
        self.gemini = GeminiService()
    
    def generate_strategy(
        self,
        goal: str,
        creator_context: Dict[str, Any],
        duration_days: int = 3  # ADD
    ) -> StrategyAgentOutput:
        """
        Generate campaign strategy from goal and creator context with reality check.
        
        Args:
            goal: Campaign goal description (e.g., "Gain +30 YouTube subscribers in 3 days")
            creator_context: Output from ContextAnalyzer (niche, content_style, etc.)
            duration_days: Campaign duration for reality assessment
        
        Returns:
            StrategyAgentOutput with hypothesis, platform_focus, experiment_focus, reality_check
        """
        # Single Gemini call - pure reasoning, no external data
        return self.gemini.generate_strategy(goal, creator_context, duration_days)

