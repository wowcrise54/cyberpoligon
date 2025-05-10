#!/bin/bash
set -e

: "${DB_HOST:=db}"
: "${DB_PORT:=5432}"
: "${DB_USER:=postgres}"
: "${DB_PASS:=qweasdZXC123}"
: "${DB_NAME:=Npis}"

echo "=== Waiting for DB ${DB_HOST}:${DB_PORT} ==="
while ! nc -z "${DB_HOST}" "${DB_PORT}"; do
  echo "  …waiting"
  sleep 1
done

export PGPASSWORD="${DB_PASS}"

echo "=== Running Alembic migrations ==="
alembic upgrade head

echo "=== Creating missing tables via SQLAlchemy ==="
python - <<'EOF'
import asyncio
from database.db_config import engine, Base
# импортируем оба ваших модуля с моделями
import database.users.models

async def init_models():
    async with engine.begin() as conn:
        # создаст только недостающие таблицы, существующие трогать не будет
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(init_models())
EOF

echo "=== Creating missing tables via SQLAlchemy ==="
python - <<'EOF'
import asyncio
from database.db_config import engine, Base
# импортируем оба ваших модуля с моделями
import database.scripts.models

async def init_models():
    async with engine.begin() as conn:
        # создаст только недостающие таблицы, существующие трогать не будет
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(init_models())
EOF

echo "=== Seeding roles ==="
python - <<'EOF'
import asyncio
from sqlalchemy import select
from database.db_config import async_session_maker
from database.users.models import Role

async def seed_roles():
    async with async_session_maker() as session:
        result = await session.execute(
            select(Role).filter(Role.name.in_(["student","teacher","admin"]))
        )
        existing = {r.name for r in result.scalars().all()}
        for role_name in ["student","teacher","admin"]:
            if role_name not in existing:
                session.add(Role(name=role_name))
        await session.commit()

asyncio.run(seed_roles())
EOF

echo "=== Ensuring users.role_id → roles.id FK exists ==="
psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" <<'SQL'
-- Добавим колонку и заполним student для старых записей
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER;
UPDATE users
  SET role_id = (SELECT id FROM roles WHERE name='student')
  WHERE role_id IS NULL;
ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- Добавляем constraint в DO-блоке, чтобы не поломаться, если он уже есть
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
     WHERE constraint_name = 'users_role_id_fkey'
       AND table_name = 'users'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_id_fkey
        FOREIGN KEY(role_id) REFERENCES roles(id);
  END IF;
END
$$;
SQL

echo "=== Starting application ==="
exec "$@"
