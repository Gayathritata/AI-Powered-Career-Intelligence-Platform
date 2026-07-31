"""
routers/auth.py
FastAPI router for authentication endpoints.

Routes
------
POST   /api/v1/auth/register  → Register a new user
POST   /api/v1/auth/login     → Login and receive JWT
GET    /api/v1/auth/me        → Return current user (protected)
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── POST /register ────────────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new user account.

    - **name**: Full name (2–150 characters)
    - **email**: Valid unique email address
    - **password**: Minimum 8 chars; must contain upper, lower, and digit
    """
    AuthService.register(payload, db)
    return MessageResponse(
        message="Account created successfully. Please log in.",
        success=True,
    )


# ── POST /login ───────────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login and receive a JWT access token",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with **email** and **password**.

    Returns a Bearer JWT that must be sent in the `Authorization` header
    for all protected routes.
    """
    result = AuthService.login(payload, db)
    return TokenResponse(**result)


# ── GET /me ───────────────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Return the currently authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's basic details.

    Requires a valid Bearer token in the `Authorization` header.
    """
    return current_user
