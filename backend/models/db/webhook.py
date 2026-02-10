"""SQLAlchemy model for webhook event tracking."""
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from ...database.base import Base


class WebhookEventDB(Base):
    """Webhook events table - Track processed Clerk webhooks for idempotency."""
    __tablename__ = "webhook_events"

    event_id = Column(String(255), primary_key=True, comment="Svix event ID")
    event_type = Column(String(100), nullable=False, comment="user.created, user.updated, user.deleted")
    clerk_user_id = Column(String(255), nullable=True, comment="Clerk user ID from event")
    event_data = Column(JSONB, nullable=True, comment="Full webhook payload for debugging")
    processed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
