import os
from app.core.config import settings

from .api import auth, users, texport, moods
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(root_path=settings.API_ROOT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, tags=["users"])
app.include_router(texport.router, tags=["docs"])
app.include_router(moods.router, tags=["moods"])

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend-dist")
if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
