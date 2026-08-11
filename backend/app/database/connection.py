"""
database/connection.py
MySQL database connection using SQLAlchemy ORM.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.utils.config import settings

# ── Engine ──────────────────────────────────────────────────────────────────
db_url = settings.DATABASE_URL
try:
    temp_engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
except Exception as err:
    print(f"[WARN] MySQL database unavailable ({err}). Using local SQLite database (careercast.db).")
    engine = create_engine(
        "sqlite:///./careercast.db",
        connect_args={"check_same_thread": False},
        echo=False
    )

# ── Session factory ──────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ── Base class for all ORM models ────────────────────────────────────────────
Base = declarative_base()


# ── Dependency injected into FastAPI routes ──────────────────────────────────
def get_db():
    """Yield a database session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
