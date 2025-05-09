# backend/database/router.py
from sqlalchemy.future import select
from fastapi import APIRouter, HTTPException, Depends, Response, status, Request, Path, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlalchemy.orm import selectinload

from database.session import get_session
from database.users.models import Users, Role
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

@router.get("/users")
async def list_users(
    session: AsyncSession = Depends(get_session),
    _current: Users = Depends(get_current_user),  # только авторизованные
):
    stmt = select(Users).options(selectinload(Users.role))
    result = await session.execute(stmt)
    users = result.scalars().all()
    return [
        {
            "id":         u.id,
            "first_name": u.first_name,
            "last_name":  u.last_name,
            "email":      u.email,
            "role":       u.role.name,
        }
        for u in users
    ]

@router.post("/register")
async def register(user: UserRegistration, session: AsyncSession = Depends(get_session)):
    # 1) Получаем роль student из БД
    result = await session.execute(select(Role).where(Role.name == 'student'))
    student_role = result.scalar_one_or_none()
    if not student_role:
        raise HTTPException(status_code=500, detail="Роль 'student' не найдена")

    # 2) Создаём пользователя с этой ролью
    hashed_password = get_password_hash(user.password)
    new_user = Users(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
        role_id=student_role.id,
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
    # Загружаем сразу и пользователя, и его роль
    stmt = (
        select(Users)
        .options(selectinload(Users.role))
        .where(Users.email == login_data.email)
    )
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Неверные учетные данные")

    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "first_name":   user.first_name,
        "last_name":    user.last_name,
        "email":        user.email,
        # здесь user.role уже загружен благодаря selectinload
        "role":         user.role.name,
    }



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


class RoleOut(BaseModel):
    id: int
    name: str

@router.get("/roles", response_model=list[RoleOut])
async def list_roles(
    session: AsyncSession = Depends(get_session),
    _current: Users = Depends(get_current_user),
):
    """Список всех ролей."""
    result = await session.execute(select(Role))
    roles = result.scalars().all()
    return [{"id": r.id, "name": r.name} for r in roles]


class RoleUpdate(BaseModel):
    role: str  # имя роли, например "teacher"

@router.patch("/users/{user_id}/role", response_model=dict)
async def update_user_role(
    user_id: int = Path(..., description="ID пользователя"),
    body: RoleUpdate = Body(),
    session: AsyncSession = Depends(get_session),
    _current: Users = Depends(get_current_user),
):
    """Меняет роль пользователя на указанную в body.role."""
    # Находим роль
    result = await session.execute(select(Role).where(Role.name == body.role))
    role_obj = result.scalar_one_or_none()
    if role_obj is None:
        raise HTTPException(status_code=404, detail=f"Роль '{body.role}' не найдена")

    # Находим пользователя
    result = await session.execute(select(Users).where(Users.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Сменить роль
    user.role_id = role_obj.id
    session.add(user)
    await session.commit()

    return {"id": user.id, "role": role_obj.name}

class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str

@router.get("/me", response_model=UserOut)
async def read_me(current: Users = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    # хоть у current уже есть role_id, мы подгрузим роль, чтобы name
    await session.refresh(current, attribute_names=["role"])
    return {
        "id": current.id,
        "first_name": current.first_name,
        "last_name": current.last_name,
        "email": current.email,
        "role": current.role.name,
    }