"""
backend/app/schemas/recommendation.py

Pydantic schemas for career prediction and recommendation endpoints.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class EntityItem(BaseModel):
    text: str = Field(..., description="Entity text snippet")
    label: str = Field(..., description="Entity type: SKILL, ROLE, or EDUCATION")
    start: int = Field(..., description="Character start index")
    end: int = Field(..., description="Character end index")


class CareerPredictionItem(BaseModel):
    career: str = Field(..., description="Name of predicted career path")
    confidence: float = Field(..., description="Confidence score percentage (0-100)")


class PredictCareerRequest(BaseModel):
    text: Optional[str] = Field(None, description="Raw resume text or profile description")
    top_n: Optional[int] = Field(default=5, ge=1, le=10, description="Number of top predictions to return")


class PredictCareerResponse(BaseModel):
    text: str = Field(..., description="Parsed raw resume text")
    entities: List[EntityItem] = Field(default_factory=list, description="Extracted NER entities")
    model_name: str = Field(default="Multi-Model AI Ensemble (XGBoost, Random Forest, Logistic Regression & SBERT)", description="Model name")
    top1_accuracy: float = Field(..., description="Top-1 accuracy / confidence percentage")
    predictions: List[CareerPredictionItem]
    top_career: str
    confidence: float

