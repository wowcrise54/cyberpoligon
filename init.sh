#!/bin/sh
set -e

# 1) Стартуем сервер UI
/usr/local/bin/server-wrapper &
SERVER_PID=$!

# 2) Ждём, пока появится ответ на /api/auth/login
until curl --silent --fail http://localhost:3000/api/auth/login; do
  sleep 1
done

# 3) Логинимся и сохраняем cookie
curl -c /tmp/cookiejar -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"auth":"'$SEMAPHORE_ADMIN'","password":"'$SEMAPHORE_ADMIN_PASSWORD'"}'

# 4) Получаем массив токенов одним GET-запросом
TOKENS_JSON=$(curl --silent -b /tmp/cookiejar -X GET http://localhost:3000/api/user/tokens \
                   -H "accept: application/json")

# 5) Берём последний созданный токен (последний элемент массива)
TOKEN=$(echo "$TOKENS_JSON" | jq -r '.[-1].id')
[ -n "$TOKEN" ] || { echo "ERROR: cannot get token" >&2; exit 1; }

# 6) Создаём проект
PROJ_ID=$(curl --silent -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my_project"}' | jq -r '.id')

# 7) Добавляем inventory
INV_ID=$(curl --silent -X POST http://localhost:3000/api/project/$PROJ_ID/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "name":"my_inventory",
        "type":"file",
        "path":"/etc/semaphore/inventory.yml"
      }' | jq -r '.id')

# 8) Регистрируем template
curl --silent -X POST http://localhost:3000/api/project/$PROJ_ID/templates \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "name":"my_template",
           "type":"ansible",
           "inventory_id":'"$INV_ID"',
           "playbook":"site.yml"
         }'

# 9) Держим UI в фоне
wait "$SERVER_PID"
