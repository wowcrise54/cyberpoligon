# ── Dockerfile ──
FROM python:3.10-slim

# 1) задаём рабочую директорию
WORKDIR /app

# 2) копируем только файл с зависимостями из backend
COPY backend/requirements.txt ./requirements.txt

# 3) устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# 4) копируем весь код приложения
COPY database/ ./database

# 5) задаём переменные окружения для подключения к БД
ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASS=qweasdZXC123 \
    DB_NAME=Npis

# 6) при старте контейнера сначала прогоняем миграции через Alembic, затем запускаем FastAPI
CMD alembic -c database/alembic.ini upgrade head && \
    uvicorn database.router:app --host 0.0.0.0 --port 8000
