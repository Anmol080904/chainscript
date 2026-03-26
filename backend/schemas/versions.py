from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Any

class DiffOperation(BaseModel):        # One line in the diff_patch array
    op: str                            # "equal" | "insert" | "delete"
    line: int
    content: str

class VersionCreate(BaseModel):        # POST /posts/{id}/versions  — request
    content: str
    final_message: str | None = None

class VersionOut(BaseModel):           # Response — list view
    id: uuid.UUID
    version_number: int
    commit_message: str | None
    created_at: datetime
    has_blockchain_seal: bool = False
    
class VersionDetailOut(VersionOut):    # Response — GET /posts/{id}/versions/{n}
    full_content: str
    diff_patch: list[DiffOperation] | None = None

class VersionSaveResponse(BaseModel):  
    version_id: uuid.UUID
    version_number: int
    diff_patch: list[DiffOperation] | None
    tx_hash: str | None                # Ethereum tx hash (None if seal failed)
    block_number: int | None
    content_hash: str
