# backend/database/router.py
from sqlalchemy.future import select
from fastapi import APIRouter, HTTPException, Depends, Response, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from passlib.context import CryptContext

from database.session import get_session
from database.users.models import Users
from database.auth import create_access_token
from database.auth_dependencies import get_current_user

router = APIRouter(tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


class UserRegistration(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str


class LoginData(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(user: UserRegistration, session: AsyncSession = Depends(get_session)):
    hashed_password = get_password_hash(user.password)
    new_user = Users(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password
    )
    session.add(new_user)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при регистрации пользователя")
    return {"message": "Пользователь успешно зарегистрирован"}


@router.post("/login")
async def login(login_data: LoginData, session: AsyncSession = Depends(get_session)):
    stmt = select(Users).where(Users.email == login_data.email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None or not pwd_context.verify(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Неверные учетные данные")
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "first_name": user.first_name, "last_name": user.last_name}


@router.get("/protected")
async def protected_route(current_user: Users = Depends(get_current_user)):
    return {"message": f"Доступ разрешён. Привет, {current_user.first_name}!"}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    current_user: Users = Depends(get_current_user),
):
    # 1) вынимаем «сырое» значение токена из заголовка
    auth: str = request.headers.get("Authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=400, detail="No token provided")

    # 2) декодируем exp, чтобы TTLCache не держал токен дольше срока жизни
    claims = decode_token(token)
    exp_ts = claims.get("exp")
    if exp_ts is None:
        raise HTTPException(status_code=400, detail="Malformed token")

    # 3) помещаем в in-memory blacklist
    blacklist_token(token)

    # 4) возвращаем 204 No Content
    return Response(status_code=status.HTTP_204_NO_CONTENT)