"""Fix mutable defaults in creator_profiles table

Revision ID: 005_fix_mutable_defaults
Revises: d63594d2b9b8
Create Date: 2026-02-14 

This migration fixes the anti-pattern of using mutable Python defaults (list, dict)
for JSONB columns. It updates the schema to use proper server_default values and
ensures existing NULL values are converted to empty arrays/objects.

Changes:
- existing_platforms: default=list → server_default='[]'::jsonb
- platform_urls: default=dict → server_default='{}'::jsonb  
- self_strengths: default=list → server_default='[]'::jsonb
- target_platforms: default=list → server_default='[]'::jsonb
- self_topics: default=list → server_default='[]'::jsonb
- competitor_accounts: default=dict → server_default='{}'::jsonb
- existing_assets: default=list → server_default='[]'::jsonb
- agent_context: default=dict → server_default='{}'::jsonb
- phase2_completed: default=False → server_default=false
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '005_fix_mutable_defaults'
down_revision = 'd63594d2b9b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply migration: Fix mutable defaults in creator_profiles."""
    
    # Update existing NULL values to proper defaults before changing schema
    # This ensures data consistency
    op.execute("""
        UPDATE creator_profiles 
        SET existing_platforms = '[]'::jsonb 
        WHERE existing_platforms IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET platform_urls = '{}'::jsonb 
        WHERE platform_urls IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET self_strengths = '[]'::jsonb 
        WHERE self_strengths IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET target_platforms = '[]'::jsonb 
        WHERE target_platforms IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET self_topics = '[]'::jsonb 
        WHERE self_topics IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET competitor_accounts = '{}'::jsonb 
        WHERE competitor_accounts IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET existing_assets = '[]'::jsonb 
        WHERE existing_assets IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET agent_context = '{}'::jsonb 
        WHERE agent_context IS NULL
    """)
    
    op.execute("""
        UPDATE creator_profiles 
        SET phase2_completed = false 
        WHERE phase2_completed IS NULL
    """)
    
    # Now alter columns to be NOT NULL with server defaults
    op.alter_column('creator_profiles', 'existing_platforms',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'[]'::jsonb"))
    
    op.alter_column('creator_profiles', 'platform_urls',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'{}'::jsonb"))
    
    op.alter_column('creator_profiles', 'self_strengths',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'[]'::jsonb"))
    
    op.alter_column('creator_profiles', 'target_platforms',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'[]'::jsonb"))
    
    op.alter_column('creator_profiles', 'self_topics',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'[]'::jsonb"))
    
    op.alter_column('creator_profiles', 'competitor_accounts',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'{}'::jsonb"))
    
    op.alter_column('creator_profiles', 'existing_assets',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'[]'::jsonb"))
    
    op.alter_column('creator_profiles', 'agent_context',
                    existing_type=postgresql.JSONB(),
                    nullable=False,
                    server_default=sa.text("'{}'::jsonb"))
    
    op.alter_column('creator_profiles', 'phase2_completed',
                    existing_type=sa.Boolean(),
                    nullable=False,
                    server_default=sa.text("false"))


def downgrade() -> None:
    """Revert migration: Remove server defaults and allow NULLs."""
    
    # Revert column changes - remove server defaults and allow NULLs
    op.alter_column('creator_profiles', 'existing_platforms',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'platform_urls',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'self_strengths',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'target_platforms',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'self_topics',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'competitor_accounts',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'existing_assets',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'agent_context',
                    existing_type=postgresql.JSONB(),
                    nullable=True,
                    server_default=None)
    
    op.alter_column('creator_profiles', 'phase2_completed',
                    existing_type=sa.Boolean(),
                    nullable=True,
                    server_default=None)
