from datetime import datetime, timedelta, timezone
import uuid
from typing import Optional, List
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.auth import get_current_user
from schemas.posts import PostCreate, PostData, PostResponse, PostListResponse, PostUpdate
from database.database import get_db
from models.users import User
from models.posts import Post
from models.version import Version
from models.verionhash import VersionHash

post_router = APIRouter(prefix='/posts', tags=["Posts"])
post_not_found = "Post Not Found"

@post_router.get(
    "/",
    response_model=PostListResponse,
    summary="Get all posts for the authenticated user",
    responses={
        200: {"description": "Posts fetched successfully"},
        401: {"description": "Unauthorized"},
    }
)
async def get_user_posts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post)
        .where(Post.user_id == current_user.id)
        .options(selectinload(Post.versions))
    )
    posts = result.scalars().all()
    for p in posts:
        p.version_count = len(p.versions)
        if p.versions:
            p.latest_version_id = sorted(p.versions, key=lambda v: v.version_number, reverse=True)[0].id
        
    return PostListResponse(
        status=True,
        message="Posts fetched successfully",
        data=[PostData.model_validate(p) for p in posts],
        error=None,
    )

@post_router.post(
    "/",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new post",
    responses={
        201: {"description": "Post created successfully"},
        400: {"description": "Invalid input data"},
        401: {"description": "Unauthorized"},
    }
)
async def create_post(payload: PostCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_post = Post(
        title=payload.title,
        visibility=payload.visibility,
        user_id=current_user.id,
        content=""
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    
    new_post.version_count = 0
    
    return PostResponse(
        status=True,
        message="Post created successfully",
        data=PostData.model_validate(new_post),
        error=None,
    )

@post_router.get(
    "/search",
    response_model=PostListResponse,
    summary="Search posts by title or content",
    responses={
        200: {"description": "Search results fetched successfully"},
        401: {"description": "Unauthorized"},
    }
)
async def search_posts(q: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post)
        .where(
            Post.user_id == current_user.id,
            Post.search_vector.op("@@")(func.plainto_tsquery("english", q))
        )
        .options(selectinload(Post.versions))
    )
    posts = result.scalars().all()
    for p in posts:
        p.version_count = len(p.versions)
        if p.versions:
            p.latest_version_id = sorted(p.versions, key=lambda v: v.version_number, reverse=True)[0].id
        
    return PostListResponse(
        status=True,
        message="Search results fetched successfully",
        data=[PostData.model_validate(p) for p in posts],
        error=None,
    )

@post_router.get(
    "/{id}",
    response_model=PostResponse,
    summary="Fetch a single post by ID",
    responses={
        200: {"description": "Post fetched successfully"},
        401: {"description": "Unauthorized"},
        404: {"description": "Post Not Found"},
    }
)
async def get_post(id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post)
        .where(Post.id == id, Post.user_id == current_user.id)
        .options(selectinload(Post.versions))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=post_not_found)
    
    post.version_count = len(post.versions)
    if post.versions:
        post.latest_version_id = sorted(post.versions, key=lambda v: v.version_number, reverse=True)[0].id

    
    return PostResponse(
        status=True,
        message="Post fetched successfully",
        data=PostData.model_validate(post),
        error=None,
    )

@post_router.put(
    "/{id}",
    response_model=PostResponse,
    summary="Update post title or visibility",
    responses={
        200: {"description": "Post updated successfully"},
        401: {"description": "Unauthorized"},
        404: {"description": "Post Not Found"},
    }
)
async def update_post(id: uuid.UUID, payload: PostUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post)
        .where(Post.id == id, Post.user_id == current_user.id)
        .options(selectinload(Post.versions))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=post_not_found)
    
    if payload.title is not None:
        post.title = payload.title
    if payload.visibility is not None:
        post.visibility = payload.visibility
        
    post.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(post)
    
    post.version_count = len(post.versions)
    if post.versions:
        post.latest_version_id = sorted(post.versions, key=lambda v: v.version_number, reverse=True)[0].id
    
    return PostResponse(
        status=True,
        message="Post updated successfully",
        data=PostData.model_validate(post),
        error=None,
    )

@post_router.delete(
    "/{id}",
    response_model=PostResponse,
    summary="Delete a post",
    responses={
        200: {"description": "Post deleted successfully"},
        401: {"description": "Unauthorized"},
        404: {"description": "Post Not Found"},
    }
)
async def delete_post(id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == id, Post.user_id == current_user.id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=post_not_found)
    
    await db.delete(post)
    await db.commit()
    
    return PostResponse(
        status=True,
        message="Post deleted successfully",
        data=None,
        error=None,
    )