import time
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from cachetools import TTLCache

from database.session import get_session
from database.users.models import Users
from database.auth import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# in-memory blacklist: TTL = срок жизни access токена в секундах
_blacklist = TTLCache(maxsize=10_000, ttl=ACCESS_TOKEN_EXPIRE_MINUTES*60)

def blacklist_token(token: str):
    """
    Положить токен в blacklist на время TTLCache.ttl.
    """
    _blacklist[token] = True

def is_token_blacklisted(token: str) -> bool:
    return token in _blacklist

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session)
) -> Users:
    # 0) проверяем blacklist
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1) стандартная проверка подписи и выдача sub
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise JWTError()
    except JWTError:
        raise credentials_exception

    # 2) достаём пользователя из БД
    stmt = select(Users).where(Users.email == email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user
