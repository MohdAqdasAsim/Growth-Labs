"""Seed plan_features with Free and Pro tiers

Revision ID: 002_seed_plan_features
Revises: 001_initial_schema
Create Date: 2026-02-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from datetime import datetime


# revision identifiers, used by Alembic.
revision: str = '002_seed_plan_features'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Seed plan_features table with Free and Pro tier definitions."""
    
    # Define table structure for data operations
    plan_features = table('plan_features',
        column('plan_tier', sa.String),
        column('plan_display_name', sa.String),
        column('plan_price_monthly_usd', sa.Integer),
        column('plan_description', sa.String),
        column('max_campaigns_per_month', sa.Integer),
        column('min_campaign_duration_days', sa.Integer),
        column('max_campaign_duration_days', sa.Integer),
        column('max_platforms_per_campaign', sa.Integer),
        column('max_competitors_per_campaign', sa.Integer),
        column('max_concurrent_campaigns', sa.Integer),
        column('max_workspaces', sa.Integer),
        column('max_dna_profiles', sa.Integer),
        column('forensics_enabled', sa.Boolean),
        column('image_generation_enabled', sa.Boolean),
        column('seo_optimization_enabled', sa.Boolean),
        column('analytics_enabled', sa.Boolean),
        column('export_enhanced', sa.Boolean),
        column('priority_support', sa.Boolean),
        column('image_credits_per_month', sa.Integer),
        column('created_at', sa.DateTime),
        column('updated_at', sa.DateTime),
    )
    
    now = datetime.utcnow()
    
    # Insert Free tier (Starter plan)
    op.bulk_insert(plan_features, [
        {
            'plan_tier': 'free',
            'plan_display_name': 'Starter',
            'plan_price_monthly_usd': 0,  # $0.00
            'plan_description': 'Get started with basic campaign features',
            'max_campaigns_per_month': 3,
            'min_campaign_duration_days': 3,
            'max_campaign_duration_days': 7,
            'max_platforms_per_campaign': 1,  # YouTube OR Twitter (not both)
            'max_competitors_per_campaign': 2,
            'max_concurrent_campaigns': 1,
            'max_workspaces': 1,
            'max_dna_profiles': 1,
            'forensics_enabled': True,
            'image_generation_enabled': False,
            'seo_optimization_enabled': False,
            'analytics_enabled': False,
            'export_enhanced': False,
            'priority_support': False,
            'image_credits_per_month': 0,  # No credits for free tier
            'created_at': now,
            'updated_at': now,
        },
        {
            'plan_tier': 'pro',
            'plan_display_name': 'Creator',
            'plan_price_monthly_usd': 2900,  # $29.00
            'plan_description': 'Full features for serious creators',
            'max_campaigns_per_month': 20,  # High limit (effectively unlimited for most users)
            'min_campaign_duration_days': 3,
            'max_campaign_duration_days': 30,
            'max_platforms_per_campaign': 4,  # YouTube, Twitter, LinkedIn, Instagram
            'max_competitors_per_campaign': 10,
            'max_concurrent_campaigns': 3,
            'max_workspaces': 2,
            'max_dna_profiles': 2,
            'forensics_enabled': True,
            'image_generation_enabled': True,
            'seo_optimization_enabled': True,
            'analytics_enabled': True,
            'export_enhanced': True,
            'priority_support': True,
            'image_credits_per_month': 150,
            'created_at': now,
            'updated_at': now,
        }
    ])


def downgrade() -> None:
    """Remove seeded plan_features data."""
    op.execute("DELETE FROM plan_features WHERE plan_tier IN ('free', 'pro')")
