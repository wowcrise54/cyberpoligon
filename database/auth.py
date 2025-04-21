from datetime import datetime, timedelta
from jose import jwt, JWTError

# Настройки токена
SECRET_KEY = "your_super_secret_key"  # Для продакшена используйте надежный, скрытый ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1

def create_access_token(data: dict) -> str:
    """Создает JWT-токен с заданными данными и временем истечения."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
