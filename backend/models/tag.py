import uuid
from sqlalchemy import String, ForeignKey, Table, Column,DateTime,text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.database import Base
from datetime import datetime,timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.posts import Post

class Tag(Base):
    __tablename__ = "tags"

    id:         Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name:       Mapped[str]       = mapped_column(String(50), nullable=False, unique=True, index=True)
    created_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    posts: Mapped[list["Post"]] = relationship("Post", secondary="post_tags", back_populates="tags")
