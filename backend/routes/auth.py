from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
    get_current_user,
    hash_password,
    verify_password,
)
from database.database import get_db
from models.token_blacklist import TokenBlacklist
from models.users import User
from schemas.auth import (
    ActivateResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    RefreshData,
    RefreshRequest,
    RefreshResponse,
    RegisterData,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenData,
    TokenResponse,
    UserLogin,
    UserRegister,
    LogoutResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Returns authenticated User if Bearer token provided, else None.
    """
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalars().first()

        if not user or not user.is_active:
            return None
        await db.refresh(user)
        return user
    except HTTPException:
        return None


def send_otp_email(email: str, otp: str):
    """
    Background task — simulates sending OTP to user email.
    Replace with real SMTP / email service in production.
    """
    print(f"[EMAIL SIMULATION] Sending OTP {otp} to {email}")


@router.post(
    "/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    payload: UserRegister,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):

    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return RegisterResponse(
        status=True,
        message="User registered successfully.",
        data=RegisterData(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            is_active=new_user.is_active,
        ),
        error=None,
    )


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact your administrator.",
        )

    await db.refresh(user)

    return TokenResponse(
        status=True,
        message="Login successful.",
        data=TokenData(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            token_type="bearer",
        ),
        error=None,
    )


@router.post("/refresh", response_model=RefreshResponse, status_code=status.HTTP_200_OK)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    token_data = decode_token(payload.refresh_token)

    if token_data.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. Expected refresh token.",
        )

    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    blacklisted = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.token == payload.refresh_token)
    )
    if blacklisted.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked. Please login again.",
        )

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated."
        )

    return RefreshResponse(
        status=True,
        message="Token refreshed successfully.",
        data=RefreshData(
            access_token=create_access_token(user.id),
            token_type="bearer",
        ),
        error=None,
    )


@router.post("/logout", response_model=LogoutResponse, status_code=status.HTTP_200_OK)
async def logout(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()

    already = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.token == token)
    )
    if not already.scalar_one_or_none():
        db.add(TokenBlacklist(token=token, user_id=current_user.id))
        await db.commit()

    return LogoutResponse(
        status=True,
        message="Logged out successfully.",
        data=None,
        error=None,
    )


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user:
        otp = generate_otp()
        user.otp = otp
        user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        await db.commit()
        background_tasks.add_task(send_otp_email, user.email, otp)

    # Always return the same response to avoid email enumeration
    return ForgotPasswordResponse(
        status=True,
        message="OTP sent to your registered email.",
        data=None,
        error=None,
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password using OTP code",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request. Request a new OTP.",
        )

    if user.otp_expires_at is None or datetime.now(timezone.utc) > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one.",
        )

    if payload.otp != user.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    user.password_hash = hash_password(payload.new_password)
    user.otp = None
    user.otp_expires_at = None
    await db.commit()

    return ResetPasswordResponse(
        status=True,
        message="Password reset successfully.",
        data=None,
        error=None,
    )