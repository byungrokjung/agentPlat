from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import agents
from app.core.config import settings
from app.services.supabase import close_supabase


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_supabase()

app = FastAPI(
    title="AI Agent Platform API",
    description="API for building and running custom AI agents",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(agents.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "AI Agent Platform API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
