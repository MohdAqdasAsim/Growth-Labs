"""Agent orchestrator - Coordinates agent execution flow."""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from ...agents.core.context_analyzer import ContextAnalyzer
from ...agents.core.strategy_agent import StrategyAgent
from ...agents.platform.forensics_agent import ForensicsAgent
from ...agents.core.planner_agent import PlannerAgent
from ...agents.core.content_agent import ContentAgent
from ...agents.core.outcome_agent import OutcomeAgent
from ...models.campaign.campaign import Campaign, CampaignStatus, DailyContent


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
        Respects agent_config settings and learns from past campaigns.
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
        
        # Fetch past learnings from completed campaigns
        past_learnings = []
        if campaign.onboarding:
            # Get creator profile for niche
            profile = memory_store.get_creator_profile(campaign.user_id)
            niche = None
            if profile and profile.creator_identity:
                niche = profile.creator_identity.get('niche')
            
            # Fetch relevant learnings (same goal_type, platform, niche)
            past_learnings = memory_store.get_user_learnings(
                user_id=campaign.user_id,
                goal_type=campaign.onboarding.goal.goal_type,
                platform=campaign.onboarding.goal.platforms[0] if campaign.onboarding.goal.platforms else None,
                niche=niche,
                limit=3  # Get last 3 relevant campaigns
            )
            
            if past_learnings:
                print(f"\n📚 Retrieved {len(past_learnings)} learning(s) from past campaigns")
        
        self.reset_call_count()
        
        try:
            print("\n" + "="*60)
            print("🚀 CAMPAIGN WORKFLOW EXECUTION STARTED")
            print("="*60)
            
            # STEP 1: Strategy Agent (required)
            print("\n[1/4] 🎯 Executing Strategy Agent...")
            
            try:
                strategy_output = self.strategy_agent.generate_strategy(
                    goal=campaign.onboarding.goal.goal_aim if campaign.onboarding else "",
                    creator_context=global_memory,
                    duration_days=campaign.onboarding.goal.duration_days if campaign.onboarding else 3,
                    goal_type=campaign.onboarding.goal.goal_type if campaign.onboarding else "growth",
                    past_learnings=past_learnings
                )
                
                campaign.strategy_output = strategy_output.model_dump()
                self.gemini_call_count += 1
                print("      ✅ Strategy analysis complete")
                
            except Exception as strategy_error:
                print(f"      ❌ Strategy failed: {str(strategy_error)[:100]}")
                campaign.strategy_output = {"error": str(strategy_error)[:200]}
            
            # STEP 2: Forensics Agent (if enabled)
            if agent_config and agent_config.run_forensics:
                print("\n[2/4] 🔍 Executing Forensics Agent...")
                forensics_output = {}
                
                if campaign.onboarding:
                    for platform in campaign.onboarding.goal.platforms:
                        # Get competitors for this platform
                        competitors = [
                            cp for cp in campaign.onboarding.competitors.platforms 
                            if cp.platform == platform
                        ]
                        
                        if competitors and competitors[0].urls:
                            print(f"      📊 Analyzing {len(competitors[0].urls)} competitors on {platform}...")
                            
                            platform_patterns = []
                            for competitor_url in competitors[0].urls:
                                try:
                                    forensics_result = self.forensics_agent.analyze_competitor(
                                        platform=platform,
                                        competitor_url=competitor_url
                                    )
                                    platform_patterns.append(forensics_result.model_dump())
                                    self.gemini_call_count += 1
                                except Exception as forensics_error:
                                    print(f"         ⚠️  Competitor analysis failed: {str(forensics_error)[:80]}")
                                    continue
                            
                            if platform_patterns:
                                forensics_output[platform] = {
                                    "status": "completed",
                                    "patterns": platform_patterns
                                }
                
                campaign.forensics_output = forensics_output
                print("      ✅ Forensics analysis complete")
            
            # STEP 3: Planner Agent (required)
            print("\n[3/4] 📋 Executing Planner Agent...")
            
            try:
                # Extract forensics by platform
                forensics_yt = None
                forensics_x = None
                if campaign.forensics_output:
                    forensics_yt = campaign.forensics_output.get("youtube")
                    forensics_x = campaign.forensics_output.get("twitter")
                
                planner_output = self.planner_agent.create_plan(
                    goal=campaign.onboarding.goal if campaign.onboarding else None,
                    strategy=campaign.strategy_output or {},
                    forensics_yt=forensics_yt,
                    forensics_x=forensics_x,
                    content_intensity=campaign.onboarding.goal.intensity if campaign.onboarding else "moderate",
                    past_learnings=past_learnings
                )
                
                campaign.plan = planner_output.model_dump()
                self.gemini_call_count += 1
                duration = campaign.onboarding.goal.duration_days if campaign.onboarding else 3
                print(f"      ✅ {duration}-day campaign plan created")
                
            except Exception as planner_error:
                print(f"      ❌ Planner failed: {str(planner_error)[:100]}")
                campaign.plan = {"error": str(planner_error)[:200]}
            
            # Reality check (optional)
            if campaign.onboarding and campaign.onboarding.goal.duration_days < 7:
                campaign.reality_warning = {
                    "warning": "Short campaign duration may limit results",
                    "recommendation": "Consider extending to 7+ days"
                }
            
            # STEP 4: Content Agent (required)
            duration_days = campaign.onboarding.goal.duration_days if campaign.onboarding else 3
            print(f"\n[4/4] ✍️  Executing Content Agent ({duration_days} days)...")
            
            for day in range(1, duration_days + 1):
                print(f"\n      📅 Day {day}/{duration_days}:")
                
                # Prepare day plan (from planner output)
                day_plan = {}
                if campaign.plan:
                    if isinstance(campaign.plan, dict):
                        day_plan = campaign.plan.get(f"day_{day}", {})
                    else:
                        # If plan is a Pydantic model
                        day_plan = getattr(campaign.plan, f"day_{day}", {})
                        if hasattr(day_plan, 'model_dump'):
                            day_plan = day_plan.model_dump()
                
                # Generate actual content using ContentAgent
                try:
                    content_output = self.content_agent.generate_content(
                        day_plan=day_plan,
                        creator_context=global_memory,
                        day_number=day,
                        duration_days=duration_days,
                        content_intensity=campaign.onboarding.goal.intensity if campaign.onboarding else "moderate",
                        goal_type=campaign.onboarding.goal.goal_type if campaign.onboarding else "growth"
                    )
                    
                    # Convert ContentAgentOutput to DailyContent Pydantic model
                    daily_content = DailyContent(
                        day=day,
                        youtube_title=content_output.title,
                        youtube_script=content_output.youtube_script,
                        youtube_seo_tags=content_output.seo_tags or [],
                        youtube_cta=content_output.cta
                    )
                    
                    campaign.daily_content[day] = daily_content
                    self.gemini_call_count += 1
                    print(f"         ✓ Content generated")
                    
                except Exception as content_error:
                    print(f"         ❌ Content generation failed: {str(content_error)[:100]}")
                    # Create minimal placeholder on error
                    daily_content = DailyContent(day=day)
                    campaign.daily_content[day] = daily_content
                    continue
                
                # Image Generation (if enabled)
                if campaign.onboarding and campaign.onboarding.image_generation_enabled:
                    print(f"         🎨 Generating thumbnail...")
                    try:
                        # Convert Pydantic model to dict for image service
                        content_dict = daily_content.model_dump()
                        image_url = await self.generate_image_for_content(content_dict)
                        if image_url:
                            daily_content.thumbnail_url = image_url
                            campaign.daily_content[day] = daily_content  # Update with thumbnail
                            print(f"         ✓ Thumbnail generated ({len(image_url)} bytes)")
                        else:
                            print(f"         ⚠️  Thumbnail generation returned None")
                    except Exception as img_error:
                        print(f"         ⚠️  Thumbnail failed: {str(img_error)[:50]}")
                
                # SEO Optimization (if enabled)
                if campaign.onboarding and campaign.onboarding.seo_optimization_enabled:
                    print(f"         🔍 Optimizing SEO...")
                    try:
                        # Convert Pydantic model to dict for SEO service
                        content_dict = daily_content.model_dump()
                        optimized_content = await self.optimize_content_seo(content_dict)
                        if optimized_content and 'youtube_seo_tags' in optimized_content:
                            daily_content.youtube_seo_tags = optimized_content['youtube_seo_tags']
                            campaign.daily_content[day] = daily_content
                        print(f"         ✓ SEO optimized")
                    except Exception as seo_error:
                        print(f"         ⚠️  SEO optimization failed: {str(seo_error)[:50]}")
            
            # Save campaign
            campaign.updated_at = datetime.utcnow()
            memory_store.update_campaign(campaign)
            
            print("\n" + "="*60)
            print(f"✅ CAMPAIGN WORKFLOW COMPLETE")
            print(f"📊 Total Gemini API calls: {self.gemini_call_count}")
            print(f"📅 Content generated for {len(campaign.daily_content)} days")
            images_count = sum(1 for c in campaign.daily_content.values() if isinstance(c, dict) and c.get('thumbnail_url'))
            print(f"🎨 Images generated: {images_count}/{len(campaign.daily_content)}")
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"\n❌ Campaign workflow failed: {e}")
            import traceback
            traceback.print_exc()
            campaign.status = CampaignStatus.FAILED
            memory_store.update_campaign(campaign)
            raise
    
    async def generate_image_for_content(self, content: Dict[str, Any]) -> Optional[str]:
        """Generate thumbnail image for content using ImageService."""
        try:
            from ..ai.image_service import ImageService
            image_service = ImageService()
            
            # Extract title and hook from content (using correct field names)
            title = content.get("youtube_title", "Content thumbnail")
            # Use first 200 chars of script as hook/description
            script = content.get("youtube_script", "")
            hook = script[:200] if script else "YouTube content"
            
            # Generate thumbnail
            image_url = await image_service.generate_thumbnail(title, hook, platform="YouTube")
            return image_url
        except Exception as e:
            print(f"Image generation failed: {e}")
            return None
    
    async def optimize_content_seo(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize content for SEO using SEOService."""
        try:
            from ..ai.seo_service import SEOService
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
        from ...models.campaign.campaign import CampaignPlan, DayPlan, DailyContent
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
        from ...models.campaign.campaign import DailyContent
        
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
        Analyze campaign outcome after completion and save learnings.
        
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
            campaign.onboarding.goal.model_dump() if campaign.onboarding else {},
            actual_metrics,
            campaign.plan.model_dump() if campaign.plan else {},
            daily_execution_dict
        )
        
        self.gemini_call_count += 1
        
        from ...models.campaign.campaign import CampaignReport
        campaign.report = CampaignReport(
            goal_vs_result=outcome.goal_vs_result,
            what_worked=outcome.what_worked,
            what_failed=outcome.what_failed,
            next_campaign_suggestions=outcome.next_campaign_suggestions,
            actual_metrics=actual_metrics,
        )
        
        campaign.status = CampaignStatus.COMPLETED
        self.gemini_call_count += 1
        
        # Save learning memory for future campaigns
        self._save_learning_memory(campaign, outcome)
        
        return campaign
    
    def _save_learning_memory(self, campaign: Campaign, outcome) -> None:
        """Save campaign outcome as learning memory for future campaigns."""
        from ...storage.memory_store import memory_store
        from ...models.campaign import LearningMemory
        import uuid
        
        if not campaign.onboarding:
            return
        
        # Get creator profile for niche
        profile = memory_store.get_creator_profile(campaign.user_id)
        niche = "Unknown"
        if profile and profile.creator_identity:
            niche = profile.creator_identity.get('niche', 'Unknown')
        
        # Determine primary platform
        platform = campaign.onboarding.goal.platforms[0] if campaign.onboarding.goal.platforms else "Unknown"
        
        # Create learning memory
        learning = LearningMemory(
            id=f"lm_{uuid.uuid4().hex[:12]}",
            user_id=campaign.user_id,
            campaign_id=campaign.campaign_id,
            goal_type=campaign.onboarding.goal.goal_type,
            platform=platform,
            niche=niche,
            what_worked=outcome.what_worked,
            what_failed=outcome.what_failed,
            next_campaign_suggestions=outcome.next_campaign_suggestions,
            goal_vs_result=outcome.goal_vs_result,
            duration_days=campaign.onboarding.goal.duration_days,
            intensity=campaign.onboarding.goal.intensity
        )
        
        memory_store.create_learning_memory(learning)
        print(f"      💡 Learning memory saved: {learning.id}")
    
    def reset_call_count(self):
        """Reset Gemini call counter (for new campaign)."""
        self.gemini_call_count = 0

