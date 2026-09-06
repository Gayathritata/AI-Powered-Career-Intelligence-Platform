"""
backend/app/ml/predictor.py

Inference engine incorporating Logistic Regression, Random Forest, XGBoost,
Sentence-BERT skill vector embeddings, and Top-K multi-metric career ranking.
"""

import os
import re
import joblib
import numpy as np
from typing import List, Dict, Any, Optional

from app.ml.sbert_embedder import SkillSBERTEmbedder, embedder as default_embedder
from app.ml.ranking_engine import TopKCareerRankingEngine, CAREER_REQUIRED_SKILLS

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODELS_DIR = os.path.join(BASE_DIR, "trained_models")

LR_MODEL_PATH = os.path.join(MODELS_DIR, "logistic_regression_model.joblib")
RF_MODEL_PATH = os.path.join(MODELS_DIR, "rf_model.joblib")
XGB_MODEL_PATH = os.path.join(MODELS_DIR, "xgb_model.joblib")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.joblib")

RESUME_BOILERPLATE = {
    "resume", "curriculum", "vitae", "cv", "page", "email", "phone",
    "mobile", "address", "contact", "profile", "summary", "objective",
    "duties", "responsibilities", "responsible", "work", "experience"
}

PRESERVED_TERMS = {
    "hr", "it", "qa", "ui", "ux", "ai", "ml", "pr", "ca", "ar", "vr", "db",
    "js", "ts", "r", "c", "3d", "2d", "bi", "os", "ip", "vp", "ceo", "cto",
    "cfo", "coo", "seo", "sem", "crm", "erp", "gis", "cad", "cam"
}


def clean_input_text(text: str) -> str:
    """Preprocess raw input text identically to training step."""
    if not isinstance(text, str) or not text:
        return ""
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"\+?\d[\d\s\-]{7,}\d", " ", text)

    text = text.replace("c++", " cpp ")
    text = text.replace("c#", " csharp ")
    text = text.replace(".net", " dotnet ")
    text = text.replace("node.js", " nodejs ")
    text = text.replace("react.js", " reactjs ")
    text = text.replace("vue.js", " vuejs ")
    text = text.replace("angular.js", " angularjs ")

    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = text.split()

    cleaned_tokens = []
    for token in tokens:
        if token in RESUME_BOILERPLATE:
            continue
        if len(token) <= 2 and token not in PRESERVED_TERMS:
            continue
        cleaned_tokens.append(token)

    return " ".join(cleaned_tokens)


class CareerPredictor:
    """Predictor class using ensemble ML models, SBERT vectorizer & Top-K Ranking Engine."""

    _instance = None

    def __init__(self):
        self.lr_model = None
        self.rf_model = None
        self.xgb_model = None
        self.vectorizer = None
        self.label_encoder = None
        self.is_loaded = False
        self.ranking_engine = TopKCareerRankingEngine(embedder=default_embedder)
        self.load_artifacts()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = CareerPredictor()
        return cls._instance

    def load_artifacts(self):
        """Load model, vectorizer, and label encoder from disk (idempotent)."""
        if self.is_loaded:
            return True

        if os.path.exists(VECTORIZER_PATH) and os.path.exists(ENCODER_PATH):
            try:
                self.vectorizer = joblib.load(VECTORIZER_PATH)
                self.label_encoder = joblib.load(ENCODER_PATH)

                import gc

                # Primary high-precision classifiers
                if os.path.exists(XGB_MODEL_PATH):
                    try:
                        self.xgb_model = joblib.load(XGB_MODEL_PATH)
                    except Exception as err:
                        print(f"[WARN] Could not load XGBoost model: {err}")
                
                if os.path.exists(LR_MODEL_PATH):
                    try:
                        self.lr_model = joblib.load(LR_MODEL_PATH)
                    except Exception as err:
                        print(f"[WARN] Could not load Logistic Regression model: {err}")

                # Optional ensemble classifier (Random Forest)
                if os.path.exists(RF_MODEL_PATH):
                    try:
                        self.rf_model = joblib.load(RF_MODEL_PATH)
                    except Exception as err:
                        print(f"[WARN] Random Forest model omitted to conserve memory: {err}")

                self.is_loaded = True
                print("[OK] CareerPredictor model artifacts loaded successfully.")
                gc.collect()
                return True
            except Exception as e:
                print(f"[ERROR] Failed to load model artifacts: {e}")
                self.is_loaded = False
                return False
        else:
            print("[WARN] Model artifacts not found. Run training scripts first.")
            self.is_loaded = False
            return False

    def get_ensemble_probabilities(self, text: str) -> Dict[str, float]:
        """Obtain combined classification probabilities across available classifiers."""
        if not self.is_loaded or self.vectorizer is None or self.label_encoder is None:
            return {}

        cleaned = clean_input_text(text)
        if not cleaned:
            return {}

        tfidf_vec = self.vectorizer.transform([cleaned])
        classes = self.label_encoder.classes_

        prob_vectors = []

        # 1. XGBoost probabilities
        if self.xgb_model is not None:
            try:
                prob_vectors.append(self.xgb_model.predict_proba(tfidf_vec)[0])
            except Exception:
                pass

        # 2. Random Forest probabilities
        if self.rf_model is not None:
            try:
                prob_vectors.append(self.rf_model.predict_proba(tfidf_vec)[0])
            except Exception:
                pass

        # 3. Logistic Regression probabilities
        if self.lr_model is not None:
            try:
                prob_vectors.append(self.lr_model.predict_proba(tfidf_vec)[0])
            except Exception:
                pass

        if not prob_vectors:
            return {cls_name: 1.0 / len(classes) for cls_name in classes}

        # Average probability vector across ensemble
        avg_proba = np.mean(prob_vectors, axis=0)
        return {classes[idx]: float(avg_proba[idx]) for idx in range(len(classes))}

    def predict_top5_roles(
        self, raw_text: str, user_skills: Optional[List[str]] = None, top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Calculates Top N career predictions using ensemble ML probabilities,
        SBERT skill embeddings, and multi-metric ranking engine.
        """
        if user_skills is None:
            user_skills = []

        class_probs = self.get_ensemble_probabilities(raw_text)

        # Fallback to category skill mapping if model not yet trained
        if not class_probs:
            all_cats = list(CAREER_REQUIRED_SKILLS.keys())
            class_probs = {c: 1.0 / len(all_cats) for c in all_cats}

        ranked_results = self.ranking_engine.rank_careers(
            user_skills=user_skills,
            user_text=raw_text,
            class_probabilities=class_probs,
            top_k=top_n
        )

        formatted_predictions = []
        for r in ranked_results:
            formatted_predictions.append({
                "career": r["career_title"],
                "confidence": r["match_score"],
                "model_confidence": r["confidence_score"],
                "skill_alignment_score": r["skill_alignment_score"],
                "matched_skills": r["matched_skills"],
                "missing_skills": r["missing_skills"],
                "required_skills": r["required_skills"]
            })

        return formatted_predictions

    def predict(self, raw_text: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """Predict top N career categories."""
        return self.predict_top5_roles(raw_text, user_skills=None, top_n=top_n)
