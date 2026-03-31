import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.database import get_db
from models.users import User
from models.version import Version
from core.auth import get_current_user
import markdown_it

export_router = APIRouter(prefix="/export", tags=["Export"])

@export_router.post("/pdf/{version_id}")
async def export_to_pdf(version_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # In a real implementation, we would use a library like xhtml2pdf or weasyprint
    # For now, we will return the HTML content as a downloadable file
    version_query = await db.execute(
        select(Version).where(Version.id == version_id)
    )
    version = version_query.scalars().first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")
        
    md = markdown_it.MarkdownIt()
    html_content = md.render(version.full_content)
    
    # Simple HTML wrapper
    full_html = f"<html><body>{html_content}</body></html>"
    
    return Response(
        content=full_html,
        media_type="text/html",
        headers={"Content-Disposition": f'attachment; filename="version_{version.version_number}.html"'}
    )

@export_router.post("/gist/{version_id}")
async def export_to_gist(version_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # This requires a GitHub OAuth token which should be stored in the User model or passed in
    # For now, we simulate the request or check if the user has a token
    version_query = await db.execute(
        select(Version).where(Version.id == version_id)
    )
    version = version_query.scalars().first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

    # Mocking gist creation (requires actual token)
    # payload = {
    #     "description": f"Chainscript - Version {version.version_number}",
    #     "public": False,
    #     "files": {
    #         "post.md": {"content": version.full_content}
    #     }
    # }
    
    # In a real scenario, we'd use:
    # async with httpx.AsyncClient() as client:
    #     r = await client.post("https://api.github.com/gists", json=payload, headers={"Authorization": f"token {GITHUB_TOKEN}"})
    
    return {"message": "Gist export initiated (GitHub token required for real integration)", "gist_url": "https://gist.github.com/mock-url"}
