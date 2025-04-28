from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from database.db_config import async_session_maker  # Использует настройки из db_config.py :contentReference[oaicite:4]{index=4}&#8203;:contentReference[oaicite:5]{index=5}
from database.users.models import Users  # Модель пользователя из models.py :contentReference[oaicite:6]{index=6}&#8203;:contentReference[oaicite:7]{index=7}
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from database.session import get_session
from database.auth import create_access_token
from database.auth_dependencies import get_current_user
import logging
app = FastAPI()
logger = logging.getLogger("uvicorn.error")
# Настройки CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешенные источники (в реальном проекте лучше указывать конкретные домены)
    allow_credentials=True,
    allow_methods=["*"],  # Разрешенные методы (GET, POST, PUT и т.д.)
    allow_headers=["*"],  # Разрешенные заголовки
)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
# Создаем схему для валидации данных регистрации
class UserRegistration(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str  # В продакшене обязательно добавляйте хэширование пароля!

class LoginData(BaseModel):
    email: str
    password: str

@app.post("/register")
async def register(user: UserRegistration, session: AsyncSession = Depends(get_session)):
    hashed_password = get_password_hash(user.password)
    new_user = Users(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password  # Не забудьте добавить хэширование пароля в реальном проекте!
    )
    session.add(new_user)
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при регистрации пользователя")
    return {"message": "Пользователь успешно зарегистрирован"}

@app.post("/login")
async def login(login_data: LoginData, session: AsyncSession = Depends(get_session)):
    from sqlalchemy.future import select
    stmt = select(Users).where(Users.email == login_data.email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None:
        logger.error(f"Пользователь с email {login_data.email} не найден")
        raise HTTPException(status_code=400, detail="Неверные учетные данные")
        
    if not pwd_context.verify(login_data.password, user.password):
        logger.error(f"Неверный пароль для пользователя {login_data.email}")
        raise HTTPException(status_code=400, detail="Неверные учетные данные")
    
    token = create_access_token(data={"sub": user.email})
    logger.info(f"Авторизация успешна для {login_data.email}")
    return {"access_token": token, "token_type": "bearer"}

@app.get("/protected")
async def protected_route(current_user: Users = Depends(get_current_user)):
    return {"message": f"Доступ разрешён. Привет, {current_user.first_name}!"}


if __name__ == "__main__":
    import asyncio
    from db_config import engine, Base

    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    asyncio.run(init_db())
