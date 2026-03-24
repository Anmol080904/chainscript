import uuid
from sqlalchemy import String, Text, DateTime, ForeignKey, Index, text,Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import TSVECTOR
from database.database import Base
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.users import User
    from models.version import Version
    from models.tag import Tag
    from models.share import Share
class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        Index("idx_posts_search", "search_vector", postgresql_using="gin"),
    )

    id:             Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id:        Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),
                                                       nullable=False, index=True)
    title:          Mapped[str]       = mapped_column(String(500), nullable=False)
    content:        Mapped[str]       = mapped_column(Text, default="")
    visibility:     Mapped[str]       = mapped_column(String(20), default="draft")
    search_vector:  Mapped[str]       = mapped_column(TSVECTOR, nullable=True)
    created_at:     Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at:     Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    version_count:  Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    owner:    Mapped["User"]         = relationship("User", back_populates="posts")
    versions: Mapped[list["Version"]]= relationship("Version", back_populates="post",
                                                     cascade="all, delete-orphan", order_by="Version.version_number")
    tags:     Mapped[list["Tag"]]    = relationship("Tag", secondary="post_tags", back_populates="posts")
    share:    Mapped["Share"]        = relationship("Share", back_populates="post", uselist=False)