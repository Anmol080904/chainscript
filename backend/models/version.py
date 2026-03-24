import uuid
from sqlalchemy import String, Text, Integer, ForeignKey, UniqueConstraint, text,DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from database.database import Base
from datetime import datetime,timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.users import User
    from models.posts import Post
    from models.verionhash import VersionHash
class Version(Base):
    __tablename__ = "versions"
    __table_args__ = (
        UniqueConstraint("post_id", "version_number", name="uq_post_version"),
    )

    id:             Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    post_id:        Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"),
                                                       nullable=False, index=True)
    version_number: Mapped[int]       = mapped_column(Integer, nullable=False)
    full_content:   Mapped[str]       = mapped_column(Text, nullable=False)
    diff_patch:     Mapped[dict]      = mapped_column(JSONB, nullable=True)
    commit_message: Mapped[str]       = mapped_column(String(200), nullable=True)
    created_by:     Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at:     Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    # Relationships
    post:          Mapped["Post"]        = relationship("Post", back_populates="versions")
    author:        Mapped["User"]        = relationship("User", back_populates="versions")
    version_hash:  Mapped["VersionHash"] = relationship("VersionHash", back_populates="version", uselist=False)