import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database.database import get_db
from models.users import User
from models.posts import Post
from models.share import Share
from core.auth import get_current_user
from schemas.shares import ShareCreate, ShareOut, SharedPostOut

share_router = APIRouter(prefix="/posts", tags=["Shares"])

@share_router.post("/{id}/share", response_model=ShareOut, status_code=status.HTTP_201_CREATED)
async def generate_share_token(id: uuid.UUID, data: ShareCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == id, Post.user_id == current_user.id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    # Check if share already exists
    share_result = await db.execute(select(Share).where(Share.post_id == id))
    existing_share = share_result.scalars().first()
    
    if existing_share:
        existing_share.expires_at = data.expires_at
        await db.commit()
        await db.refresh(existing_share)
        return existing_share
    
    new_share = Share(post_id=id, expires_at=data.expires_at)
    db.add(new_share)
    await db.commit()
    await db.refresh(new_share)
    return new_share

@share_router.get("/share/{token}", response_model=SharedPostOut)
async def get_shared_post(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Share)
        .options(selectinload(Share.post))
        .where(Share.token == token)
    )
    share = result.scalars().first()
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid share token")
    
    if share.is_expired:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Share token has expired")
    
    return share.post
