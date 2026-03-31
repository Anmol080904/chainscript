import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ShareCreate(BaseModel):
    expires_at: Optional[datetime] = None

class ShareOut(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    token: str
    expires_at: Optional[datetime]
    created_at: datetime
    is_expired: bool
    model_config = ConfigDict(from_attributes=True)

class SharedPostOut(BaseModel):
    title: str
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
