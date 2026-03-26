import uuid
from models.version import Version
from models.verionhash import VersionHash
from models.users import User
from core.auth import get_current_user
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Annotated
from database.database import get_db
from fastapi import APIRouter,HTTPException, Depends, Query, status
from models.posts import Post
from schemas.versions import (
    VersionCreate,
    VersionSaveResponse,
    VersionOut,
    VersionDetailOut,
    DiffOperation
)
from myers_diff.myers import (
    compute_diff,
    build_diff
)
from blockchain.blockchain_connect import(
    BlockchainService
)
version_router=APIRouter(prefix="/posts")

@version_router.post("/{id}/versions", response_model=VersionSaveResponse)
async def create_version(id: uuid.UUID, data: VersionCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == id, Post.user_id == current_user.id))
    post = result.scalars().first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not Found")
    
    diff_patch = None
    if post.version_count == 0:
        version_number = 1
    else:
        version_number = post.version_count + 1
        latest_version_query = await db.execute(
            select(Version)
            .where(Version.post_id == id)
            .order_by(Version.version_number.desc())
            .limit(1)
        )
        latest_version = latest_version_query.scalars().first()
        if latest_version:
            diff_patch = compute_diff(latest_version.full_content, data.content)

    new_version = Version(
        post_id=id,
        version_number=version_number,
        full_content=data.content,
        diff_patch=diff_patch,
        commit_message=data.final_message,
        created_by=current_user.id
    )
    db.add(new_version)
    post.version_count = version_number
    post.content = data.content
    
    # Save the Version safely to our database before consuming any ETH
    await db.commit()
    await db.refresh(new_version)

    blockchain = BlockchainService()
    try:
        seal_result = await blockchain.seal_version(data.content)
        
        version_hash = VersionHash(
            version_id=new_version.id,
            content_hash=seal_result["content_hash"],
            tx_hash=seal_result["tx_hash"],
            block_number=seal_result["block_number"],
            seal_status="sealed"
        )
        db.add(version_hash)
        await db.commit()

        return VersionSaveResponse(
            version_id=new_version.id,
            version_number=version_number,
            diff_patch=diff_patch,
            tx_hash=seal_result["tx_hash"],
            block_number=seal_result["block_number"],
            content_hash=seal_result["content_hash"]
        )
    except Exception as e:
        print(f"Blockchain Seal Failed: {e}")
        # If the blockchain seal fails, the version is already successfully saved. 
        import hashlib
        content_hash = hashlib.sha256(data.content.encode()).hexdigest()
        
        return VersionSaveResponse(
            version_id=new_version.id,
            version_number=version_number,
            diff_patch=diff_patch,
            tx_hash=None,
            block_number=None,
            content_hash=content_hash
        )

@version_router.get("/{id}/versions", response_model=list[VersionOut])
async def list_versions(id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == id, Post.user_id == current_user.id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not Found")

    versions_query = await db.execute(
        select(Version)
        .where(Version.post_id == id)
        .options(selectinload(Version.version_hash))
        .order_by(Version.version_number.asc())
    )
    versions = versions_query.scalars().all()
    
    response = []
    for v in versions:
        has_seal = False
        if v.version_hash and (v.version_hash.tx_hash or v.version_hash.seal_status == "sealed"):
            has_seal = True
        
        response.append(VersionOut(
            id=v.id,
            version_number=v.version_number,
            commit_message=v.commit_message,
            created_at=v.created_at,
            has_blockchain_seal=has_seal
        ))
    return response

@version_router.get("/{id}/versions/{n}", response_model=VersionDetailOut)
async def get_version(id: uuid.UUID, n: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == id, Post.user_id == current_user.id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Post not Found")

    version_query = await db.execute(
        select(Version)
        .where(Version.post_id == id, Version.version_number == n)
        .options(selectinload(Version.version_hash))
    )
    v = version_query.scalars().first()
    if not v:
        raise HTTPException(status_code=404, detail="Version not Found")

    has_seal = False
    if v.version_hash and (v.version_hash.tx_hash or v.version_hash.seal_status == "sealed"):
        has_seal = True

    return VersionDetailOut(
        id=v.id,
        version_number=v.version_number,
        commit_message=v.commit_message,
        created_at=v.created_at,
        has_blockchain_seal=has_seal,
        full_content=v.full_content,
        diff_patch=v.diff_patch
    )

@version_router.get("/{id}/versions/{n}/diff", response_model=list[DiffOperation])
async def get_version_diff(id: uuid.UUID, n: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == id, Post.user_id == current_user.id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Post not Found")

    if n <= 1:
        return []

    version_query = await db.execute(
        select(Version)
        .where(Version.post_id == id, Version.version_number == n)
    )
    v = version_query.scalars().first()
    if not v:
        raise HTTPException(status_code=404, detail="Version not Found")
        
    if not v.diff_patch:
        return []

    return v.diff_patch
