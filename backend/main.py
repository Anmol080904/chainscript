from fastapi import FastAPI
from routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Enterprise HelpDesk / Chainscript",
    version="1.0.0",
    description="HiTech — Your Partner in Process Excellence",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Enterprise HelpDesk API is running 🚀"}
