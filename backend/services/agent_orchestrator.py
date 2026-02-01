"""Agent orchestrator - Coordinates agent execution flow."""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from ..agents.context_analyzer import ContextAnalyzer
from ..agents.strategy_agent import StrategyAgent
from ..agents.forensics_agent import ForensicsAgent
from ..agents.planner_agent import PlannerAgent
from ..agents.content_agent import ContentAgent
from ..agents.outcome_agent import OutcomeAgent
from ..models.campaign import Campaign, CampaignStatus


class AgentOrchestrator:
    """
    Coordinates agent execution flow and manages approval gates.
    
    Responsible for:
    - Executing agents in correct order
    - Managing campaign state transitions
    - Enforcing approval gates
    - Tracking Gemini API call count (5 + N calls per campaign, where N = duration_days)
    """
    
    def __init__(self):
        """Initialize all agents."""
        self.context_analyzer = ContextAnalyzer()
        self.strategy_agent = StrategyAgent()
        self.forensics_agent = ForensicsAgent()
        self.planner_agent = PlannerAgent()
        self.content_agent = ContentAgent()
        self.outcome_agent = OutcomeAgent()
        self.gemini_call_count = 0  # Track calls per campaign
    
    async def analyze_previous_campaigns(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Analyzes previous completed campaigns and extracts lessons learned.
        Returns insights for next campaign.
        """
        from ..storage.memory_store import memory_store
        
        history = memory_store.get_user_campaign_history(user_id)
        completed = [c for c in history if c.status == CampaignStatus.COMPLETED and c.report]
        
        if not completed:
            return None
        
        # Build analysis prompt
        campaigns_summary = []
        for campaign in completed:
            campaigns_summary.append({
                "name": campaign.onboarding.name if campaign.onboarding else "Unnamed",
                "goal": campaign.onboarding.goal.goal_aim if campaign.onboarding else "",
                "duration": campaign.onboarding.goal.duration_days if campaign.onboarding else 0,
                "report": campaign.report.model_dump() if campaign.report else {}
            })
        
        # Return basic structure for now (will be enhanced with Gemini later)
        return {
            "total_campaigns": len(completed),
            "last_campaign": completed[-1].campaign_id,
            "successful_patterns": [],
            "failed_patterns": [],
            "recommended_adjustments": []
        }
    
    async def run_campaign_workflow(self, campaign_id: str):
        """
        Executes campaign workflow with agent toggles, learning, image gen, SEO.
        Respects agent_config settings.
        """
        from ..storage.memory_store import memory_store
        
        campaign = memory_store.get_campaign(campaign_id)
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        if campaign.status != CampaignStatus.IN_PROGRESS:
            raise ValueError(f"Campaign must be IN_PROGRESS to execute")
        
        # Load data
        global_memory = campaign.global_memory_snapshot
        learning = campaign.learning_from_previous if campaign.learning_approved else None
        agent_config = campaign.onboarding.agent_config if campaign.onboarding else None
        
        self.reset_call_count()
        
        try:
            # STEP 1: Strategy Agent (if enabled)
            if agent_config and agent_config.run_strategy:
                print("Executing Strategy Agent...")
                strategy_context = {
                    "global_memory": global_memory,
                    "learning": learning,
                    "campaign": campaign.onboarding.model_dump() if campaign.onboarding else {}
                }
                # Note: This is placeholder - actual strategy agent call would go here
                campaign.strategy_output = {"status": "completed", "context": strategy_context}
                self.gemini_call_count += 1
            
            # STEP 2: Forensics Agent (if enabled)
            if agent_config and agent_config.run_forensics:
                print("Executing Forensics Agent...")
                forensics_output = {}
                
                if campaign.onboarding:
                    for platform in campaign.onboarding.goal.platforms:
                        # Get competitors for this platform
                        competitors = [
                            cp for cp in campaign.onboarding.competitors.platforms 
                            if cp.platform == platform
                        ]
                        
                        if competitors:
                            # Note: This is placeholder - actual forensics agent call would go here
                            forensics_output[platform] = {"status": "completed", "competitors": len(competitors[0].urls)}
                            self.gemini_call_count += 1
                
                campaign.forensics_output = forensics_output
            
            # STEP 3: Planner Agent (if enabled)
            if agent_config and agent_config.run_planner:
                print("Executing Planner Agent...")
                planner_context = {
                    "global_memory": global_memory,
                    "strategy": campaign.strategy_output,
                    "forensics": campaign.forensics_output,
                    "duration_days": campaign.onboarding.goal.duration_days if campaign.onboarding else 3,
                    "intensity": campaign.onboarding.goal.intensity if campaign.onboarding else "moderate",
                    "learning": learning
                }
                # Note: This is placeholder - actual planner agent call would go here
                campaign.plan = planner_context
                self.gemini_call_count += 1
            
            # Reality check (optional)
            if campaign.onboarding and campaign.onboarding.goal.duration_days < 7:
                campaign.reality_warning = {
                    "warning": "Short campaign duration may limit results",
                    "recommendation": "Consider extending to 7+ days"
                }
            
            # STEP 4: Content Agent (if enabled)
            if agent_config and agent_config.run_content:
                print("Executing Content Agent...")
                
                duration_days = campaign.onboarding.goal.duration_days if campaign.onboarding else 3
                for day in range(1, duration_days + 1):
                    print(f"Generating content for Day {day}...")
                    
                    content_context = {
                        "day": day,
                        "plan": campaign.plan if campaign.plan else {},
                        "strategy": campaign.strategy_output,
                        "forensics": campaign.forensics_output,
                        "global_memory": global_memory,
                        "learning": learning
                    }
                    
                    # Note: This is placeholder - actual content agent call would go here
                    daily_content = {"day": day, "status": "generated", "context": content_context}
                    campaign.daily_content[day] = daily_content
                    self.gemini_call_count += 1
                    
                    # Image Generation (if enabled)
                    if campaign.onboarding and campaign.onboarding.image_generation_enabled:
                        print(f"Generating image for Day {day}...")
                        image_url = await self.generate_image_for_content(daily_content)
                        if image_url:
                            campaign.daily_content[day]["thumbnail_url"] = image_url
                    
                    # SEO Optimization (if enabled)
                    if campaign.onboarding and campaign.onboarding.seo_optimization_enabled:
                        print(f"Optimizing SEO for Day {day}...")
                        optimized = await self.optimize_content_seo(daily_content)
                        campaign.daily_content[day] = optimized
            
            # Save campaign
            campaign.updated_at = datetime.utcnow()
            memory_store.update_campaign(campaign)
            
            print(f"Campaign workflow complete. Total Gemini calls: {self.gemini_call_count}")
            
        except Exception as e:
            print(f"Campaign workflow failed: {e}")
            campaign.status = CampaignStatus.FAILED
            memory_store.update_campaign(campaign)
            raise
    
    async def generate_image_for_content(self, content: Dict[str, Any]) -> Optional[str]:
        """Generate thumbnail image for content using ImageService."""
        try:
            from ..services.image_service import ImageService
            image_service = ImageService()
            
            # Extract title and hook from content
            title = content.get("title", "Content thumbnail")
            hook = content.get("hook", content.get("description", ""))
            
            # Generate thumbnail
            image_url = await image_service.generate_thumbnail(title, hook, platform="YouTube")
            return image_url
        except Exception as e:
            print(f"Image generation failed: {e}")
            return None
    
    async def optimize_content_seo(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize content for SEO using SEOService."""
        try:
            from ..services.seo_service import SEOService
            seo_service = SEOService()
            
            # Extract title and description from content
            title = content.get("title", "")
            description = content.get("description", "")
            
            if title and description:
                # Optimize using SEO service
                optimized = await seo_service.optimize_content(title, description, platform="YouTube")
                
                # Update content with optimized data
                content["title"] = optimized.get("title", title)
                content["description"] = optimized.get("description", description)
                content["tags"] = optimized.get("tags", [])
            
            return content
        except Exception as e:
            print(f"SEO optimization failed: {e}")
            return content
    
    def execute_full_campaign(
        self,
        campaign: Campaign,
        creator_profile: Dict[str, Any],
        creator_context: Optional[Dict[str, Any]] = None,
        competitor_youtube_urls: list[str] = None,
        competitor_x_handles: list[str] = None
    ) -> Campaign:
        """
        Execute full campaign: Strategy → Forensics → Planner → Content Generation.
        No approval gate - automatically generates all content.
        
        Gemini calls:
        1. Strategy Agent (1 call)
        2. Forensics Agent per platform (1-2 calls for YouTube and/or Twitter)
        3. Planner Agent (1 call)
        4. Content Agent (N calls, one per day)
        
        Total: 3-4 + N calls (depending on platforms and duration)
        """
        if creator_context is None:
            creator_data = {
                "category": creator_profile.get("category"),
                "platforms": creator_profile.get("platforms", []),
                "youtube_url": creator_profile.get("youtube_url"),
                "x_handle": creator_profile.get("x_handle"),
                "historical_metrics": creator_profile.get("historical_metrics", {}),
            }
            # Note: Context analyzer runs once per user lifetime, assume already done
        
        # 1. Strategy Agent (1 call)
        duration_days = campaign.goal.duration_days if hasattr(campaign.goal, 'duration_days') else 3  # ADD
        strategy_output = self.strategy_agent.generate_strategy(
            campaign.goal.description,
            creator_context or {},
            duration_days=duration_days  # ADD
        )
        campaign.strategy_output = strategy_output.model_dump()
        campaign.status = CampaignStatus.APPROVAL_PENDING
        self.gemini_call_count += 1
        
        # 2. Forensics Agent (1 call per platform)
        competitor_urls = creator_profile.get("competitor_urls", [])
        x_competitor_handles = creator_profile.get("x_competitor_handles", [])
        
        for platform in campaign.target_platforms:
            platform_lower = platform.lower()
            try:
                if platform_lower == "youtube":
                    forensics_output = self.forensics_agent.analyze_multiple_competitors(
                        "youtube",
                        competitor_urls
                    )
                    campaign.forensics_output_yt = forensics_output.model_dump()
                    self.gemini_call_count += 1
                    
                elif platform_lower == "twitter":
                    # Use competitor handles instead of own handle
                    if x_competitor_handles:
                        forensics_output = self.forensics_agent.analyze_multiple_competitors(
                            "twitter",
                            x_competitor_handles
                        )
                        campaign.forensics_output_x = forensics_output.model_dump()
                        self.gemini_call_count += 1
                    
            except Exception as e:
                print(f"Forensics {platform} failed: {e}")
                if platform_lower == "youtube":
                    campaign.forensics_output_yt = {}
                elif platform_lower == "twitter":
                    campaign.forensics_output_x = {}
        
        # 3. Planner Agent (1 call)
        plan = self.planner_agent.create_plan(
            goal=campaign.goal,
            strategy=campaign.strategy_output,
            forensics_yt=campaign.forensics_output_yt,
            forensics_x=campaign.forensics_output_x,
            content_intensity=campaign.content_intensity
        )
        # Convert PlannerAgentOutput to CampaignPlan
        from ..models.campaign import CampaignPlan, DayPlan, DailyContent
        campaign.plan = CampaignPlan(
            day_1=DayPlan(
                youtube=plan.day_1.youtube, twitter=plan.day_1.twitter
            ),
            day_2=DayPlan(
                youtube=plan.day_2.youtube, twitter=plan.day_2.twitter
            ),
            day_3=DayPlan(
                youtube=plan.day_3.youtube, twitter=plan.day_3.twitter
            ),
            extra_days={i: DayPlan(youtube=day.youtube, twitter=day.twitter) for i, day in plan.extra_days.items()} if hasattr(plan, 'extra_days') else {},
            hypothesis=campaign.strategy_output.get("hypothesis", ""),
            platform_focus=campaign.strategy_output.get("platform_focus", [])
        )
        self.gemini_call_count += 1
        
        # 4. Auto-approve and generate content (no approval gate)
        campaign.plan_approved = True
        campaign.status = CampaignStatus.IN_PROGRESS
        campaign.start_date = datetime.utcnow()
        duration_days = campaign.goal.duration_days if hasattr(campaign.goal, 'duration_days') else 3
        campaign.end_date = campaign.start_date + timedelta(days=duration_days)
        
        # Get creator context for content generation
        creator_context_for_content = campaign.strategy_output or {}
        
        # 5. Generate content for each day (N calls)
        for day in range(1, duration_days + 1):
            # Get day plan from day_1/2/3 or extra_days
            if day <= 3:
                day_plan_dict = getattr(campaign.plan, f"day_{day}").model_dump()
            else:
                day_plan_dict = campaign.plan.extra_days.get(day, {})
                if not day_plan_dict:
                    continue  # Skip if no plan for this day
                if hasattr(day_plan_dict, 'model_dump'):
                    day_plan_dict = day_plan_dict.model_dump()
            
            content_output = self.content_agent.generate_content(
                day_plan=day_plan_dict,
                creator_context=creator_context_for_content,
                day_number=day,
                duration_days=duration_days,
                content_intensity=campaign.content_intensity
            )
            
            daily_content = DailyContent(
                day=day,
                youtube_script=content_output.youtube_script,
                youtube_title=content_output.title,
                youtube_seo_tags=content_output.seo_tags,
                youtube_cta=content_output.cta
            )
            
            campaign.daily_content[day] = daily_content
            self.gemini_call_count += 1
        
        return campaign
    
    def approve_and_execute_campaign(self, campaign: Campaign) -> Campaign:
        """
        After user approval, execute content generation phase.
        
        Gemini calls:
        - Content Agent (N calls, one per day where N = duration_days)
        Total: N calls
        
        Combined with planning: 5 + N calls total
        """
        if not campaign.plan:
            raise ValueError("Campaign plan not found. Run planning phase first.")
        
        if not campaign.plan_approved:
            raise ValueError("Campaign plan not approved by user.")
        
        campaign.status = CampaignStatus.APPROVED
        campaign.start_date = datetime.utcnow()
        # Use duration_days from campaign goal
        duration_days = campaign.goal.duration_days if hasattr(campaign.goal, 'duration_days') else 3
        campaign.end_date = campaign.start_date + timedelta(days=duration_days)
        
        # Get creator context (should be stored)
        creator_context = campaign.strategy_output or {}
        
        # Generate content for each day (N calls)
        from ..models.campaign import DailyContent
        
        for day in range(1, duration_days + 1):
            # Get day plan from day_1/2/3 or extra_days
            if day <= 3:
                day_plan_dict = getattr(campaign.plan, f"day_{day}").model_dump()
            else:
                day_plan_dict = campaign.plan.extra_days.get(day, {})
                if not day_plan_dict:
                    continue  # Skip if no plan for this day
                if hasattr(day_plan_dict, 'model_dump'):
                    day_plan_dict = day_plan_dict.model_dump()
            
            content_output = self.content_agent.generate_content(
                day_plan=day_plan_dict,
                creator_context=creator_context,
                day_number=day,
                duration_days=duration_days,
                content_intensity=campaign.content_intensity
            )
            
            daily_content = DailyContent(
                day=day,
                youtube_script=content_output.youtube_script,
                youtube_title=content_output.title,
                youtube_seo_tags=content_output.seo_tags,
                youtube_cta=content_output.cta
            )
            
            campaign.daily_content[day] = daily_content
            self.gemini_call_count += 1
        
        campaign.status = CampaignStatus.IN_PROGRESS
        return campaign
    
    def analyze_campaign_outcome(
        self,
        campaign: Campaign,
        actual_metrics: Dict[str, Any]
    ) -> Campaign:
        """
        Analyze campaign outcome after completion.
        
        Gemini calls:
        - Outcome Agent (1 call)
        Total: 1 call
        
        Combined total: 5 + N calls per campaign (where N = duration_days)
        """
        if campaign.status != CampaignStatus.IN_PROGRESS:
            raise ValueError("Campaign must be in progress to analyze outcome.")
        
        # Convert daily_execution to dict for prompt
        daily_execution_dict = {
            day: execution.model_dump()
            for day, execution in campaign.daily_execution.items()
        }
        
        outcome = self.outcome_agent.analyze_outcome(
            campaign.goal.model_dump(),
            actual_metrics,
            campaign.plan.model_dump() if campaign.plan else {},
            daily_execution_dict
        )
        
        self.gemini_call_count += 1
        
        from ..models.campaign import CampaignReport
        campaign.report = CampaignReport(
            goal_vs_result=outcome.goal_vs_result,
            what_worked=outcome.what_worked,
            what_failed=outcome.what_failed,
            next_campaign_suggestions=outcome.next_campaign_suggestions,
            actual_metrics=actual_metrics,
        )
        
        campaign.status = CampaignStatus.COMPLETED
        self.gemini_call_count += 1
        
        return campaign
    
    def reset_call_count(self):
        """Reset Gemini call counter (for new campaign)."""
        self.gemini_call_count = 0

