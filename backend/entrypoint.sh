#!/bin/bash
set -e

# поднимаем переменные из окружения (docker-compose.yml или .env)
: "${DB_HOST:=db}"
: "${DB_PORT:=5432}"
: "${DB_USER:=postgres}"
: "${DB_PASS:=qweasdZXC123}"
: "${DB_NAME:=Npis}"

echo "=== Ждём, пока БД ${DB_HOST}:${DB_PORT} будет доступна ==="
while ! nc -z ${DB_HOST} ${DB_PORT}; do
  echo "  …ждём"
  sleep 1
done

export PGPASSWORD="${DB_PASS}"

echo "=== Прогоняем миграции Alembic ==="
alembic upgrade head

# Теперь проверяем, создала ли миграция таблицу users
EXISTS_USERS=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -tAc \
  "SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='users';")
EXISTS_SCRIPTS=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -tAc \
  "SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='scripts';")

if [ "$EXISTS_USERS" = "1" ] && [ "$EXISTS_SCRIPTS" = "1" ]; then
  echo "=== Таблицы users и scripts существуют, пропускаем create_all() ==="
else
  echo "=== Одна или обе таблицы отсутствуют, создаём через SQLAlchemy ==="
  python - << 'EOF'
import asyncio
from database.db_config import engine, Base
# убедитесь, что импорт вашей модели Users присутствует, чтобы она попала в metadata
import database.users.models
import database.scripts.models   
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
asyncio.run(init_models())
EOF
fi

echo "=== Запускаем приложение ==="
exec "$@"
