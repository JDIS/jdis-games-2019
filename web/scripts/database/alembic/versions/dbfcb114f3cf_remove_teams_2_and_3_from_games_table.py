"""Remove teams 2 and 3 from games table

Revision ID: dbfcb114f3cf
Revises: 603f21a209de
Create Date: 2019-05-28 20:39:45.957370

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dbfcb114f3cf'
down_revision = '603f21a209de'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('games', 'team2')
    op.drop_column('games', 'team3')


def downgrade():
    op.add_column('games', sa.Column('team2', sa.Integer))
    op.add_column('games', sa.Column('team3', sa.Integer))
