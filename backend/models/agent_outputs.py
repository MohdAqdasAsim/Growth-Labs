"""Pydantic schemas for all agent outputs (JSON-in/JSON-out)."""
from typing import Optional
from pydantic import BaseModel, Field


# Agent 1: Context Analyzer Output
class ContextAnalyzerOutput(BaseModel):
    """Rich creator profile analysis - persistent creator memory."""
    
    creator_identity: dict = Field(
        default_factory=dict,
        description="Synthesized: niche, audience, unique_angle, mission"
    )
    
    content_dna: dict = Field(
        default_factory=dict,
        description="Strengths, weaknesses, preferred_formats, content_to_avoid"
    )
    
    performance_insights: dict = Field(
        default_factory=dict,
        description="Best/worst content patterns, engagement triggers"
    )
    
    constraints: dict = Field(
        default_factory=dict,
        description="Time capacity, platforms, tools, budget, team"
    )
    
    growth_context: dict = Field(
        default_factory=dict,
        description="Past attempts, what worked before, current metrics"
    )
    
    strategic_insights: dict = Field(
        default_factory=dict,
        description="Realistic posting frequency, sustainability risks, authentic voice, motivation"
    )


# Agent 2: Strategy Agent Output
class StrategyAgentOutput(BaseModel):
    """Output from Campaign Strategy Agent."""
    hypothesis: str
    platform_focus: list[str]
    experiment_focus: str
    reality_check: dict = Field(
        default_factory=dict,
        description="Realism assessment: is_realistic, concern_level, warning, suggested_alternatives"
    )


# Agent 3: Forensics Agent Output
class ForensicsAgentOutput(BaseModel):
    """Output from Competitor Performance Forensics Agent."""
    platform: str = Field(..., description="Platform analyzed: youtube or twitter")
    patterns_that_worked: list[str]
    patterns_that_failed: list[str]
    transferable_rules: list[str]


# Agent 4: Planner Agent Output
class DayAction(BaseModel):
    """Action for a single day."""
    youtube: Optional[str] = None
    twitter: Optional[str] = None


class PlannerAgentOutput(BaseModel):
    """Output from Campaign Planner."""
    day_1: DayAction
    day_2: DayAction
    day_3: DayAction
    extra_days: dict[int, DayAction] = Field(default_factory=dict, description="Days 4+ for campaigns longer than 3 days")


# Agent 5: Content Agent Output
class ContentReasoning(BaseModel):
    """Reasoning behind generated content."""
    pattern_used: str = Field(..., description="Which competitor pattern was applied")
    why_it_works: str = Field(..., description="Why this approach should succeed")
    estimated_performance: str = Field(..., description="Expected engagement level: low, medium, high")


class ContentAgentOutput(BaseModel):
    """Output from Content Execution Agent."""
    youtube_script: Optional[str] = None
    title: Optional[str] = None
    seo_tags: list[str] = Field(default_factory=list)
    cta: Optional[str] = None
    reasoning: Optional[ContentReasoning] = Field(None, description="Explanation of content strategy")


# Agent 6: Outcome Agent Output
class OutcomeAgentOutput(BaseModel):
    """Output from Outcome Analysis Agent."""
    goal_vs_result: dict
    what_worked: list[str]
    what_failed: list[str]
    next_campaign_suggestions: list[str]

