"""
services/auth_service.py
Business logic layer for user registration and login.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.utils.security import hash_password, verify_password, create_access_token


class AuthService:
    """Handles all authentication-related business logic."""

    # ── Register ──────────────────────────────────────────────────────────────
    @staticmethod
    def register(payload: RegisterRequest, db: Session) -> User:
        """
        Register a new user.

        Raises:
            HTTP 409 if the email is already taken.
        """
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        new_user = User(
            name=payload.name.strip(),
            email=payload.email.lower().strip(),
            password=hash_password(payload.password),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    # ── Login ─────────────────────────────────────────────────────────────────
    @staticmethod
    def login(payload: LoginRequest, db: Session) -> dict:
        """
        Authenticate a user and return a JWT access token.

        Raises:
            HTTP 401 if the email is not found or the password is incorrect.
        """
        user = db.query(User).filter(User.email == payload.email.lower().strip()).first()

        # Use a generic message to avoid leaking whether the email exists
        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }
