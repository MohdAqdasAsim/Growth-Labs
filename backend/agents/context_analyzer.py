"""Agent 1: Creator Context Analyzer - Runs ONCE per user lifetime."""
from typing import Dict, Any

from ..services.gemini_service import GeminiService
from ..models.agent_outputs import ContextAnalyzerOutput


class ContextAnalyzer:
    """
    Analyzes creator's own content style, audience, strengths, weaknesses.
    
    Single responsibility: Extract patterns from creator's own content
    Stateless: No internal state
    One call: Single Gemini API call per execution
    """
    
    def __init__(self):
        """Initialize with Gemini service."""
        self.gemini = GeminiService()
    
    def analyze(
        self,
        creator_data: Dict[str, Any]
    ) -> ContextAnalyzerOutput:
        """
        Deep creator context analysis - runs once at onboarding, re-runs if profile updated.
        
        Args:
            creator_data: Dict containing Phase 1 + Phase 2 fields from CreatorProfile:
                Phase 1 (Required):
                - category, target_audience, platforms, time_per_week
                - youtube_url, instagram_url, reddit_url
                - competitor_urls, best_content, worst_content
                
                Phase 2 (Optional):
                - unique_angle, content_mission
                - self_strengths, self_weaknesses, content_enjoys, content_avoids
                - current_metrics, audience_demographics
                - tools_skills, budget, team_size
                - past_attempts, what_worked_before
                - why_create, timeline_expectations
        
        Returns:
            ContextAnalyzerOutput with 6 nested dicts:
            - creator_identity, content_dna, performance_insights
            - constraints, growth_context, strategic_insights
        """
        # Single Gemini call - no retries, no loops
        return self.gemini.analyze_context(creator_data)

