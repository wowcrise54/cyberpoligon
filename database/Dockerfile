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