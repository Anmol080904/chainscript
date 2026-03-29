from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.posts import post_router
from routes.versions import version_router, version_action_router
from routes.tags import tag_router
from routes.shares import share_router
from routes.export import export_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Chainscript CMS",
    version="1.0.0",
    description="Backend Architecture & API Reference — FYP 2025-2026",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(post_router)
app.include_router(version_router)
app.include_router(version_action_router)
app.include_router(tag_router)
app.include_router(share_router)
app.include_router(export_router)

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Enterprise HelpDesk API is running 🚀"}
