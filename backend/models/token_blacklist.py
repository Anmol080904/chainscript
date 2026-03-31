from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

import uuid

from sqlalchemy import DateTime, ForeignKey, Integer, String, func, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base

if TYPE_CHECKING:
    from .users import User


class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    token: Mapped[str] = mapped_column(String(512), unique=True, nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blacklisted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    user: Mapped["User"] = relationship("User", back_populates="blacklisted_tokens")

    def __repr__(self) -> str:
        return f"<TokenBlacklist id={self.id} user_id={self.user_id}>"