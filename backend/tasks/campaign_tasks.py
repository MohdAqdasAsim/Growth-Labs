"""Celery tasks for campaign workflow execution."""
import asyncio
from datetime import datetime
from sqlalchemy import select
from celery import Task
from ..celery_app import celery_app, get_async_session
from ..models.db.campaign import CampaignDB
from ..services.core.agent_orchestrator import AgentOrchestrator


class CallbackTask(Task):
    """Base task class with progress tracking support."""
    
    def update_progress(self, progress: int, message: str):
        """Update task progress and message."""
        self.update_state(
            state="STARTED",
            meta={
                "progress": progress,
                "message": message,
                "current": progress,
                "total": 100
            }
        )


@celery_app.task(bind=True, base=CallbackTask, max_retries=3, default_retry_delay=60)
def run_campaign_workflow_task(self, campaign_id: str):
    """
    Execute complete 6-agent campaign workflow asynchronously.
    
    Progress checkpoints:
    - 0%: Started
    - 16%: Context analysis complete
    - 33%: Strategy complete
    - 50%: Forensics complete
    - 66%: Planner complete
    - 83%: Content generation complete
    - 100%: Workflow complete
    
    Args:
        campaign_id: Campaign UUID
    
    Returns:
        dict with campaign_id and status
    """
    async def run_workflow():
        async with get_async_session() as db:
            try:
                # Update initial progress
                self.update_progress(0, "Starting campaign workflow...")
                
                # Verify campaign exists and is in correct status
                result = await db.execute(
                    select(CampaignDB).where(CampaignDB.campaign_id == campaign_id)
                )
                campaign_db = result.scalar_one_or_none()
                
                if not campaign_db:
                    raise ValueError(f"Campaign {campaign_id} not found")
                
                # Allow processing or processing_failed (for retries)
                if campaign_db.status not in ["processing", "processing_failed"]:
                    raise ValueError(f"Campaign not in valid status for execution: {campaign_db.status}")
                
                # Reset to processing if this is a retry
                if campaign_db.status == "processing_failed":
                    campaign_db.status = "processing"
                    await db.commit()
                    await db.refresh(campaign_db)
                
                # Create orchestrator with progress callback
                orchestrator = AgentOrchestrator()
                
                def progress_callback(progress: int, message: str):
                    """Callback for agent progress updates."""
                    self.update_progress(progress, message)
                
                # Execute workflow with progress tracking
                await orchestrator.run_campaign_workflow(
                    campaign_id=campaign_id,
                    db=db,
                    progress_callback=progress_callback
                )
                
                # Update campaign status to in_progress and clear task_id
                campaign_db.status = "in_progress"
                campaign_db.task_id = None
                campaign_db.updated_at = datetime.utcnow()
                await db.commit()
                
                self.update_progress(100, "Campaign workflow complete")
                
                return {
                    "campaign_id": campaign_id,
                    "status": "in_progress",
                    "message": "Campaign workflow executed successfully"
                }
                
            except Exception as e:
                # Mark campaign as failed
                result = await db.execute(
                    select(CampaignDB).where(CampaignDB.campaign_id == campaign_id)
                )
                campaign_db = result.scalar_one_or_none()
                
                if campaign_db:
                    campaign_db.status = "processing_failed"
                    campaign_db.task_id = None
                    campaign_db.updated_at = datetime.utcnow()
                    # Store error in campaign_plan as temporary location
                    if not campaign_db.campaign_plan:
                        campaign_db.campaign_plan = {}
                    campaign_db.campaign_plan["error"] = str(e)
                    await db.commit()
                
                # Raise exception for Celery retry logic
                raise
    
    # Run async workflow in event loop
    try:
        return asyncio.run(run_workflow())
    except Exception as exc:
        # Retry on failure with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@celery_app.task(bind=True, base=CallbackTask, max_retries=3, default_retry_delay=60)
def analyze_campaign_outcome_task(self, campaign_id: str, actual_metrics: dict):
    """
    Analyze campaign outcome and generate report asynchronously.
    
    Progress checkpoints:
    - 0%: Started
    - 50%: Analyzing outcomes
    - 100%: Report complete
    
    Args:
        campaign_id: Campaign UUID
        actual_metrics: Actual performance metrics from user
    
    Returns:
        dict with outcome report
    """
    async def run_analysis():
        async with get_async_session() as db:
            try:
                # Update initial progress
                self.update_progress(0, "Starting outcome analysis...")
                
                # Load campaign
                result = await db.execute(
                    select(CampaignDB).where(CampaignDB.campaign_id == campaign_id)
                )
                campaign_db = result.scalar_one_or_none()
                
                if not campaign_db:
                    raise ValueError(f"Campaign {campaign_id} not found")
                
                # Allow generating_report or processing_failed (for retries)
                if campaign_db.status not in ["generating_report", "processing_failed"]:
                    raise ValueError(f"Campaign not in valid status for outcome generation: {campaign_db.status}")
                
                # Reset to generating_report if this is a retry
                if campaign_db.status == "processing_failed":
                    campaign_db.status = "generating_report"
                    await db.commit()
                
                # Create orchestrator
                orchestrator = AgentOrchestrator()
                
                def progress_callback(progress: int, message: str):
                    """Callback for progress updates."""
                    self.update_progress(progress, message)
                
                self.update_progress(50, "Analyzing campaign outcomes...")
                
                # Refresh object to load all attributes (avoid lazy-loading in wrong context)
                await db.refresh(campaign_db)
                
                # Convert DB model to Pydantic (simplified for orchestrator)
                from ..models.campaign.campaign import Campaign
                from ..api.campaign.campaigns import _campaign_db_to_pydantic
                
                campaign = await _campaign_db_to_pydantic(db, campaign_db)
                
                # Execute outcome analysis
                campaign = await orchestrator.analyze_campaign_outcome(
                    campaign=campaign,
                    actual_metrics=actual_metrics,
                    db=db,
                    progress_callback=progress_callback
                )
                
                # Update database with outcome
                campaign_db.outcome_report = campaign.outcome_report.model_dump() if campaign.outcome_report else None
                campaign_db.status = "completed"
                campaign_db.completed_at = datetime.utcnow()
                campaign_db.task_id = None
                campaign_db.updated_at = datetime.utcnow()
                await db.commit()
                
                self.update_progress(100, "Outcome report complete")
                
                return {
                    "campaign_id": campaign_id,
                    "status": "completed",
                    "outcome_report": campaign_db.outcome_report
                }
                
            except Exception as e:
                # Rollback the session first to clear any pending transaction state
                await db.rollback()
                
                # Mark campaign as failed
                result = await db.execute(
                    select(CampaignDB).where(CampaignDB.campaign_id == campaign_id)
                )
                campaign_db = result.scalar_one_or_none()
                
                if campaign_db:
                    campaign_db.status = "processing_failed"
                    campaign_db.task_id = None
                    campaign_db.updated_at = datetime.utcnow()
                    await db.commit()
                
                raise
    
    # Run async analysis in event loop
    try:
        return asyncio.run(run_analysis())
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@celery_app.task(bind=True, base=CallbackTask, max_retries=3, default_retry_delay=60)
def analyze_previous_campaigns_task(self, user_id: str, campaign_id: str):
    """
    Analyze previous campaigns for learning insights (future Gemini integration).
    
    Progress checkpoints:
    - 0%: Started
    - 50%: Fetching past campaigns
    - 100%: Analysis complete
    
    Args:
        user_id: User UUID
        campaign_id: Current campaign UUID
    
    Returns:
        dict with learning insights
    """
    async def run_analysis():
        async with get_async_session() as db:
            try:
                # Update initial progress
                self.update_progress(0, "Analyzing previous campaigns...")
                
                # Load current campaign
                result = await db.execute(
                    select(CampaignDB).where(CampaignDB.campaign_id == campaign_id)
                )
                campaign_db = result.scalar_one_or_none()
                
                if not campaign_db:
                    raise ValueError(f"Campaign {campaign_id} not found")
                
                # Create orchestrator
                orchestrator = AgentOrchestrator()
                
                def progress_callback(progress: int, message: str):
                    """Callback for progress updates."""
                    self.update_progress(progress, message)
                
                self.update_progress(50, "Fetching past campaigns...")
                
                # Analyze previous campaigns
                insights = await orchestrator.analyze_previous_campaigns(
                    user_id=user_id,
                    db=db,
                    progress_callback=progress_callback
                )
                
                # Update campaign with insights
                campaign_db.learning_insights = insights
                campaign_db.task_id = None
                campaign_db.updated_at = datetime.utcnow()
                await db.commit()
                
                self.update_progress(100, "Analysis complete")
                
                return {
                    "campaign_id": campaign_id,
                    "user_id": user_id,
                    "insights": insights
                }
                
            except Exception as e:
                # Clear task_id but don't fail onboarding
                result = await db.execute(
                    select(CampaignDB).where(CampaignDB.campaign_id == campaign_id)
                )
                campaign_db = result.scalar_one_or_none()
                
                if campaign_db:
                    campaign_db.task_id = None
                    campaign_db.updated_at = datetime.utcnow()
                    await db.commit()
                
                # Don't retry for this task - not critical
                raise
    
    # Run async analysis in event loop
    return asyncio.run(run_analysis())
