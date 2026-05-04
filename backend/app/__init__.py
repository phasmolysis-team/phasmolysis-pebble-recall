from app.core.config import settings
from .api import auth, users
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI(root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, tags=["users"])
