import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PostTagAdd(BaseModel):
    tag_id: uuid.UUID
