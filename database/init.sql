-- Создаем таблицу users, если её нет
CREATE TABLE IF NOT EXISTS users (
    ID SERIAL PRIMARY KEY,
    EMAIL VARCHAR(255) UNIQUE NOT NULL,
    PASSWORD VARCHAR(255) NOT NULL,
    NAME VARCHAR(100) NOT NULL
);

-- Можно добавить тестовые данные (опционально)
INSERT INTO users (EMAIL, PASSWORD, NAME)
VALUES ('test@example.com', 'hashed_password_123', 'Test User')
ON CONFLICT (EMAIL) DO NOTHING;