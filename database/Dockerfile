FROM python:3.11.9-slim

WORKDIR /app

# 1) Скопировали зависимости
COPY backend/requirements.txt ./requirements.txt

# 2) Установили netcat и все Python-библиотеки (включая alembic)
RUN apt-get update \
 && apt-get install -y --no-install-recommends netcat-openbsd \
 && rm -rf /var/lib/apt/lists/* \
 && pip install --no-cache-dir -r requirements.txt \
 && pip install --no-cache-dir alembic

# **копируем скрипты миграций**
COPY migrations/ ./migrations

# копируем остальной код
COPY database/ ./database
COPY entrypoint.sh ./

# 4) Переменные окружения для подключения к БД
ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASS=qweasdZXC123 \
    DB_NAME=Npis

# 5) Запускаем наш скрипт
ENTRYPOINT ["./entrypoint.sh"]

# Используем официальный образ PostgreSQL
FROM postgres:latest

# Переменные окружения для подключения к PostgreSQL
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=mydatabase
ENV POSTGRES_PORT=5432

# Внутренний путь хранения данных PostgreSQL
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Скопируем SQL-скрипт для создания таблицы
COPY init.sql /docker-entrypoint-initdb.d/

# Открываем порт PostgreSQL
EXPOSE $POSTGRES_PORT

# Команда для запуска PostgreSQL
CMD ["postgres"]