import asyncio
import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from config.config import settings
from models.version import Version

async def tamper():
    # Replace this with the ID of the version you want to test
    target_id = input("Enter the Version ID (UUID) to tamper with: ").strip()
    
    try:
        vid = uuid.UUID(target_id)
    except ValueError:
        print("Invalid UUID format!")
        return

    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as db:
        result = await db.execute(select(Version).where(Version.id == vid))
        version = result.scalars().first()

        if not version:
            print(f"Version {target_id} not found in database.")
            return

        print(f"Original Content: {version.full_content[:50]}...")
        
        # Tamper with the content
        tampered_content = version.full_content + " [TAMPERED]"
        
        await db.execute(
            update(Version)
            .where(Version.id == vid)
            .values(full_content=tampered_content)
        )
        await db.commit()
        print("\nSUCCESS: Document content has been tampered with in the database!")
        print("Now go to your frontend and click Verify. It should return FALSE.")

if __name__ == "__main__":
    asyncio.run(tamper())
