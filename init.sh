#!/bin/sh
set -e

log() { echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] $*" >&2; }

# 1) Старт UI
log "Запуск UI..."
/usr/local/bin/server-wrapper &
SERVER_PID=$!

# 2) Ждём пока API готов
log "Ожидаем /api/auth/login..."
until curl -sS --fail -o /dev/null http://localhost:3000/api/auth/login; do sleep 1; done

# 3) Логинимся
log "Логинимся..."
curl -sS -c /tmp/cookiejar -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{"auth":"'"$SEMAPHORE_ADMIN"'","password":"'"$SEMAPHORE_ADMIN_PASSWORD"'"}'

# 4) Генерация API-токена
log "Генерация API-токена..."
TOKENS_JSON=$(curl -sS -L -b /tmp/cookiejar -X POST http://localhost:3000/api/user/tokens \
                   -H "Content-Type: application/json" \
                   -H "Accept: application/json")
log "TOKENS_JSON: $TOKENS_JSON"

# 5) Извлечение TOKEN
TOKEN=$(printf '%s' "$TOKENS_JSON" | jq -r 'if type=="array" then .[-1].id else .id end')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  log "ERROR: не удалось получить токен"; exit 1
fi
log "TOKEN: $TOKEN"

# 6) Создаём проект
log "Создание проекта..."
PROJ_ID=$(curl -sS -L -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my_project"}' | jq -r '.id')
log "PROJECT ID: $PROJ_ID"

# 7) Добавляем inventory (правильный путь)
log "Добавление inventory..."
INV_ID=$(curl -sS -L -X POST http://localhost:3000/api/project/"$PROJ_ID"/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my_inventory","type":"file","path":"/etc/semaphore/inventory.yml"}' \
  | jq -r '.id')
log "INVENTORY ID: $INV_ID"

# 8) Регистрируем template
log "Регистрация template..."
curl -sS -L -X POST http://localhost:3000/api/project/"$PROJ_ID"/templates \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"my_template","type":"ansible","inventory_id":'"$INV_ID"',"playbook":"site.yml"}'

log "Инициализация завершена. UI PID=$SERVER_PID"
wait "$SERVER_PID"