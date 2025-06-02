#!/usr/bin/env bash
set -euo pipefail

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

chmod a+rwx /tmp || echo "⚠ Не смогли сделать /tmp доступным"

# 2) Убедимся, что внутри есть .env, и он тоже открыт
[ -f /tmp/.env ] || touch /tmp/.env
chmod a+rw /tmp/.env || echo "⚠ Не смогли сделать /tmp/.env доступным"

########################################################################
# 0. Запуск UI и получение API-токена
########################################################################
/usr/local/bin/server-wrapper &   # фон, PID 1 остаётся скрипт
UI_PID=$!

pip3 install passlib

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

ENV_FILE=/tmp/.env
TMP_FILE=${ENV_FILE}.tmp

# Удаляем старую строку и пишем все в промежуточный файл
grep -v '^SEMAPHORE_TOKEN=' "$ENV_FILE" > "$TMP_FILE" || true

# Добавляем новую строку
printf 'SEMAPHORE_TOKEN=%s\n' "$TOKEN" >> "$TMP_FILE"

# Перезаписываем оригинал (truncate+write на том же inode)
cat "$TMP_FILE" > "$ENV_FILE"

# Чистим за собой
rm -f "$TMP_FILE"

log "✅ Перезаписан $ENV_FILE новым токеном"


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
