# --- Этап сборки (build) ---
    FROM node:alpine AS build

    # Устанавливаем зависимости (отдельный слой для кэширования)
    COPY package*.json ./
    RUN npm install
    
    # Копируем исходный код и собираем проект
    COPY . .
    RUN npm run build
    
    # --- Этап запуска (production) ---
    FROM nginx:stable-alpine
    
    # Копируем собранные файлы из предыдущего этапа
    COPY --from=build /dist /usr/share/nginx/html
    
    # Копируем конфиг Nginx (если он есть)
    COPY --from=build nginx.conf /etc/nginx/conf.d/default.conf
    
    # Открываем порт и запускаем Nginx
    EXPOSE 5173
    CMD ["nginx", "-g", "daemon off;"]