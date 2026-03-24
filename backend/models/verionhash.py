import uuid
from sqlalchemy import String, BigInteger, Integer, ForeignKey, text,DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.database import Base
from datetime import datetime,timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.version import Version
class VersionHash(Base):
    __tablename__ = "version_hashes"

    id:            Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    version_id:    Mapped[uuid.UUID] = mapped_column(ForeignKey("versions.id", ondelete="CASCADE"),
                                                      nullable=False, unique=True, index=True)
    content_hash:  Mapped[str]       = mapped_column(String(64), nullable=False)
    tx_hash:       Mapped[str]       = mapped_column(String(66), nullable=True)
    block_number:  Mapped[int]       = mapped_column(BigInteger, nullable=True)
    gas_used:      Mapped[int]       = mapped_column(Integer, nullable=True)
    seal_status:   Mapped[str]       = mapped_column(String(20), default="pending")
    verified_at:   Mapped[datetime]  = mapped_column(DateTime(timezone=True), nullable=True)
    created_at:    Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    # Relationship
    version: Mapped["Version"] = relationship("Version", back_populates="version_hash")

    @property
    def etherscan_url(self) -> str | None:
        if self.tx_hash:
            return f"https://sepolia.etherscan.io/tx/{self.tx_hash}"
        return None
