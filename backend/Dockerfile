FROM python:3.11.9-slim

WORKDIR /app

# 1) Копируем зависимости и ставим их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Устанавливаем netcat и psql (для ожидания и работы с БД) + Alembic
RUN apt-get update \
 && apt-get install -y --no-install-recommends netcat-openbsd postgresql-client \
 && rm -rf /var/lib/apt/lists/* \
 && pip install --no-cache-dir alembic

# 3) Копируем весь проект (в том числе папку migrations)
COPY . .

# 4) Копируем entrypoint и даём права
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 5) Переменные окружения по-умолчанию
ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASS=qweasdZXC123 \
    DB_NAME=Npis

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
