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


class SkillGapRequest(BaseModel):
    text: Optional[str] = Field(None, description="Raw resume text")
    user_skills: Optional[List[str]] = Field(default_factory=list, description="Extracted or explicitly passed user skills")
    target_career: Optional[str] = Field(None, description="Target career role title to analyze gap against")


class SkillGapItem(BaseModel):
    skill_name: str
    priority: str = Field(..., description="High, Medium, or Low priority")
    difficulty: str
    estimated_hours: int
    recommended_resources: List[str]
    suggested_project: str


class SkillGapReportResponse(BaseModel):
    target_career: str
    match_score: float = Field(..., description="Composite semantic match score percentage (0-100)")
    coverage_ratio: float = Field(..., description="Percentage of required skills met")
    matched_skills: List[str]
    missing_skills: List[str]
    required_skills: List[str]
    skill_priorities: List[SkillGapItem]
    actionable_recommendations: List[str]
    estimated_time_to_bridge: str
    total_estimated_hours: int


