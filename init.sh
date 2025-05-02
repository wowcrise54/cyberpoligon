#!/usr/bin/env bash
set -euo pipefail

<<<<<<< HEAD
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
=======
########################################################################
# Конфигурация (правьте под себя)
########################################################################
API_BASE="http://localhost:3000/api"
PROJECT_NAME="cyberpoligon"

REPO_NAME="git"
REPO_URL="https://github.com/kasat1k89/cyberpoligon.git"
REPO_BRANCH="m.s.morozov/semaphore"
SSH_KEY_ID=1                      # id ключа в Key Store :contentReference[oaicite:2]{index=2}

INV_NAME="hosts"
INV_PATH="ansible/inventory/inventory.yml"
INV_TYPE="file"

########################################################################
# Утилитарные функции
########################################################################
log() { printf '[%(%F %T)T] %s\n' -1 "$*" >&2; }          # красивый тайм-стамп
die() { log "FATAL: $*"; exit 1; }

# curl с общими флагами
api() {
  curl -sS -L -b /tmp/cookiejar -H "Authorization: Bearer $TOKEN" \
       -H "Accept: application/json" "$@"
}

########################################################################
# 0. Запуск UI и получение API-токена
########################################################################
/usr/local/bin/server-wrapper &   # фон, PID 1 остаётся скрипт
UI_PID=$!

log "Жду готовности UI…"
until curl -sS --fail -o /dev/null "$API_BASE/auth/login"; do sleep 1; done
log "UI готов."

log "Логинимся как $SEMAPHORE_ADMIN…"
curl -sS -c /tmp/cookiejar -X POST "$API_BASE/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"auth\":\"$SEMAPHORE_ADMIN\",\"password\":\"$SEMAPHORE_ADMIN_PASSWORD\"}" \
  | jq '.' >&2

log "Запрашиваем API-токен…"
TOKEN=$(curl -sS -L -b /tmp/cookiejar -X POST "$API_BASE/user/tokens" \
            -H "Content-Type: application/json" \
         | jq -r 'if type=="array" then .[-1].id else .id end')
[ -n "$TOKEN" ] || die "Не смогли получить токен"
log "TOKEN=$TOKEN"

########################################################################
# 1. ensure_project  (idempotent)
########################################################################
ensure_project() {
  local project_json
  project_json=$(api "$API_BASE/projects")              # список всех
  PROJ_ID=$(printf '%s' "$project_json" | jq -r --arg n "$PROJECT_NAME" \
            '.[] | select(.name==$n) | .id')
  if [[ -n "$PROJ_ID" ]]; then
    log "Проект '$PROJECT_NAME' уже существует (id=$PROJ_ID)"  # :contentReference[oaicite:3]{index=3}
    return
  fi

  log "Создаём проект '$PROJECT_NAME'…"
  PROJ_ID=$(api -X POST "$API_BASE/projects" \
                 -H "Content-Type: application/json" \
                 -d "{\"name\":\"$PROJECT_NAME\"}" \
            | jq -r '.id')
  log "Создан проект id=$PROJ_ID"
}

########################################################################
# 2. ensure_repository  (idempotent)
########################################################################
ensure_repository() {
  local repo_json
  repo_json=$(api "$API_BASE/project/$PROJ_ID/repositories")
  REPO_ID=$(printf '%s' "$repo_json" | jq -r --arg n "$REPO_NAME" '.[]|select(.name==$n)|.id')
  if [[ -n "$REPO_ID" ]]; then
    log "Репозиторий '$REPO_NAME' уже существует (id=$REPO_ID)"   # :contentReference[oaicite:4]{index=4}
    return
  fi

  log "Создаём репозиторий '$REPO_NAME'…"
  REPO_ID=$(api -X POST "$API_BASE/project/$PROJ_ID/repositories" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$REPO_NAME\",\"git_url\":\"$REPO_URL\",\"git_branch\":\"$REPO_BRANCH\",\"ssh_key_id\":$SSH_KEY_ID,\"project_id\":$PROJ_ID}" |
  tee /dev/stderr | jq -r '.id')
  log "Создан репозиторий id=$REPO_ID"
}

########################################################################
# 3. ensure_inventory  (idempotent)
########################################################################
ensure_inventory() {
  local inv_json
  inv_json=$(api "$API_BASE/project/$PROJ_ID/inventory")
  INV_ID=$(printf '%s' "$inv_json" | jq -r --arg n "$INV_NAME" '.[]|select(.name==$n)|.id')
  if [[ -n "$INV_ID" ]]; then
    log "Inventory '$INV_NAME' уже существует (id=$INV_ID)"        # :contentReference[oaicite:5]{index=5}
    return
  fi

  log "Создаём inventory '$INV_NAME'…"
  INV_ID=$(api -X POST "$API_BASE/project/$PROJ_ID/inventory" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$INV_NAME\",\"type\":\"$INV_TYPE\",\"inventory\":\"$INV_PATH\",\"ssh_key_id\":$SSH_KEY_ID,\"repository_id\":$REPO_ID,\"project_id\":$PROJ_ID}" |
  tee /dev/stderr | jq -r '.id')
  log "Создан inventory id=$INV_ID"
}

########################################################################
# Запуск функций
########################################################################
ensure_project
ensure_repository
ensure_inventory

log "Инициализация завершена; Semaphore UI работает (PID=$UI_PID)."
# удерживаем контейнер живым
tail -f /dev/null
>>>>>>> 4788b55 (rework init.sh and entrypoint.sh for semaphore)
