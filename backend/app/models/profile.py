"""
models/profile.py
SQLAlchemy ORM model for the `profiles` table.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    phone = Column(String(20), nullable=True)
    education = Column(String(255), nullable=True)     # e.g. "B.Tech"
    degree = Column(String(255), nullable=True)        # e.g. "Bachelor of Technology"
    branch = Column(String(255), nullable=True)        # e.g. "AIML"

    # Stored as JSON strings in MySQL TEXT columns
    skills = Column(Text, nullable=True)               # JSON array
    soft_skills = Column(Text, nullable=True)          # JSON array
    projects = Column(Text, nullable=True)             # JSON array
    certifications = Column(Text, nullable=True)       # JSON array
    experience = Column(Text, nullable=True)           # JSON array / plain text

    resume_path = Column(String(500), nullable=True)   # relative path inside uploads/
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Back-reference to User
    user = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<Profile id={self.id} user_id={self.user_id}>"
