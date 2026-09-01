"""
backend/tests/test_regression.py

Regression Test Suite for CareerCast:
- Validates model stability across canonical benchmark profiles.
- Enforces model accuracy gate threshold (>= 90.0%).
- Verifies edge case resilience (empty strings, corrupt inputs, non-standard text).
"""

import sys
import os
import pytest

# Ensure sys.path includes backend and root
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.ml.predictor import CareerPredictor
from app.ml.accuracy_gate import verify_accuracy_gate
from app.services.skill_gap_service import gap_analyzer


# Canonical benchmark test profiles
BENCHMARK_PROFILES = [
    {
        "domain": "AI / ML Engineer",
        "text": "Machine Learning Engineer with expertise in PyTorch, TensorFlow, Python, Docker, Scikit-Learn, Deep Learning, MLOps.",
        "expected_top": ["ML Engineer", "AI Engineer", "Data Scientist", "AI/ML Intern"]
    },
    {
        "domain": "Data Scientist",
        "text": "Data Scientist skilled in Python, SQL, Statistics, R, Pandas, Machine Learning, Hypothesis Testing, Data Visualization.",
        "expected_top": ["Data Scientist", "Data Analyst", "ML Engineer", "AI/ML Intern"]
    },
    {
        "domain": "DevOps Engineer",
        "text": "DevOps Engineer with experience in Kubernetes, Docker, AWS, Terraform, CI/CD pipelines, Bash, Python, Linux.",
        "expected_top": ["DevOps Engineer", "Cloud Engineer", "System Administrator"]
    },
    {
        "domain": "Frontend Developer",
        "text": "Frontend Web Developer with deep expertise in React, TypeScript, JavaScript, HTML5, CSS3, Redux, Tailwind CSS.",
        "expected_top": ["Frontend Developer", "Full Stack Developer", "Software Engineer"]
    }
]


def test_regression_benchmark_profiles():
    """Verify that predictions on standard benchmark profiles match expected career categories."""
    predictor = CareerPredictor.get_instance()
    if not predictor.is_loaded:
        predictor.load_artifacts()

    for benchmark in BENCHMARK_PROFILES:
        preds = predictor.predict(raw_text=benchmark["text"], top_n=3)
        top_prediction = preds[0]["career"]
        assert top_prediction in benchmark["expected_top"], (
            f"Regression failed for domain '{benchmark['domain']}': Expected one of {benchmark['expected_top']}, got '{top_prediction}'"
        )
        assert preds[0]["confidence"] >= 50.0, f"Confidence score too low for '{benchmark['domain']}': {preds[0]['confidence']}%"


def test_regression_accuracy_gate():
    """Verify that accuracy gate threshold checks pass at >= 90.0%."""
    gate_passed = verify_accuracy_gate(threshold=90.0)
    assert gate_passed is True, "Regression Failure: Model accuracy dropped below 90.0% threshold"


def test_regression_edge_cases():
    """Verify system stability when processing edge cases (empty strings, whitespace, special chars)."""
    predictor = CareerPredictor.get_instance()
    if not predictor.is_loaded:
        predictor.load_artifacts()

    # Empty string input
    preds_empty = predictor.predict(raw_text="", top_n=3)
    assert len(preds_empty) == 3
    assert all("confidence" in p for p in preds_empty)

    # Special characters input
    preds_special = predictor.predict(raw_text="!!! $$$ ### @@@", top_n=3)
    assert len(preds_special) == 3

    # Unknown target career in gap report
    gap_unknown = gap_analyzer.analyze_gap(raw_text="", user_skills=["Python"], target_career="Quantum Specialist 9900")
    assert gap_unknown["match_score"] >= 0
    assert "target_career" in gap_unknown
