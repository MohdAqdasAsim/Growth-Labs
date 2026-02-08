"""Add task_id column to campaigns

Revision ID: 37ffb5f49195
Revises: 003_add_clerk_user_id
Create Date: 2026-02-08 21:02:06.936407

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37ffb5f49195'
down_revision: Union[str, None] = '003_add_clerk_user_id'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add task_id column to campaigns table
    op.add_column('campaigns', sa.Column('task_id', sa.String(255), nullable=True))
    op.create_index('ix_campaigns_task_id', 'campaigns', ['task_id'])


def downgrade() -> None:
    # Remove task_id column from campaigns table
    op.drop_index('ix_campaigns_task_id', 'campaigns')
    op.drop_column('campaigns', 'task_id')
