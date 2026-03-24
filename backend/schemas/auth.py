from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field
import uuid


# ---------------------------------------------------------------------------
# Standard response envelope
# ---------------------------------------------------------------------------


class BaseResponse(BaseModel):
    status: bool = True
    message: str = ""
    data: Optional[Any] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

ex_email="john@example.com"
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["John Doe"])
    email: EmailStr = Field(..., examples=[ex_email])
    password: str = Field(..., min_length=8, examples=["StrongPass@123"])


class UserLogin(BaseModel):
    email: EmailStr = Field(..., examples=[ex_email])
    password: str = Field(..., examples=["StrongPass@123"])


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., examples=["eyJ..."])


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., examples=[ex_email])


class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., examples=[ex_email])
    otp: str = Field(..., min_length=6, max_length=6, examples=["839201"])
    new_password: str = Field(..., min_length=8, examples=["NewPass@456"])


# ---------------------------------------------------------------------------
# Inner data payloads (nested inside envelope `data` field)
# ---------------------------------------------------------------------------


class RegisterData(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    is_active: bool

    model_config = {"from_attributes": True}


class TokenData(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshData(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Envelope response schemas
# ---------------------------------------------------------------------------


class RegisterResponse(BaseResponse):
    message: str = "User registered successfully."
    data: Optional[RegisterData] = None


class TokenResponse(BaseResponse):
    message: str = "Login successful."
    data: Optional[TokenData] = None


class RefreshResponse(BaseResponse):
    message: str = "Token refreshed successfully."
    data: Optional[RefreshData] = None


class LogoutResponse(BaseResponse):
    message: str = "Logged out successfully."


class ForgotPasswordResponse(BaseResponse):
    message: str = "OTP sent to your registered email."


class ResetPasswordResponse(BaseResponse):
    message: str = "Password reset successfully."


class ActivateResponse(BaseResponse):
    message: str = "Account activated successfully."
