"""SQLAlchemy models for subscriptions and usage metrics."""
from sqlalchemy import Column, String, Integer, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from ...database.base import Base


class SubscriptionDB(Base):
    """
    Subscription table - Track user plan tier, billing cycle, Stripe integration.
    
    Note: Not yet implemented in business logic. Tables created for future use.
    """
    __tablename__ = "subscriptions"
    
    # Primary Key
    subscription_id = Column(String(255), primary_key=True, comment="UUID")
    
    # Foreign Key (one subscription per user)
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Plan Information
    plan_tier = Column(String(50), nullable=False, comment="free, pro")
    status = Column(String(50), nullable=False, comment="active, cancelled, expired")
    billing_cycle = Column(String(50), nullable=True, comment="monthly, yearly")
    
    # Billing & Expiry
    current_period_start = Column(Date, nullable=True, comment="Current billing period start")
    current_period_end = Column(Date, nullable=True, comment="Current billing period end (plan expires)")
    
    # Warning System (7-day warnings before expiry)
    expiry_warning_7d_sent = Column(Boolean, default=False, comment="7-day warning sent")
    expiry_warning_3d_sent = Column(Boolean, default=False, comment="3-day warning sent")
    expiry_warning_1d_sent = Column(Boolean, default=False, comment="1-day warning sent")
    last_warning_sent_at = Column(DateTime(timezone=True), nullable=True, comment="Last warning timestamp")
    
    # Auto-renewal
    auto_renew_enabled = Column(Boolean, default=True, comment="Auto-renew subscription")
    cancellation_scheduled = Column(Boolean, default=False, comment="User scheduled cancellation at period end")
    
    # Stripe Integration
    stripe_customer_id = Column(String(255), unique=True, nullable=True)
    stripe_subscription_id = Column(String(255), unique=True, nullable=True)
    next_billing_date = Column(Date, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class UsageMetricDB(Base):
    """
    Usage metrics table - Real-time quota enforcement for campaigns and image credits.
    
    Note: Not yet implemented in business logic. Tables created for future use.
    """
    __tablename__ = "usage_metrics"
    
    # Primary Key (FK to users)
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    
    # Campaign Usage
    campaigns_created = Column(Integer, default=0, nullable=False, comment="Campaigns created this month")
    campaigns_limit = Column(Integer, nullable=False, comment="Monthly campaign limit (-1 = unlimited)")
    
    # Image Credits Tracking
    image_credits_base = Column(Integer, default=0, nullable=False, comment="Monthly base credits (resets each billing cycle)")
    image_credits_topup = Column(Integer, default=0, nullable=False, comment="Purchased credits (never expire)")
    image_credits_used_this_month = Column(Integer, default=0, nullable=False, comment="Credits consumed this billing cycle")
    
    # Reset Tracking
    last_reset_at = Column(DateTime(timezone=True), nullable=False, comment="Last monthly reset timestamp")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class CreditTopupDB(Base):
    """
    Credit top-up purchases - Track user credit purchases for image generation.
    
    Pricing: $1 = 10 credits, $5 = 50 credits, $10 = 100 credits, $25 = 320 credits (20% bonus)
    """
    __tablename__ = "credit_topups"
    
    # Primary Key
    topup_id = Column(String(255), primary_key=True, comment="UUID")
    
    # Foreign Key
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Purchase Details
    credits_purchased = Column(Integer, nullable=False, comment="Number of credits purchased")
    amount_usd_cents = Column(Integer, nullable=False, comment="Price paid in cents (100 = $1.00)")
    
    # Stripe Integration
    stripe_payment_intent_id = Column(String(255), nullable=True, unique=True, comment="Stripe payment intent ID")
    
    # Timestamp
    purchased_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
