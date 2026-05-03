from fastapi import FastAPI
from app.core.config import settings
app = FastAPI(root_path=settings.API_ROOT)


@app.get("/healthz")
async def check_endpoint():
    return {"message": "Hello, World"}
