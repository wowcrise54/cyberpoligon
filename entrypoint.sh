#!/bin/sh
set -e

echo "⌛ Waiting for Postgres at $DB_HOST:$DB_PORT…"
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "…still waiting"
  sleep 1
done

echo "🚀 Running Alembic migrations…"
# python -m alembic init migrations
# cp database/alembic.ini alembic.ini 
python -m alembic -c alembic.ini upgrade head

echo "🎉 Starting FastAPI"
exec uvicorn database.router:app --host 0.0.0.0 --port 8000
