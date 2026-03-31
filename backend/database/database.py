from config.config import settings

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


if settings.ASYNC_DATABASE_URL is None:
    raise HTTPException(status_code=404, detail="url is not fine")


asyncengine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)
AsyncSessionLocal = async_sessionmaker(
    bind=asyncengine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=asyncengine)
Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db