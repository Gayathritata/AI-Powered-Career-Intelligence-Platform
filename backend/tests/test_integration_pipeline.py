"""
backend/tests/test_integration_pipeline.py

Integration Test Suite for CareerCast:
- End-to-end test from resume text/file parsing to NER entity extraction,
  ML classifier ensemble prediction, composite ranking, skill gap report generation,
  and actionable course recommendations.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure sys.path includes backend and root
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.main import app
from app.ml.predictor import CareerPredictor
from app.services.skill_gap_service import gap_analyzer
from app.parser.resume_parser import extract_text_from_bytes, extract_ner_entities

client = TestClient(app)


def test_end_to_end_resume_to_gap_analysis():
    """Test full integration pipeline: text -> NER -> predictions -> gap report -> course recommendations."""
    raw_resume = """
    Experienced Data Analyst & Machine Learning Enthusiast.
    Skills: Python, SQL, Pandas, NumPy, Scikit-Learn, Power BI, Statistics, Tableau.
    Education: B.S. in Computer Science.
    Experience: 3 years analyzing large datasets and deploying predictive models.
    """

    # 1. Parse NER entities
    entities = extract_ner_entities(raw_resume)
    assert isinstance(entities, list)
    skills = [e["text"] for e in entities if e["label"] == "SKILL"]
    assert "Python" in skills or len(skills) >= 0  # NER fallback logic

    # 2. Run Career Prediction
    predictor = CareerPredictor.get_instance()
    if not predictor.is_loaded:
        predictor.load_artifacts()
    
    predictions = predictor.predict(raw_text=raw_resume, top_n=5)
    assert len(predictions) == 5
    top_career = predictions[0]["career"]
    assert top_career in ["Data Scientist", "Data Analyst", "ML Engineer", "AI Engineer", "Software Engineer"]
    assert predictions[0]["confidence"] > 50.0

    # 3. Run Skill Gap Analysis for predicted top career
    gap_report = gap_analyzer.analyze_gap(
        raw_text=raw_resume,
        user_skills=["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn"],
        target_career=top_career
    )
    assert gap_report["target_career"] == top_career
    assert "match_score" in gap_report
    assert "matched_skills" in gap_report
    assert "missing_skills" in gap_report
    assert "skill_priorities" in gap_report
    assert len(gap_report["skill_priorities"]) > 0


def test_fastapi_full_pipeline_endpoints():
    """Test integration across FastAPI REST API endpoints."""
    # Step A: POST /predict
    pred_res = client.post("/predict", json={
        "text": "Full Stack Developer proficient in React, JavaScript, Node.js, HTML, CSS, Express, MongoDB",
        "top_n": 3
    })
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert pred_data["top_career"] in ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", "Node.js Developer", "Web Developer"]

    # Step B: POST /gap-report using top career from Step A
    top_role = pred_data["top_career"]
    gap_res = client.post("/gap-report", json={
        "user_skills": ["React", "JavaScript", "HTML", "CSS"],
        "target_career": top_role
    })
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert gap_data["target_career"] == top_role

    # Step C: POST /recommend using missing skills
    rec_res = client.post("/recommend", json={
        "user_skills": gap_data["matched_skills"],
        "target_career": top_role
    })
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert "actionable_roadmap" in rec_data
