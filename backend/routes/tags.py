import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database.database import get_db
from models.users import User
from models.posts import Post
from models.tag import Tag
from core.auth import get_current_user
from schemas.tags import TagCreate, TagOut, PostTagAdd

tag_router = APIRouter(tags=["Tags"])

@tag_router.get("/tags", response_model=list[TagOut])
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag))
    return result.scalars().all()

@tag_router.post("/tags", response_model=TagOut, status_code=status.HTTP_201_CREATED)
async def create_tag(data: TagCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if tag exists
    existing_tag = await db.execute(select(Tag).where(Tag.name == data.name))
    if existing_tag.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag already exists")
    
    new_tag = Tag(name=data.name)
    db.add(new_tag)
    await db.commit()
    await db.refresh(new_tag)
    return new_tag

@tag_router.post("/posts/{id}/tags", status_code=status.HTTP_201_CREATED)
async def add_tag_to_post(id: uuid.UUID, data: PostTagAdd, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.tags))
        .where(Post.id == id, Post.user_id == current_user.id)
    )
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    tag_result = await db.execute(select(Tag).where(Tag.id == data.tag_id))
    tag = tag_result.scalars().first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    
    if tag not in post.tags:
        post.tags.append(tag)
        await db.commit()
    
    return {"message": f"Tag '{tag.name}' added to post"}

@tag_router.delete("/posts/{id}/tags/{tag_id}")
async def remove_tag_from_post(id: uuid.UUID, tag_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.tags))
        .where(Post.id == id, Post.user_id == current_user.id)
    )
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    tag_to_remove = next((t for t in post.tags if t.id == tag_id), None)
    if not tag_to_remove:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found on this post")
    
    post.tags.remove(tag_to_remove)
    await db.commit()
    return {"message": "Tag removed from post"}
