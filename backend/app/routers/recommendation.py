"""
routers/recommendation.py
FastAPI router for ML Career Prediction & Resume Parsing endpoints.

Routes
------
POST   /api/v1/recommendation/predict        → Predict top career paths & parse entities from text
POST   /api/v1/recommendation/upload-resume → Extract text from uploaded PDF/DOCX/TXT file, extract entities, predict top careers
"""

import json
import os
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from app.schemas.recommendation import PredictCareerRequest, PredictCareerResponse, EntityItem
from app.ml.predictor import CareerPredictor
from app.parser.resume_parser import extract_text_from_bytes, extract_ner_entities

router = APIRouter(prefix="/recommendation", tags=["Career Recommendation"])

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
METRICS_PATH = os.path.join(BASE_DIR, "trained_models", "logistic_regression_metrics.json")


def get_trained_model_accuracy() -> float:
    """Read baseline model accuracy from metrics file, default to 66.0% if file missing."""
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                acc = data.get("accuracy", 0.66)
                return round(float(acc) * 100, 2)
        except Exception:
            pass
    return 66.0


@router.post(
    "/predict",
    response_model=PredictCareerResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict top career paths using Logistic Regression model and parse SpaCy NER entities",
)
def predict_career(payload: PredictCareerRequest):
    """
    Predict top suitable career categories with confidence percentages
    based on raw resume text and extract Named Entities (Skills, Roles, Education).
    """
    raw_text = payload.text or ""
    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text cannot be empty.",
        )

    predictor = CareerPredictor.get_instance()
    if not predictor.is_loaded:
        predictor.load_artifacts()
        if not predictor.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML model is not currently loaded. Please run model training script.",
            )

    results = predictor.predict(raw_text=raw_text, top_n=payload.top_n or 5)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract sufficient text features for prediction.",
        )

    top_career = results[0]["career"]
    top_confidence = results[0]["confidence"]
    entities_raw = extract_ner_entities(raw_text)

    entities = [
        EntityItem(
            text=item["text"],
            label=item["label"],
            start=item["start"],
            end=item["end"]
        ) for item in entities_raw
    ]

    return PredictCareerResponse(
        text=raw_text,
        entities=entities,
        model_name="Logistic Regression Model",
        top1_accuracy=get_trained_model_accuracy(),
        predictions=results,
        top_career=top_career,
        confidence=top_confidence,
    )


@router.post(
    "/upload-resume",
    response_model=PredictCareerResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload resume file (PDF, DOCX, TXT), extract text, parse SpaCy NER entities, and predict career path",
)
async def upload_and_predict_resume(
    file: UploadFile = File(...),
    top_n: Optional[int] = Form(default=5)
):
    """
    Accepts PDF, DOCX, or TXT file upload.
    Extracts text, identifies Named Entities (Skills, Roles, Education),
    and runs Logistic Regression inference to return predictions.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    extracted_text = extract_text_from_bytes(contents, file.filename or "resume.txt")
    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Failed to extract text from the provided file.",
        )

    predictor = CareerPredictor.get_instance()
    if not predictor.is_loaded:
        predictor.load_artifacts()
        if not predictor.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML model is not loaded.",
            )

    results = predictor.predict(raw_text=extracted_text, top_n=top_n or 5)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract features from resume text for prediction.",
        )

    top_career = results[0]["career"]
    top_confidence = results[0]["confidence"]
    entities_raw = extract_ner_entities(extracted_text)

    entities = [
        EntityItem(
            text=item["text"],
            label=item["label"],
            start=item["start"],
            end=item["end"]
        ) for item in entities_raw
    ]

    return PredictCareerResponse(
        text=extracted_text,
        entities=entities,
        model_name="Logistic Regression Model",
        top1_accuracy=get_trained_model_accuracy(),
        predictions=results,
        top_career=top_career,
        confidence=top_confidence,
    )
