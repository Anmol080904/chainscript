from pydantic import BaseModel, computed_field
import uuid
from datetime import datetime

class VersionHashOut(BaseModel):
    version_id:   uuid.UUID
    content_hash: str
    tx_hash:      str | None
    block_number: int | None
    seal_status:  str
    verified_at:  datetime | None

    @computed_field
    def etherscan_url(self) -> str | None:
        return f"https://sepolia.etherscan.io/tx/{self.tx_hash}" if self.tx_hash else None

class VerifyResponse(BaseModel):        # GET /versions/{id}/verify
    verified:      bool
    content_hash:  str
    tx_hash:       str | None
    block_number:  int | None
    etherscan_url: str | None
