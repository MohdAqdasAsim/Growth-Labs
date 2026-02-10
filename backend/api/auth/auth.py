"""Authentication API routes - Clerk integration."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated, Optional
import uuid
import os
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import logging

from ...models.user.user import User
from ...models.db.user import UserDB
from ...models.db.subscription import SubscriptionDB, UsageMetricDB
from ...services.core.clerk_service import clerk_service
from ...database.session import get_db
from ...storage.memory_store import memory_store

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()
logger = logging.getLogger(__name__)


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
        # User doesn't exist yet - webhook hasn't arrived
        # Create user on-the-fly to handle race condition
        logger.warning(f"User {clerk_user_id} not found, creating from JWT (webhook race condition)")

        email = user_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing email"
            )

        # Create user with database lock to prevent duplicates
        try:
            user_id = str(uuid.uuid4())
            new_user = UserDB(
                user_id=user_id,
                clerk_user_id=clerk_user_id,
                email=email,
                last_login_at=datetime.now(timezone.utc)
            )
            db.add(new_user)

            # Create default subscription (same as webhook)
            subscription = SubscriptionDB(
                subscription_id=str(uuid.uuid4()),
                user_id=user_id,
                plan_tier="free",
                status="active",
                current_period_start=datetime.now(timezone.utc).date(),
                current_period_end=datetime.now(timezone.utc).date(),
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
                last_reset_at=datetime.now(timezone.utc)
            )
            db.add(usage)

            await db.commit()
            await db.refresh(new_user)

            user = new_user
            logger.info(f"Created user {user_id} from JWT token")

        except IntegrityError:
            # Duplicate key error - another request created user simultaneously
            await db.rollback()
            result = await db.execute(
                select(UserDB).where(UserDB.clerk_user_id == clerk_user_id)
            )
            user = result.scalar_one_or_none()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user"
                )

    # Update last_login_at
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()
    
    return user.user_id


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

