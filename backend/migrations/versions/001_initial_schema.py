"""Initial schema: 8 tables with updated structure

Revision ID: 001_initial
Revises: 
Create Date: 2026-02-06

Changes from original plan:
- competitor_accounts: Changed to JSONB dict for platform-specific accounts
- Removed: past_attempts column
- Removed: plan_approved column (use started_at timestamp instead)
- thumbnail_url renamed to thumbnail_urls (JSONB dict for platform-specific images)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### Create users table ###
    op.create_table('users',
    sa.Column('user_id', sa.String(length=255), nullable=False, comment='User ID (JWT: generated, Clerk: from webhook)'),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('user_id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # ### Create creator_profiles table ###
    op.create_table('creator_profiles',
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('user_name', sa.String(length=255), nullable=False, comment='Display name'),
    sa.Column('creator_type', sa.String(length=50), nullable=False, comment='content_creator, student, marketing, business, freelancer'),
    sa.Column('niche', sa.Text(), nullable=False, comment='Category/niche (e.g., Tech education)'),
    sa.Column('target_audience_niche', sa.Text(), nullable=False, comment='Target audience interests'),
    sa.Column('unique_angle', sa.Text(), nullable=True, comment='What makes creator different'),
    sa.Column('self_purpose', sa.Text(), nullable=True, comment='Content purpose'),
    sa.Column('self_strengths', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of strings'),
    sa.Column('existing_platforms', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of strings'),
    sa.Column('target_platforms', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of strings'),
    sa.Column('self_topics', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of strings'),
    sa.Column('target_audience_demographics', sa.Text(), nullable=True, comment='Demographics description'),
    sa.Column('competitor_accounts', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Platform-specific accounts: {youtube: [handles], twitter: [handles], instagram: [handles]}'),
    sa.Column('existing_assets', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of strings'),
    sa.Column('self_motivation', sa.Text(), nullable=True, comment='Motivation for creating'),
    sa.Column('recommended_frequency', sa.String(length=50), nullable=True, comment='Agent-calculated frequency'),
    sa.Column('agent_context', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Context Analyzer output'),
    sa.Column('phase2_completed', sa.Boolean(), nullable=True, comment='Track Phase 2 completion'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id')
    )
    
    # ### Create subscriptions table ###
    op.create_table('subscriptions',
    sa.Column('subscription_id', sa.String(length=255), nullable=False, comment='UUID'),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('plan_tier', sa.String(length=50), nullable=False, comment='free, pro'),
    sa.Column('status', sa.String(length=50), nullable=False, comment='active, cancelled, expired'),
    sa.Column('billing_cycle', sa.String(length=50), nullable=True, comment='monthly, yearly'),
    sa.Column('current_period_start', sa.Date(), nullable=True, comment='Current billing period start'),
    sa.Column('current_period_end', sa.Date(), nullable=True, comment='Current billing period end (plan expires)'),
    sa.Column('expiry_warning_7d_sent', sa.Boolean(), nullable=True, comment='7-day warning sent'),
    sa.Column('expiry_warning_3d_sent', sa.Boolean(), nullable=True, comment='3-day warning sent'),
    sa.Column('expiry_warning_1d_sent', sa.Boolean(), nullable=True, comment='1-day warning sent'),
    sa.Column('last_warning_sent_at', sa.DateTime(timezone=True), nullable=True, comment='Last warning timestamp'),
    sa.Column('auto_renew_enabled', sa.Boolean(), nullable=True, comment='Auto-renew subscription'),
    sa.Column('cancellation_scheduled', sa.Boolean(), nullable=True, comment='User scheduled cancellation at period end'),
    sa.Column('stripe_customer_id', sa.String(length=255), nullable=True),
    sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True),
    sa.Column('next_billing_date', sa.Date(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('subscription_id')
    )
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=True)
    op.create_index(op.f('ix_subscriptions_stripe_customer_id'), 'subscriptions', ['stripe_customer_id'], unique=True)
    op.create_index(op.f('ix_subscriptions_stripe_subscription_id'), 'subscriptions', ['stripe_subscription_id'], unique=True)
    
    # ### Create usage_metrics table ###
    op.create_table('usage_metrics',
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('campaigns_created', sa.Integer(), nullable=False, comment='Campaigns created this month'),
    sa.Column('campaigns_limit', sa.Integer(), nullable=False, comment='Monthly campaign limit (-1 = unlimited)'),
    sa.Column('image_credits_base', sa.Integer(), nullable=False, comment='Monthly base credits (resets)'),
    sa.Column('image_credits_topup', sa.Integer(), nullable=False, comment='Purchased credits (never expire)'),
    sa.Column('image_credits_used_this_month', sa.Integer(), nullable=False, comment='Credits consumed this billing cycle'),
    sa.Column('last_reset_at', sa.DateTime(timezone=True), nullable=False, comment='Last monthly reset timestamp'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id')
    )
    
    # ### Create campaigns table ###
    op.create_table('campaigns',
    sa.Column('campaign_id', sa.String(length=255), nullable=False, comment='UUID'),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('onboarding_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='CampaignOnboarding model'),
    sa.Column('status', sa.String(length=50), nullable=False, comment='Enum: onboarding_incomplete, ready_to_start, in_progress, completed, failed, archived_plan_expired'),
    sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True, comment='When campaign was archived'),
    sa.Column('archived_reason', sa.String(length=100), nullable=True, comment='plan_expired, user_deleted, abuse'),
    sa.Column('profile_snapshot', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='CreatorProfile snapshot at creation'),
    sa.Column('learning_insights', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Insights from past campaigns'),
    sa.Column('learning_approved', sa.Boolean(), nullable=True, comment='User approved lessons'),
    sa.Column('strategy_output', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Strategy Agent response'),
    sa.Column('forensics_output', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Forensics Agent response'),
    sa.Column('campaign_plan', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='CampaignPlan model'),
    sa.Column('content_warnings', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Realism assessment warnings'),
    sa.Column('outcome_report', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='CampaignReport model'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('onboarding_completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('started_at', sa.DateTime(timezone=True), nullable=True, comment='Campaign launch timestamp - NULL = not launched, NOT NULL = user initiated campaign'),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('campaign_id')
    )
    op.create_index(op.f('ix_campaigns_user_id'), 'campaigns', ['user_id'], unique=False)
    
    # ### Create daily_content table ###
    op.create_table('daily_content',
    sa.Column('content_id', sa.String(length=255), nullable=False, comment='UUID'),
    sa.Column('campaign_id', sa.String(length=255), nullable=False),
    sa.Column('day_number', sa.Integer(), nullable=False),
    sa.Column('platform', sa.String(length=50), nullable=False, comment='youtube, twitter, linkedin, instagram, tiktok'),
    sa.Column('video_script', sa.Text(), nullable=True, comment='Video script'),
    sa.Column('video_title', sa.String(length=500), nullable=True, comment='Video title'),
    sa.Column('seo_tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of SEO tags'),
    sa.Column('call_to_action', sa.Text(), nullable=True, comment='Call to action'),
    sa.Column('tweet_text', sa.String(length=280), nullable=True, comment='Single tweet'),
    sa.Column('thread_tweets', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of tweets'),
    sa.Column('thumbnail_urls', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Platform-specific image URLs: {youtube: url, twitter: url, instagram: url}'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint('day_number >= 1 AND day_number <= 30', name='check_day_number_range'),
    sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.campaign_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('content_id'),
    sa.UniqueConstraint('campaign_id', 'day_number', 'platform', name='unique_content_per_day_platform')
    )
    op.create_index(op.f('ix_daily_content_campaign_id'), 'daily_content', ['campaign_id'], unique=False)
    
    # ### Create daily_execution table ###
    op.create_table('daily_execution',
    sa.Column('execution_id', sa.String(length=255), nullable=False, comment='UUID'),
    sa.Column('campaign_id', sa.String(length=255), nullable=False),
    sa.Column('day_number', sa.Integer(), nullable=False),
    sa.Column('platform', sa.String(length=50), nullable=False, comment='youtube, twitter, linkedin, instagram, tiktok'),
    sa.Column('posted_to_youtube', sa.Boolean(), nullable=True, comment='YouTube posted'),
    sa.Column('posted_to_twitter', sa.Boolean(), nullable=True, comment='Twitter posted'),
    sa.Column('executed_at', sa.DateTime(timezone=True), nullable=True, comment='Confirmation timestamp'),
    sa.Column('actual_platform_post_id', sa.String(length=255), nullable=True, comment='Platform post ID'),
    sa.Column('engagement_metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Views, likes, comments, shares'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.campaign_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('execution_id'),
    sa.UniqueConstraint('campaign_id', 'day_number', 'platform', name='unique_execution_per_day_platform')
    )
    op.create_index(op.f('ix_daily_execution_campaign_id'), 'daily_execution', ['campaign_id'], unique=False)
    
    # ### Create learning_memories table ###
    op.create_table('learning_memories',
    sa.Column('memory_id', sa.String(length=255), nullable=False, comment='UUID'),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('campaign_id', sa.String(length=255), nullable=False),
    sa.Column('goal_type', sa.String(length=50), nullable=False, comment='growth, engagement, monetization, launch'),
    sa.Column('platform', sa.String(length=50), nullable=False, comment='YouTube, Twitter, Instagram, TikTok'),
    sa.Column('niche', sa.String(length=255), nullable=False, comment='Content niche'),
    sa.Column('campaign_duration_days', sa.Integer(), nullable=False, comment='Campaign length'),
    sa.Column('posting_frequency', sa.String(length=50), nullable=False, comment='light, moderate, intense'),
    sa.Column('what_worked', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of successful strategies'),
    sa.Column('what_failed', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Array of unsuccessful attempts'),
    sa.Column('recommendations', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Recommendations'),
    sa.Column('goal_achievement_summary', sa.Text(), nullable=True, comment='Goal achievement summary'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.campaign_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('memory_id')
    )
    op.create_index(op.f('ix_learning_memories_user_id'), 'learning_memories', ['user_id'], unique=False)
    op.create_index(op.f('ix_learning_memories_goal_type'), 'learning_memories', ['goal_type'], unique=False)
    op.create_index(op.f('ix_learning_memories_platform'), 'learning_memories', ['platform'], unique=False)
    op.create_index(op.f('ix_learning_memories_niche'), 'learning_memories', ['niche'], unique=False)
    
    # ### Create plan_features table ###
    op.create_table('plan_features',
    sa.Column('plan_tier', sa.String(length=50), nullable=False, comment='free, pro'),
    sa.Column('plan_display_name', sa.String(length=100), nullable=False, comment='Starter, Creator'),
    sa.Column('plan_price_monthly_usd', sa.Integer(), nullable=False, comment='Price in cents (2900 = $29.00)'),
    sa.Column('plan_description', sa.String(length=500), nullable=True, comment='Short marketing description'),
    sa.Column('max_campaigns_per_month', sa.Integer(), nullable=False, comment='Monthly campaign quota (-1 = unlimited)'),
    sa.Column('min_campaign_duration_days', sa.Integer(), nullable=False, comment='Minimum days per campaign'),
    sa.Column('max_campaign_duration_days', sa.Integer(), nullable=False, comment='Maximum days per campaign'),
    sa.Column('max_platforms_per_campaign', sa.Integer(), nullable=False, comment='Max platforms per campaign (1-4)'),
    sa.Column('max_competitors_per_campaign', sa.Integer(), nullable=False, comment='Max competitors for forensics'),
    sa.Column('max_concurrent_campaigns', sa.Integer(), nullable=False, comment='Max campaigns running simultaneously'),
    sa.Column('max_workspaces', sa.Integer(), nullable=False, comment='Max workspaces'),
    sa.Column('max_dna_profiles', sa.Integer(), nullable=False, comment='Max My DNA profiles'),
    sa.Column('forensics_enabled', sa.Boolean(), nullable=False, comment='Enable Forensics Agent'),
    sa.Column('image_generation_enabled', sa.Boolean(), nullable=False, comment='Enable AI image generation'),
    sa.Column('seo_optimization_enabled', sa.Boolean(), nullable=False, comment='Enable SEO optimization'),
    sa.Column('analytics_enabled', sa.Boolean(), nullable=False, comment='Access analytics dashboard'),
    sa.Column('export_enhanced', sa.Boolean(), nullable=False, comment='Enhanced export: bulk, PDF'),
    sa.Column('priority_support', sa.Boolean(), nullable=False, comment='Priority email support'),
    sa.Column('image_credits_per_month', sa.Integer(), nullable=False, comment='Monthly base credits'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('plan_tier')
    )
    
    # ### Create credit_topups table ###
    op.create_table('credit_topups',
    sa.Column('topup_id', sa.String(length=255), nullable=False, comment='UUID'),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('credits_purchased', sa.Integer(), nullable=False, comment='Number of credits purchased'),
    sa.Column('amount_usd_cents', sa.Integer(), nullable=False, comment='Price paid in cents (100 = $1.00)'),
    sa.Column('stripe_payment_intent_id', sa.String(length=255), nullable=True, comment='Stripe payment intent ID'),
    sa.Column('purchased_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('topup_id')
    )
    op.create_index(op.f('ix_credit_topups_user_id'), 'credit_topups', ['user_id'], unique=False)
    op.create_index(op.f('ix_credit_topups_stripe_payment_intent_id'), 'credit_topups', ['stripe_payment_intent_id'], unique=True)
    
    # ### End Alembic commands ###


def downgrade() -> None:
    # ### Drop all tables in reverse order ###
    op.drop_index(op.f('ix_credit_topups_stripe_payment_intent_id'), table_name='credit_topups')
    op.drop_index(op.f('ix_credit_topups_user_id'), table_name='credit_topups')
    op.drop_table('credit_topups')
    
    op.drop_table('plan_features')
    
    op.drop_index(op.f('ix_learning_memories_niche'), table_name='learning_memories')
    op.drop_index(op.f('ix_learning_memories_platform'), table_name='learning_memories')
    op.drop_index(op.f('ix_learning_memories_goal_type'), table_name='learning_memories')
    op.drop_index(op.f('ix_learning_memories_user_id'), table_name='learning_memories')
    op.drop_table('learning_memories')
    
    op.drop_index(op.f('ix_daily_execution_campaign_id'), table_name='daily_execution')
    op.drop_table('daily_execution')
    
    op.drop_index(op.f('ix_daily_content_campaign_id'), table_name='daily_content')
    op.drop_table('daily_content')
    
    op.drop_index(op.f('ix_campaigns_user_id'), table_name='campaigns')
    op.drop_table('campaigns')
    
    op.drop_table('usage_metrics')
    
    op.drop_index(op.f('ix_subscriptions_stripe_subscription_id'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_stripe_customer_id'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_user_id'), table_name='subscriptions')
    op.drop_table('subscriptions')
    
    op.drop_table('creator_profiles')
    
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # ### End Alembic commands ###
