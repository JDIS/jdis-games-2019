"""add number of players to game

Revision ID: 603f21a209de
Revises: b7326bc7ed90
Create Date: 2019-03-04 16:51:12.592698

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '603f21a209de'
down_revision = 'b7326bc7ed90'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('games',
                sa.Column('max_players', sa.Integer, server_default='2')
                )
    pass


def downgrade():
    op.drop_column('games', 'max_players')
    pass
