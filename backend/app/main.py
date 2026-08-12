"""
app/main.py
FastAPI application entry point.
"""

import os
import gc

# ── Memory Optimization for Cloud Hosting (Render 512MB limit) ────────────────
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["PYTHONHASHSEED"] = "42"

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.config import settings
from app.database.connection import Base, engine
from app.routers import auth, recommendation

# Import models so SQLAlchemy registers them with Base.metadata
from app.models import user, profile  # noqa: F401


# ── Lifespan — runs on startup / shutdown ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if DB is reachable
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created / verified.")
    except Exception as e:
        print(f"[WARN] Database not reachable on startup: {e}")
        print("       Start the server anyway; DB errors will surface on first request.")

    # Pre-warm ML Predictor artifacts asynchronously in background thread so Uvicorn binds to $PORT instantly
    import asyncio

    def _prewarm_ml():
        try:
            from app.ml.predictor import CareerPredictor
            predictor = CareerPredictor.get_instance()
            if not predictor.is_loaded:
                predictor.load_artifacts()
            print("[OK] ML CareerPredictor pre-warmed in background.")
        except Exception as err:
            print(f"[WARN] Could not pre-warm ML predictor: {err}")

    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, _prewarm_ml)

    yield
    # Shutdown


# ── Application factory ───────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered Career Recommendation System API. "
        "Upload your resume and get personalised career predictions."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):(3000|8000|5173)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No file storage — resumes are parsed in-memory and not saved to disk.

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(recommendation.router, prefix=API_PREFIX)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """Returns service health status."""
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }

