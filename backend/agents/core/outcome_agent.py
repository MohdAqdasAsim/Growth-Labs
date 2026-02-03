"""Agent 6: Outcome Analysis Agent - Post-campaign analysis."""
from typing import Dict, Any, Optional

from ...services.ai.gemini_service import GeminiService
from ...models.agents.agent_outputs import OutcomeAgentOutput


class OutcomeAgent:
    """
    Explains what happened vs goal.
    
    Single responsibility: Analyze campaign results
    Stateless: No internal state
    One call: Single Gemini API call per execution
    No guessing: Only reasoning from actual metrics
    """
    
    def __init__(self):
        """Initialize with Gemini service."""
        self.gemini = GeminiService()
    
    def analyze_outcome(
        self,
        goal: Dict[str, Any],
        actual_metrics: Dict[str, Any],
        campaign_plan: Dict[str, Any],
        daily_execution: Optional[Dict[str, Any]] = None
    ) -> OutcomeAgentOutput:
        """
        Analyze campaign outcome vs goal.
        
        Args:
            goal: Original campaign goal
            actual_metrics: Actual results (manual or public metrics)
            campaign_plan: The plan that was executed
            daily_execution: Daily execution tracking (adherence data)
        
        Returns:
            OutcomeAgentOutput with goal_vs_result, what_worked, what_failed, suggestions
        """
        # Single Gemini call for honest analysis including adherence rate
        return self.gemini.analyze_outcome(goal, actual_metrics, campaign_plan, daily_execution)

