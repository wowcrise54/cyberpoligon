FROM python:3.11.9-slim

WORKDIR /app

# 1) Копируем requirements.txt и ставим зависимости Python (кроме ovirtsdk и Ansible)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Устанавливаем системные пакеты, необходимые для ovirtsdk4 и Ansible,
#    а также netcat, psql-клиент и Alembic
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      gcc \
      libxml2-dev \
      libxslt1-dev \
      libssl-dev \
      python3-dev \
      netcat-openbsd \
      postgresql-client \
      libcurl4-gnutls-dev \
      build-essential \
      # ansible и ansible-runner зависят от некоторых утильных пакетов:
      sshpass \
 && rm -rf /var/lib/apt/lists/*

# 3) Устанавливаем через pip:
#    - ovirtsdk4 (версия >= 4.4.0)
#    - ansible и ansible-runner
#    - alembic (для миграций)
RUN pip install --no-cache-dir \
      ovirt-engine-sdk-python \
      ansible>=2.10 \
      ansible-runner \
      alembic

# 4) Ставим коллекцию ovirt.ovirt через ansible-galaxy
RUN ansible-galaxy collection install ovirt.ovirt

# 5) Копируем весь проект (в том числе папку migrations и директорию ansible)
COPY . .

RUN mv /app/terraform/sdk/terraform /usr/local/bin
# 6) Копируем entrypoint и даём права
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 7) Переменные окружения по-умолчанию
ENV DB_HOST=db \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASS=qweasdZXC123 \
    DB_NAME=Npis

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
