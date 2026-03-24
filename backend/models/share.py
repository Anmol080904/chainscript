import uuid, secrets
from sqlalchemy import String, ForeignKey, text,DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.database import Base
from datetime import datetime,timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.posts import Post
class Share(Base):
    __tablename__ = "shares"

    id:         Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    post_id:    Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"),
                                                   nullable=False, unique=True, index=True)
    token:      Mapped[str]       = mapped_column(String(64), nullable=False, unique=True,
                                                   default=lambda: secrets.token_urlsafe(32))
    expires_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    post: Mapped["Post"] = relationship("Post", back_populates="share")

    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return datetime.datetime.utcnow() > self.expires_at.replace(tzinfo=None)
