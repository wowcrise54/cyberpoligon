"""stub missing revision

Revision ID: 3ee35e61db94
Revises: 
Create Date: 2025-04-28 18:00:00.000000
"""

# --- импорт не обязателен, если вы ничего не делаете в upgrade/downgrade:
# from alembic import op
# import sqlalchemy as sa

# идентификаторы ревизии
revision = '3ee35e61db94'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # эта миграция — просто заглушка, ничего не делает
    pass

def downgrade() -> None:
    pass
