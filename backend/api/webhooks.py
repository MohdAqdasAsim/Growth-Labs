"""Webhook endpoints for third-party integrations."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
import uuid
import logging
from svix.webhooks import Webhook, WebhookVerificationError

from ..models.db.user import UserDB
from ..models.db.subscription import SubscriptionDB, UsageMetricDB
from ..models.db.webhook import WebhookEventDB
from ..database.session import get_db
from ..config import CLERK_WEBHOOK_SECRET

router = APIRouter(prefix="/api", tags=["webhooks"])
logger = logging.getLogger(__name__)


@router.post("/webhooks", status_code=status.HTTP_200_OK)
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Webhook endpoint for Clerk user events (standard Clerk path: /api/webhooks).

    Handles: user.created, user.updated, user.deleted
    Configure in Clerk Dashboard → Webhooks → Add Endpoint

    Verifies Svix signatures for security and tracks events for idempotency.
    """
    # Get Svix headers
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not all([svix_id, svix_timestamp, svix_signature]):
        logger.warning("Missing Svix headers in webhook request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing webhook headers"
        )

    # Get raw payload
    payload = await request.body()

    # Verify webhook signature using Svix
    try:
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        # Type narrowing: we already checked all values are not None
        headers = {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }
        event = wh.verify(payload, headers)  # type: ignore[arg-type]
    except WebhookVerificationError as e:
        logger.error(f"Webhook verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )

    # Parse verified event
    event_type = event.get("type")
    data = event.get("data", {})
    event_id = svix_id  # Use Svix header as event ID (Clerk payloads don't have a top-level id)

    logger.info(f"Received Clerk webhook: {event_type}, user_id: {data.get('id')}, event_id: {event_id}")

    # Check if webhook already processed (idempotency)
    result = await db.execute(
        select(WebhookEventDB).where(WebhookEventDB.event_id == event_id)
    )
    if result.scalar_one_or_none():
        logger.info(f"Webhook {event_id} already processed, skipping")
        return {"status": "duplicate_skipped"}

    # Check for duplicate events within 5-minute window
    # (Protects against Clerk sending same event with different svix-ids)
    five_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
    recent_event_result = await db.execute(
        select(WebhookEventDB).where(
            WebhookEventDB.clerk_user_id == data.get("id"),
            WebhookEventDB.event_type == event_type,
            WebhookEventDB.processed_at >= five_minutes_ago
        )
    )
    if recent_event_result.scalar_one_or_none():
        logger.warning(
            f"Webhook {event_id} for {event_type} on user {data.get('id')} "
            f"already processed recently (within 5 min), skipping to prevent duplicate"
        )
        return {"status": "duplicate_recent_skipped"}

    # Create webhook event record for idempotency tracking
    webhook_event = WebhookEventDB(
        event_id=event_id,
        event_type=event_type,
        clerk_user_id=data.get("id"),
        event_data=event
    )
    db.add(webhook_event)

    if event_type == "user.created":
        # Create new user in database
        clerk_user_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        email = email_addresses[0].get("email_address") if email_addresses else None

        logger.info(f"Processing user.created: clerk_user_id={clerk_user_id}, email={email}")

        if not clerk_user_id or not email:
            logger.error(f"Missing required user data. clerk_user_id={clerk_user_id}, email={email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required user data"
            )

        # Check if user already exists by clerk_user_id OR email
        result = await db.execute(
            select(UserDB).where(
                (UserDB.clerk_user_id == clerk_user_id) | (UserDB.email == email)
            )
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            logger.info(f"User with clerk_user_id={clerk_user_id} or email={email} already exists")
            # Update existing user with new clerk_user_id if it changed
            if existing_user.clerk_user_id != clerk_user_id:
                logger.info(f"Updating clerk_user_id from {existing_user.clerk_user_id} to {clerk_user_id}")
                existing_user.clerk_user_id = clerk_user_id
            # Still commit webhook event to mark as processed
            await db.commit()
        else:
            try:
                # Create user
                user_id = str(uuid.uuid4())
                new_user = UserDB(
                    user_id=user_id,
                    clerk_user_id=clerk_user_id,
                    email=email,
                    last_login_at=datetime.now(timezone.utc)
                )
                db.add(new_user)
                await db.flush()  # Flush user first so it gets ID before adding related records
                logger.info(f"User {clerk_user_id} flushed to DB with user_id={user_id}")

                # Create default subscription (free tier)
                subscription = SubscriptionDB(
                    subscription_id=str(uuid.uuid4()),
                    user_id=user_id,
                    plan_tier="free",
                    status="active",
                    current_period_start=datetime.now(timezone.utc).date(),
                    current_period_end=(datetime.now(timezone.utc).date()),  # Will be set by subscription logic
                    auto_renew_enabled=False
                )
                db.add(subscription)
                logger.info(f"Subscription added for user_id={user_id}")

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
                logger.info(f"Usage metrics added for user_id={user_id}")

                # Commit user creation AND webhook event in same transaction
                await db.commit()
                logger.info(f"Successfully created user {clerk_user_id} via webhook")
            except Exception as e:
                logger.error(f"Error creating user {clerk_user_id}: {str(e)}")
                await db.rollback()
                raise

    elif event_type == "user.updated":
        # Update user email if changed
        clerk_user_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        email = email_addresses[0].get("email_address") if email_addresses else None

        if clerk_user_id:
            result = await db.execute(
                select(UserDB).where(UserDB.clerk_user_id == clerk_user_id)
            )
            user = result.scalar_one_or_none()
            if user and email:
                user.email = email

        # Commit user update AND webhook event in same transaction
        await db.commit()

    elif event_type == "user.deleted":
        # Delete user (CASCADE will handle related records)
        clerk_user_id = data.get("id")
        logger.info(f"Processing user.deleted webhook: clerk_user_id={clerk_user_id}, svix_id={event_id}")

        if clerk_user_id:
            result = await db.execute(
                select(UserDB).where(UserDB.clerk_user_id == clerk_user_id)
            )
            user = result.scalar_one_or_none()
            if user:
                logger.info(f"Deleting user {clerk_user_id} (user_id={user.user_id})")
                await db.delete(user)
            else:
                logger.warning(f"User {clerk_user_id} not found for deletion (already deleted?)")

        # Commit user deletion AND webhook event in same transaction
        await db.commit()
        logger.info(f"Successfully processed user.deleted for {clerk_user_id}")

    return {"status": "success"}
