#!/bin/sh
set -e

echo "🛠  Creating databases: $POSTGRES_MULTIPLE_DATABASES"

# превращаем CSV-список в пробел-разделённый
for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
  echo "   • $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
      CREATE DATABASE "$db";
EOSQL
done