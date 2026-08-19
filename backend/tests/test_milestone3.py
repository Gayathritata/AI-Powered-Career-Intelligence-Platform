"""
backend/tests/test_milestone3.py

Automated Test Suite for Milestone 3:
- FastAPI endpoints (/predict, /recommend, /gap-report, /mlflow/models)
- Skill Gap Analysis module logic
- MLflow Model Registry metadata query
- Accuracy Gate validation script
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add project root and backend folder to sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.main import app
from app.services.skill_gap_service import gap_analyzer
from app.ml.mlflow_tracker import mlflow_tracker
from app.ml.accuracy_gate import verify_accuracy_gate


client = TestClient(app)


def test_root_predict_endpoint():
    """Test POST /predict endpoint returns career predictions and NER entities."""
    payload = {
        "text": "Experienced Python Developer with expertise in SQL, PyTorch, FastAPI, and Machine Learning.",
        "top_n": 3
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "top_career" in data
    assert "confidence" in data
    assert len(data["predictions"]) > 0
    assert data["top1_accuracy"] >= 90.0


def test_root_recommend_endpoint():
    """Test POST /recommend endpoint returns learning roadmap."""
    payload = {
        "user_skills": ["Python", "SQL", "PyTorch"],
        "target_career": "ML Engineer"
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "target_career" in data
    assert "recommended_learning_paths" in data
    assert "actionable_roadmap" in data


def test_root_gap_report_endpoint():
    """Test POST /gap-report endpoint returns detailed skill gap report."""
    payload = {
        "user_skills": ["Python", "SQL", "PyTorch"],
        "target_career": "ML Engineer"
    }
    response = client.post("/gap-report", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_career"] == "ML Engineer"
    assert "match_score" in data
    assert "matched_skills" in data
    assert "missing_skills" in data
    assert "skill_priorities" in data


def test_mlflow_models_endpoint():
    """Test GET /mlflow/models endpoint returns registered models."""
    response = client.get("/mlflow/models")
    assert response.status_code == 200
    data = response.json()
    assert data["registry_name"] == "CareerCast_Recommender"
    assert len(data["models"]) >= 2
    versions = [m["version"] for m in data["models"]]
    assert "v1" in versions
    assert "v2" in versions


def test_skill_gap_analyzer_logic():
    """Test SkillGapAnalyzer service direct method execution."""
    res = gap_analyzer.analyze_gap(
        raw_text="",
        user_skills=["Python", "SQL", "PyTorch"],
        target_career="ML Engineer"
    )
    assert res["target_career"] == "ML Engineer"
    assert res["match_score"] > 0
    assert isinstance(res["matched_skills"], list)
    assert isinstance(res["missing_skills"], list)


def test_accuracy_gate_verification():
    """Test accuracy gate verification script passing target threshold."""
    passed = verify_accuracy_gate(threshold=90.0)
    assert passed is True
