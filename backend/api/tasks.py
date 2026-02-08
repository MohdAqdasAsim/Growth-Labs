"""Task status API for polling Celery task progress."""
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
from celery.result import AsyncResult
from ..celery_app import celery_app

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/{task_id}")
async def get_task_status(task_id: str) -> Dict[str, Any]:
    """
    Get Celery task status and progress.
    
    Frontend should poll this endpoint every 2 seconds while task is running.
    
    Returns:
        {
            "task_id": "abc-123",
            "state": "PENDING|STARTED|SUCCESS|FAILURE|RETRY",
            "progress": 0-100,
            "message": "Context analysis complete",
            "result": {...} if SUCCESS,
            "error": "..." if FAILURE,
            "campaign_id": "uuid",
            "redirect_url": "/campaigns/{id}" if SUCCESS
        }
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "state": task_result.state,
        "progress": 0,
        "message": "",
        "result": None,
        "error": None,
        "campaign_id": None,
        "redirect_url": None
    }
    
    if task_result.state == "PENDING":
        # Task not yet started or doesn't exist
        response["message"] = "Task pending..."
        response["progress"] = 0
        
    elif task_result.state == "STARTED":
        # Task is running - get progress from meta
        info = task_result.info or {}
        response["progress"] = info.get("progress", 0)
        response["message"] = info.get("message", "Processing...")
        
    elif task_result.state == "SUCCESS":
        # Task completed successfully
        result = task_result.result or {}
        response["progress"] = 100
        response["message"] = result.get("message", "Task completed")
        response["result"] = result
        response["campaign_id"] = result.get("campaign_id")
        
        # Provide redirect URL for frontend
        if response["campaign_id"]:
            response["redirect_url"] = f"/campaigns/{response['campaign_id']}"
        
    elif task_result.state == "FAILURE":
        # Task failed
        response["progress"] = 0
        response["message"] = "Task failed"
        response["error"] = str(task_result.info)  # Exception details
        
        # Try to extract campaign_id from exception args if available
        if hasattr(task_result.info, 'args') and task_result.info.args:
            try:
                # Tasks store campaign_id as first arg
                response["campaign_id"] = task_result.info.args[0] if task_result.info.args else None
            except:
                pass
        
    elif task_result.state == "RETRY":
        # Task is retrying after failure
        response["progress"] = 0
        response["message"] = "Retrying after failure..."
        
    else:
        # Unknown state
        response["message"] = f"Unknown state: {task_result.state}"
    
    return response


@router.delete("/{task_id}")
async def cancel_task(task_id: str) -> Dict[str, str]:
    """
    Cancel a running Celery task.
    
    Note: This sends a revoke signal but doesn't guarantee immediate cancellation.
    Long-running operations may complete before receiving the signal.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state in ["PENDING", "STARTED"]:
        # Revoke the task
        task_result.revoke(terminate=True)
        return {
            "message": "Task cancellation requested",
            "task_id": task_id,
            "state": "REVOKED"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel task in state: {task_result.state}"
        )
