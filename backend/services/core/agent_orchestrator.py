"""Agent orchestrator - Coordinates agent execution flow."""
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ...agents.core.context_analyzer import ContextAnalyzer
from ...agents.core.strategy_agent import StrategyAgent
from ...agents.platform.forensics_agent import ForensicsAgent
from ...agents.core.planner_agent import PlannerAgent
from ...agents.core.content_agent import ContentAgent
from ...agents.core.outcome_agent import OutcomeAgent
from ...models.campaign.campaign import Campaign, CampaignStatus, DailyContent
from ...models.db.campaign import CampaignDB, LearningMemoryDB
from ...models.db.user import CreatorProfileDB


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
    
    async def analyze_previous_campaigns(
        self, 
        user_id: str, 
        db: AsyncSession,
        progress_callback=None
    ) -> Optional[Dict[str, Any]]:
        """
        Analyzes previous completed campaigns and extracts lessons learned.
        Returns insights for next campaign.
        
        Args:
            user_id: User UUID
            db: Database session
            progress_callback: Optional callback for progress updates (progress, message)
        """
        if progress_callback:
            progress_callback(50, "Fetching past campaigns...")
        
        result = await db.execute(
            select(CampaignDB)
            .where(CampaignDB.user_id == user_id)
            .where(CampaignDB.status == "completed")
            .where(CampaignDB.outcome_report.isnot(None))
        )
        completed = result.scalars().all()
        
        if not completed:
            if progress_callback:
                progress_callback(100, "No previous campaigns found")
            return None
        
        # Build analysis prompt
        campaigns_summary = []
        for campaign in completed:
            campaigns_summary.append({
                "name": campaign.onboarding_data.get("name", "Unnamed") if campaign.onboarding_data else "Unnamed",
                "goal": campaign.onboarding_data.get("goal", {}).get("goal_aim", "") if campaign.onboarding_data else "",
                "duration": campaign.onboarding_data.get("goal", {}).get("duration_days", 0) if campaign.onboarding_data else 0,
                "report": campaign.outcome_report or {}
            })
        
        # Return basic structure for now (will be enhanced with Gemini later)
        insights = {
            "total_campaigns": len(completed),
            "last_campaign": completed[-1].campaign_id,
            "successful_patterns": [],
            "failed_patterns": [],
            "recommended_adjustments": []
        }
        
        if progress_callback:
            progress_callback(100, "Analysis complete")
        
        return insights
    
    async def run_campaign_workflow(
        self, 
        campaign_id: str, 
        db: AsyncSession,
        progress_callback=None
    ):
        """
        Executes campaign workflow with agent toggles, learning, image gen, SEO.
        Respects agent_config settings and learns from past campaigns.
        
        Args:
            campaign_id: Campaign UUID
            db: Database session
            progress_callback: Optional callback for progress updates (progress, message)
        """
        result = await db.execute(select(CampaignDB).where(CampaignDB.campaign_id == campaign_id))
        campaign_db = result.scalar_one_or_none()
        
        if not campaign_db:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        # Allow both 'processing' (during execution) and 'in_progress' (legacy/manual execution)
        if campaign_db.status not in ["processing", "in_progress"]:
            raise ValueError(f"Campaign must be in PROCESSING or IN_PROGRESS status to execute, current: {campaign_db.status}")
        
        # Load data
        profile_snapshot = campaign_db.profile_snapshot or {}
        learning = campaign_db.learning_insights if campaign_db.learning_approved else None
        agent_config = campaign_db.onboarding_data.get("agent_config") if campaign_db.onboarding_data else None
        
        # Fetch past learnings from completed campaigns
        past_learnings = []
        if campaign_db.onboarding_data:
            # Get creator profile for niche
            result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == campaign_db.user_id))
            profile = result.scalar_one_or_none()
            niche = profile.niche if profile else None
            
            # Fetch relevant learnings (same goal_type, platform, niche)
            goal_type = campaign_db.onboarding_data.get("goal", {}).get("goal_type")
            platforms = campaign_db.onboarding_data.get("goal", {}).get("platforms", [])
            platform = platforms[0] if platforms else None
            
            query = select(LearningMemoryDB).where(LearningMemoryDB.user_id == campaign_db.user_id)
            
            if goal_type:
                query = query.where(LearningMemoryDB.goal_type == goal_type)
            if platform:
                query = query.where(LearningMemoryDB.platform == platform)
            if niche:
                query = query.where(LearningMemoryDB.niche == niche)
            
            query = query.order_by(LearningMemoryDB.created_at.desc()).limit(3)
            
            result = await db.execute(query)
            learning_records = result.scalars().all()
            
            past_learnings = [
                {
                    "memory_id": lr.memory_id,
                    "goal_type": lr.goal_type,
                    "platform": lr.platform,
                    "what_worked": lr.what_worked or [],
                    "what_failed": lr.what_failed or [],
                    "recommendations": lr.recommendations or []
                }
                for lr in learning_records
            ]
            
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
                onboarding = campaign_db.onboarding_data or {}
                goal = onboarding.get("goal", {})
                
                strategy_output = self.strategy_agent.generate_strategy(
                    goal=goal.get("goal_aim", ""),
                    creator_context=profile_snapshot,
                    duration_days=goal.get("duration_days", 3),
                    goal_type=goal.get("goal_type", "growth"),
                    past_learnings=past_learnings
                )
                
                campaign_db.strategy_output = strategy_output.model_dump()
                self.gemini_call_count += 1
                print("      ✅ Strategy analysis complete")
                
                if progress_callback:
                    progress_callback(33, "Strategy analysis complete")
                
            except Exception as strategy_error:
                print(f"      ❌ Strategy failed: {str(strategy_error)[:100]}")
                campaign_db.strategy_output = {"error": str(strategy_error)[:200]}
            
            # STEP 2: Forensics Agent (if enabled)
            if agent_config and agent_config.get("run_forensics", True):
                print("\n[2/4] 🔍 Executing Forensics Agent...")
                forensics_output = {}
                
                if campaign_db.onboarding_data:
                    onboarding = campaign_db.onboarding_data
                    platforms = onboarding.get("goal", {}).get("platforms", [])
                    competitors_data = onboarding.get("competitors", {})
                    
                    for platform in platforms:
                        # Get competitors for this platform
                        platform_competitors = [
                            cp for cp in competitors_data.get("platforms", [])
                            if cp.get("platform") == platform
                        ]
                        
                        if platform_competitors and platform_competitors[0].get("urls"):
                            print(f"      📊 Analyzing {len(platform_competitors[0]['urls'])} competitors on {platform}...")
                            
                            platform_patterns = []
                            for competitor_url in platform_competitors[0]["urls"]:
                                try:
                                    forensics_result = self.forensics_agent.analyze_competitor(
                                        platform=platform,
                                        competitor_url=competitor_url.get("url") if isinstance(competitor_url, dict) else competitor_url
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
                
                campaign_db.forensics_output = forensics_output
                print("      ✅ Forensics analysis complete")
                
                if progress_callback:
                    progress_callback(50, "Forensics analysis complete")
            else:
                if progress_callback:
                    progress_callback(50, "Forensics skipped")
            
            # STEP 3: Planner Agent (required)
            print("\n[3/4] 📋 Executing Planner Agent...")
            
            try:
                onboarding = campaign_db.onboarding_data or {}
                goal_data = onboarding.get("goal", {})
                
                # Extract forensics by platform
                forensics_yt = None
                forensics_x = None
                if campaign_db.forensics_output:
                    forensics_yt = campaign_db.forensics_output.get("youtube")
                    forensics_x = campaign_db.forensics_output.get("twitter")
                
                # Import goal model for planner
                from ...models.campaign.campaign import CampaignGoal
                goal_obj = CampaignGoal(**goal_data) if goal_data else None
                
                planner_output = self.planner_agent.create_plan(
                    goal=goal_obj,
                    strategy=campaign_db.strategy_output or {},
                    forensics_yt=forensics_yt,
                    forensics_x=forensics_x,
                    content_intensity=goal_data.get("intensity", "moderate"),
                    past_learnings=past_learnings
                )
                
                campaign_db.campaign_plan = planner_output.model_dump()
                self.gemini_call_count += 1
                duration = goal_data.get("duration_days", 3)
                print(f"      ✅ {duration}-day campaign plan created")
                
                if progress_callback:
                    progress_callback(66, f"{duration}-day campaign plan created")
                
            except Exception as planner_error:
                print(f"      ❌ Planner failed: {str(planner_error)[:100]}")
                campaign_db.campaign_plan = {"error": str(planner_error)[:200]}
            
            # Reality check (optional)
            onboarding = campaign_db.onboarding_data or {}
            if onboarding.get("goal", {}).get("duration_days", 3) < 7:
                campaign_db.content_warnings = {
                    "warning": "Short campaign duration may limit results",
                    "recommendation": "Consider extending to 7+ days"
                }
            
            # STEP 4: Content Agent (required)
            duration_days = onboarding.get("goal", {}).get("duration_days", 3)
            print(f"\n[4/4] ✍️  Executing Content Agent ({duration_days} days)...")
            
            # Import DailyContentDB for saving
            from ...models.db.campaign import DailyContentDB
            import uuid
            
            for day in range(1, duration_days + 1):
                print(f"\n      📅 Day {day}/{duration_days}:")
                
                # Prepare day plan (from planner output)
                day_plan = {}
                if campaign_db.campaign_plan:
                    if isinstance(campaign_db.campaign_plan, dict):
                        day_plan = campaign_db.campaign_plan.get(f"day_{day}", {})
                
                # Generate actual content using ContentAgent
                try:
                    content_output = self.content_agent.generate_content(
                        day_plan=day_plan,
                        creator_context=profile_snapshot,
                        day_number=day,
                        duration_days=duration_days,
                        content_intensity=onboarding.get("goal", {}).get("intensity", "moderate"),
                        goal_type=onboarding.get("goal", {}).get("goal_type", "growth")
                    )
                    
                    # Save to DailyContentDB
                    daily_content_db = DailyContentDB(
                        content_id=str(uuid.uuid4()),
                        campaign_id=campaign_id,
                        day_number=day,
                        platform="youtube",  # Default platform
                        video_script=content_output.youtube_script,
                        video_title=content_output.title,
                        seo_tags=content_output.seo_tags or [],
                        call_to_action=content_output.cta,
                        thumbnail_urls={}
                    )
                    
                    db.add(daily_content_db)
                    self.gemini_call_count += 1
                    print(f"         ✓ Content generated")
                    
                    # Image Generation (if enabled)
                    if onboarding.get("image_generation_enabled", True):
                        print(f"         🎨 Generating thumbnail...")
                        try:
                            content_dict = {
                                "youtube_title": content_output.title,
                                "youtube_script": content_output.youtube_script
                            }
                            image_url = await self.generate_image_for_content(content_dict)
                            if image_url:
                                daily_content_db.thumbnail_urls = {"youtube": image_url}
                                print(f"         ✓ Thumbnail generated ({len(image_url)} bytes)")
                            else:
                                print(f"         ⚠️  Thumbnail generation returned None")
                        except Exception as img_error:
                            print(f"         ⚠️  Thumbnail failed: {str(img_error)[:50]}")
                    
                    # SEO Optimization (if enabled)
                    if onboarding.get("seo_optimization_enabled", True):
                        print(f"         🔍 Optimizing SEO...")
                        try:
                            content_dict = {
                                "youtube_title": daily_content_db.video_title,
                                "youtube_seo_tags": daily_content_db.seo_tags
                            }
                            optimized_content = await self.optimize_content_seo(content_dict)
                            if optimized_content and 'youtube_seo_tags' in optimized_content:
                                daily_content_db.seo_tags = optimized_content['youtube_seo_tags']
                            print(f"         ✓ SEO optimized")
                        except Exception as seo_error:
                            print(f"         ⚠️  SEO optimization failed: {str(seo_error)[:50]}")
                    
                except Exception as content_error:
                    print(f"         ❌ Content generation failed: {str(content_error)[:100]}")
                    continue
            
            # Save campaign updates
            campaign_db.updated_at = datetime.now(timezone.utc)
            await db.commit()
            
            # Count generated content
            result = await db.execute(
                select(func.count(DailyContentDB.content_id)).where(DailyContentDB.campaign_id == campaign_id)
            )
            content_count = result.scalar() or 0
            
            print("\n" + "="*60)
            print(f"✅ CAMPAIGN WORKFLOW COMPLETE")
            print(f"📊 Total Gemini API calls: {self.gemini_call_count}")
            print(f"📅 Content generated for {content_count} days")
            print("="*60 + "\n")
            
            if progress_callback:
                progress_callback(100, f"Workflow complete - {content_count} days generated")
            
        except Exception as e:
            print(f"\n❌ Campaign workflow failed: {e}")
            import traceback
            traceback.print_exc()
            campaign_db.status = "failed"
            await db.commit()
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
        campaign.start_date = datetime.now(timezone.utc)
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
        campaign.start_date = datetime.now(timezone.utc)
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
    
    async def analyze_campaign_outcome(
        self,
        campaign: Campaign,
        actual_metrics: Dict[str, Any],
        db: AsyncSession,
        progress_callback=None
    ) -> Campaign:
        """
        Analyze campaign outcome after completion and save learnings.
        
        Gemini calls:
        - Outcome Agent (1 call)
        Total: 1 call
        
        Combined total: 5 + N calls per campaign (where N = duration_days)
        
        Args:
            campaign: Campaign Pydantic model
            actual_metrics: Actual performance metrics
            db: Database session
            progress_callback: Optional callback for progress updates
        """
        # Allow both IN_PROGRESS and GENERATING_REPORT status
        if campaign.status not in [CampaignStatus.IN_PROGRESS, CampaignStatus.GENERATING_REPORT]:
            raise ValueError(f"Campaign must be in progress or generating report to analyze outcome. Current status: {campaign.status}")
        
        if progress_callback:
            progress_callback(50, "Analyzing campaign outcomes...")
        
        # Convert daily_execution to dict for prompt
        daily_execution_dict = {
            day: execution.model_dump()
            for day, execution in campaign.daily_execution.items()
        }
        
        # Extract goal from onboarding_data (Pydantic model)
        goal_dict = campaign.onboarding_data.goal.model_dump() if campaign.onboarding_data and campaign.onboarding_data.goal else {}
        
        outcome = self.outcome_agent.analyze_outcome(
            goal_dict,
            actual_metrics,
            campaign.campaign_plan or {},
            daily_execution_dict
        )
        
        self.gemini_call_count += 1
        
        from ...models.campaign.campaign import CampaignReport
        campaign.outcome_report = CampaignReport(
            goal_vs_result=outcome.goal_vs_result,
            what_worked=outcome.what_worked,
            what_failed=outcome.what_failed,
            next_campaign_suggestions=outcome.next_campaign_suggestions,
            actual_metrics=actual_metrics,
        )
        
        campaign.status = CampaignStatus.COMPLETED
        self.gemini_call_count += 1
        
        if progress_callback:
            progress_callback(100, "Outcome report complete")
        
        # Save learning memory for future campaigns
        await self._save_learning_memory(campaign, outcome, db)
        
        return campaign
    
    async def _save_learning_memory(self, campaign: Campaign, outcome, db: AsyncSession) -> None:
        """Save campaign outcome as learning memory for future campaigns."""
        from ...models.campaign.learning_memory import LearningMemory
        import uuid
        
        if not campaign.onboarding_data:
            return
        
        # Get creator profile for niche
        result = await db.execute(select(CreatorProfileDB).where(CreatorProfileDB.user_id == campaign.user_id))
        profile = result.scalar_one_or_none()
        niche = profile.niche if profile else "Unknown"
        
        # Determine primary platform (Pydantic model)
        platforms = campaign.onboarding_data.goal.platforms if campaign.onboarding_data.goal else []
        platform = platforms[0] if platforms else "Unknown"
        
        goal = campaign.onboarding_data.goal if campaign.onboarding_data else None
        
        # Convert goal_vs_result dict to string (it's a dict in OutcomeAgentOutput)
        goal_summary = ""
        if outcome.goal_vs_result:
            if isinstance(outcome.goal_vs_result, dict):
                goal_summary = json.dumps(outcome.goal_vs_result)
            else:
                goal_summary = str(outcome.goal_vs_result)
        
        # Create learning memory in database
        learning_db = LearningMemoryDB(
            memory_id=str(uuid.uuid4()),
            user_id=campaign.user_id,
            campaign_id=campaign.campaign_id,
            goal_type=goal.goal_type if goal else "growth",
            platform=platform,
            niche=niche,
            campaign_duration_days=goal.duration_days if goal else 3,
            posting_frequency=goal.intensity if goal else "moderate",
            what_worked=outcome.what_worked or [],
            what_failed=outcome.what_failed or [],
            recommendations=outcome.next_campaign_suggestions or [],
            goal_achievement_summary=goal_summary
        )
        
        db.add(learning_db)
        await db.commit()
        print(f"      💡 Learning memory saved: {learning_db.memory_id}")
    
    def reset_call_count(self):
        """Reset Gemini call counter (for new campaign)."""
        self.gemini_call_count = 0

