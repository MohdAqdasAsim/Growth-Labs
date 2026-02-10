"""Add webhook_events table

Revision ID: 004_add_webhook_events_table
Revises: 003_add_clerk_user_id
Create Date: 2026-02-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '004_add_webhook_events_table'
down_revision: Union[str, None] = '37ffb5f49195'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add webhook_events table for idempotency tracking."""
    op.create_table(
        'webhook_events',
        sa.Column('event_id', sa.String(255), primary_key=True, comment='Svix event ID'),
        sa.Column('event_type', sa.String(100), nullable=False, comment='user.created, user.updated, user.deleted'),
        sa.Column('clerk_user_id', sa.String(255), nullable=True, comment='Clerk user ID from event'),
        sa.Column('event_data', postgresql.JSONB, nullable=True, comment='Full webhook payload for debugging'),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Create indexes for performance
    op.create_index('idx_webhook_event_id', 'webhook_events', ['event_id'])
    op.create_index('idx_webhook_processed_at', 'webhook_events', ['processed_at'])


def downgrade() -> None:
    """Remove webhook_events table."""
    op.drop_index('idx_webhook_processed_at', table_name='webhook_events')
    op.drop_index('idx_webhook_event_id', table_name='webhook_events')
    op.drop_table('webhook_events')
