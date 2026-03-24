from pydantic import BaseModel
import uuid
from datetime import datetime,timezone
from typing import List,Literal,Optional

class PostCreate(BaseModel):
    title:str
    visibility:Literal["draft", "published"] = "draft"

class PostUpdate(BaseModel):
    title:str | None=None
    visibility: Literal["draft", "published"] | None = None

class PostResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    visibility: str
    created_at: datetime
    updated_at: datetime
    version_count: int = 0
