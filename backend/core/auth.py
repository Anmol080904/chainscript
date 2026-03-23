import random
import string

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.database import async_get_db
from models import User
from config.config import settings

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__memory_cost=65536,
    argon2__time_cost=3,
    argon2__parallelism=4,
)


def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using Argon2 algorithm.
    Returns the hashed password string to be stored in the database.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored Argon2 hash.
    Returns True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def create_access_token(user_id: int) -> str:
    """
    Creates a signed JWT access token for the given user ID.
    The token includes the user ID, token type ('access'), issued-at time,
    and an expiry based on ACCESS_TOKEN_EXPIRE_MINUTES from settings.
    Returns the encoded JWT string.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_reset_token(user_id: UUID) -> str:
    """
    Creates a signed JWT password-reset token for the given user ID.
    The token includes the user ID, token type ('reset'), issued-at time,
    and an expiry based on RESET_TOKEN_EXPIRE_MINUTES from settings.
    Returns the encoded JWT string.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "type": "reset",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    """
    Creates a signed JWT refresh token for the given user ID.
    Longer-lived than the access token (7 days by default).
    """
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decodes and validates a JWT token using the app's secret key and algorithm.
    Returns the token payload as a dictionary if valid.
    Raises HTTP 401 if the token has expired or is otherwise invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(async_get_db),
):
    """
    FastAPI dependency that resolves the currently authenticated user.
    Decodes the Bearer token, validates its type, extracts the user ID,
    and fetches the corresponding active user from the database.
    Raises HTTP 401 if the token is invalid or the user does not exist,
    and HTTP 403 if the user account is inactive.
    Returns the authenticated User model instance.
    """
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id: Optional[str] = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    result = await db.execute(
        select(User)
        .where(User.id == int(user_id))
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    return user


def generate_otp(length: int = 6) -> str:
    """Generates a plain numeric OTP of the given length."""
    return "".join(random.choices(string.digits, k=length))