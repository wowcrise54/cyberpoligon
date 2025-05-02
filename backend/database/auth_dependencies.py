from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from database.db_config import async_session_maker
from database.users.models import Users
from database.session import get_session
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# Функция для проверки токена и извлечения текущего пользователя
async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    from auth import SECRET_KEY, ALGORITHM  # Импортируем секретный ключ и алгоритм
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    from sqlalchemy.future import select
    stmt = select(Users).where(Users.email == email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user
