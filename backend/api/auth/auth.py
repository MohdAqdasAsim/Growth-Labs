"""Authentication API routes - Clerk integration."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated, Optional
import uuid
import os
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import hmac
import hashlib

from ...models.user.user import User
from ...models.db.user import UserDB
from ...models.db.subscription import SubscriptionDB, UsageMetricDB
from ...services.core.clerk_service import clerk_service
from ...database.session import get_db
from ...config import CLERK_WEBHOOK_SECRET

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: AsyncSession = Depends(get_db)
) -> str:
    """
    Dependency to get current user ID from Clerk JWT token.
    
    Verifies Clerk session token and returns internal user_id.
    """
    # ⚠️ TEMPORARY BYPASS FOR TESTING - Remove in production ⚠️
    BYPASS_AUTH = os.getenv("BYPASS_AUTH", "false").lower() == "true"
    if BYPASS_AUTH:
        return "test-user-123"  # Must exist in database
    
    token = credentials.credentials
    
    # Verify Clerk JWT token
    payload = await clerk_service.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Extract Clerk user ID
    user_info = clerk_service.extract_user_info(payload)
    clerk_user_id = user_info.get("clerk_user_id")
    
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Get user from database by clerk_user_id
    result = await db.execute(
        select(UserDB).where(UserDB.clerk_user_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found - please complete signup via webhook"
        )
    
    # Update last_login_at
    user.last_login_at = datetime.utcnow()
    await db.commit()
    
    return user.user_id


@router.post("/webhooks/clerk", status_code=status.HTTP_200_OK)
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Webhook endpoint for Clerk user events.
    
    Handles: user.created, user.updated, user.deleted
    Configure in Clerk Dashboard → Webhooks
    """
    # Verify webhook signature
    signature = request.headers.get("svix-signature", "")
    timestamp = request.headers.get("svix-timestamp", "")
    payload = await request.body()
    
    # Verify signature (Svix format)
    expected_signature = hmac.new(
        CLERK_WEBHOOK_SECRET.encode(),
        f"{timestamp}.{payload.decode()}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature.split(",")[0].split("=")[1], expected_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )
    
    # Parse event
    import json
    event = json.loads(payload)
    event_type = event.get("type")
    data = event.get("data", {})
    
    if event_type == "user.created":
        # Create new user in database
        clerk_user_id = data.get("id")
        email = data.get("email_addresses", [{}])[0].get("email_address")
        
        if not clerk_user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required user data"
            )
        
        # Check if user already exists
        result = await db.execute(
            select(UserDB).where(UserDB.clerk_user_id == clerk_user_id)
        )
        existing_user = result.scalar_one_or_none()
        
        if not existing_user:
            # Create user
            user_id = str(uuid.uuid4())
            new_user = UserDB(
                user_id=user_id,
                clerk_user_id=clerk_user_id,
                email=email
            )
            db.add(new_user)
            
            # Create default subscription (free tier)
            subscription = SubscriptionDB(
                subscription_id=str(uuid.uuid4()),
                user_id=user_id,
                plan_tier="free",
                status="active",
                current_period_start=datetime.utcnow().date(),
                current_period_end=(datetime.utcnow().date()),  # Will be set by subscription logic
                auto_renew_enabled=False
            )
            db.add(subscription)
            
            # Create usage metrics
            usage = UsageMetricDB(
                user_id=user_id,
                campaigns_created=0,
                campaigns_limit=3,  # Free tier limit
                image_credits_base=0,
                image_credits_topup=0,
                image_credits_used_this_month=0,
                last_reset_at=datetime.utcnow()
            )
            db.add(usage)
            
            await db.commit()
    
    elif event_type == "user.updated":
        # Update user email if changed
        clerk_user_id = data.get("id")
        email = data.get("email_addresses", [{}])[0].get("email_address")
        
        if clerk_user_id:
            result = await db.execute(
                select(UserDB).where(UserDB.clerk_user_id == clerk_user_id)
            )
            user = result.scalar_one_or_none()
            if user and email:
                user.email = email
                await db.commit()
    
    elif event_type == "user.deleted":
        # Delete user (CASCADE will handle related records)
        clerk_user_id = data.get("id")
        if clerk_user_id:
            result = await db.execute(
                select(UserDB).where(UserDB.clerk_user_id == clerk_user_id)
            )
            user = result.scalar_one_or_none()
            if user:
                await db.delete(user)
                await db.commit()
    
    return {"status": "success"}


@router.get("/me", response_model=User)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile."""
    result = await db.execute(select(UserDB).where(UserDB.user_id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(
        user_id=user.user_id,
        email=user.email,
        created_at=user.created_at,
        last_login_at=user.last_login_at
    )


@router.post("/logout")
async def logout(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
):
    """Logout by blacklisting the token."""
    token = credentials.credentials
    memory_store.blacklist_token(token)
    return {"message": "Successfully logged out"}

