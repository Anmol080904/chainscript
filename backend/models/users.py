from sqlalchemy import Enum,String,UUID
from database.database import Base
from sqlalchemy.orm import mapped_column,Mapped
import uuid
from sqlalchemy import Boolean,Integer, String, func,DateTime
from sqlalchemy.orm import Mapped, mapped_column,relationship
from typing import TYPE_CHECKING, List, Optional
from datetime import datetime,timezone
from models.token_blacklist import TokenBlacklist
class User(Base):
    __tablename__="Users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    otp: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    otp_expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    blacklisted_tokens: Mapped[List["TokenBlacklist"]] = relationship(
        "TokenBlacklist", back_populates="user"
    )

def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"