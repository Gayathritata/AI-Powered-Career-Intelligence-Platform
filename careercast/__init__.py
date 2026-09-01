"""
CareerCast: AI-Powered Career Recommendation System
Package entrypoint exposing predictor, gap analyzer, and parser modules.
"""

__version__ = "1.0.0"
__author__ = "CareerCast Team"

import sys
import os

# Add backend directory to sys.path if not present
PACKAGE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(PACKAGE_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.ml.predictor import CareerPredictor
from app.services.skill_gap_service import gap_analyzer
from app.parser.resume_parser import extract_text_from_bytes, extract_ner_entities

__all__ = [
    "CareerPredictor",
    "gap_analyzer",
    "extract_text_from_bytes",
    "extract_ner_entities",
]
