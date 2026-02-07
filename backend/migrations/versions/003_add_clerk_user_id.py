"""Add clerk_user_id to users table

Revision ID: 003_add_clerk_user_id
Revises: 002_seed_plan_features
Create Date: 2026-02-06 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_add_clerk_user_id'
down_revision: Union[str, None] = '002_seed_plan_features'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add clerk_user_id column to users table."""
    op.add_column('users', sa.Column('clerk_user_id', sa.String(length=255), nullable=True, comment='Clerk user ID from webhook'))
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)


def downgrade() -> None:
    """Remove clerk_user_id column from users table."""
    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_column('users', 'clerk_user_id')
