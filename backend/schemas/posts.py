from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime,timezone
from typing import List,Literal,Optional

class PostCreate(BaseModel):
    title:str
    visibility:Literal["draft", "published"] = "draft"

class PostUpdate(BaseModel):
    title:str | None=None
    visibility: Literal["draft", "published"] | None = None

class PostData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    title: str
    content: str
    visibility: str
    created_at: datetime
    updated_at: datetime
    version_count: int = 0
    latest_version_id: Optional[uuid.UUID] = None


class PostResponse(BaseModel):
    status: bool
    message: str
    data: Optional[PostData] = None
    error: Optional[str] = None

class PostListResponse(BaseModel):
    status: bool
    message: str
    data: Optional[List[PostData]] = None
    error: Optional[str] = None
