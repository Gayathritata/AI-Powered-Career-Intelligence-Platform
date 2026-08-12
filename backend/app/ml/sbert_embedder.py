"""
backend/app/ml/sbert_embedder.py

Skill Embedding Vectorization using Sentence-BERT (SBERT).
Provides dense contextual representations for skills and job descriptions,
enabling fine-grained semantic similarity matching.
"""

import os
import logging
import numpy as np
from typing import List, Union, Dict

logger = logging.getLogger(__name__)

# Singleton holder for SentenceTransformer model
_SBERT_MODEL = None
_SBERT_ATTEMPTED = False
MODEL_NAME = "all-MiniLM-L6-v2"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
FINE_TUNED_MODEL_PATH = os.path.join(BASE_DIR, "trained_models", "sbert_job_model")


def get_sbert_model():
    """Lazy loader for SentenceTransformer model with strict memory controls for 512MB RAM limits."""
    global _SBERT_MODEL, _SBERT_ATTEMPTED
    if not _SBERT_ATTEMPTED:
        _SBERT_ATTEMPTED = True

        # Check if user explicitly enabled low-memory mode for 512MB RAM tier
        if os.environ.get("LOW_MEMORY_MODE", "false").lower() == "true":
            print("[SBERT] LOW_MEMORY_MODE is enabled. Using lightweight semantic vector fallback.")
            _SBERT_MODEL = None
            return None

        try:
            import gc
            try:
                import torch
                torch.set_num_threads(1)
                if hasattr(torch, "set_num_interop_threads"):
                    torch.set_num_interop_threads(1)
            except Exception:
                pass

            from sentence_transformers import SentenceTransformer
            config_path = os.path.join(FINE_TUNED_MODEL_PATH, "config.json")
            if os.path.exists(FINE_TUNED_MODEL_PATH) and os.path.exists(config_path):
                try:
                    print(f"[SBERT] Loading fine-tuned domain model from: '{FINE_TUNED_MODEL_PATH}'...")
                    _SBERT_MODEL = SentenceTransformer(FINE_TUNED_MODEL_PATH)
                    print("[SBERT] Fine-tuned domain SentenceTransformer loaded successfully.")
                except Exception as ft_err:
                    print(f"[WARN] Failed to load fine-tuned model ({ft_err}). Falling back to base model '{MODEL_NAME}'...")
                    _SBERT_MODEL = SentenceTransformer(MODEL_NAME)
                    print("[SBERT] Base SentenceTransformer model loaded successfully.")
            else:
                print(f"[SBERT] Loading base SentenceTransformer model: '{MODEL_NAME}'...")
                _SBERT_MODEL = SentenceTransformer(MODEL_NAME)
                print("[SBERT] Base SentenceTransformer model loaded successfully.")

            gc.collect()
        except Exception as e:
            print(f"[SBERT] SentenceTransformer unavailable / Memory constrained ({e}). Using semantic vector fallback.")
            _SBERT_MODEL = None
            gc.collect()
    return _SBERT_MODEL


class SkillSBERTEmbedder:
    """Handles skill vectorization and semantic similarity calculations."""

    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        """Encode single string or list of strings into dense 384-dim vectors."""
        model = get_sbert_model()
        if isinstance(texts, str):
            texts = [texts]

        if not texts:
            return np.zeros((0, 384), dtype=np.float32)

        if model is not None:
            embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
            return embeddings
        else:
            # Fallback: Hash-based mock embeddings for testing environments without PyTorch/Transformers
            embeddings = []
            for t in texts:
                vec = np.zeros(384, dtype=np.float32)
                words = t.lower().split()
                for i, w in enumerate(words):
                    idx = abs(hash(w)) % 384
                    vec[idx] += 1.0 / (i + 1)
                norm = np.linalg.norm(vec)
                if norm > 0:
                    vec = vec / norm
                embeddings.append(vec)
            return np.array(embeddings)

    def compute_cosine_similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """Compute cosine similarity between two 1D embedding vectors."""
        if vec_a is None or vec_b is None:
            return 0.0
        vec_a = np.asarray(vec_a).flatten()
        vec_b = np.asarray(vec_b).flatten()

        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        sim = float(np.dot(vec_a, vec_b) / (norm_a * norm_b))
        return max(0.0, min(1.0, sim))

    def evaluate_skill_semantic_alignment(
        self, user_skills: List[str], target_required_skills: List[str]
    ) -> Dict[str, Union[float, List[str]]]:
        """
        Computes semantic alignment score between user skills and target required skills
        using Sentence-BERT embeddings. Maps each required skill to closest user skill.
        """
        if not user_skills or not target_required_skills:
            return {
                "semantic_alignment_score": 0.0,
                "matched_skills": [],
                "missing_skills": target_required_skills,
                "coverage_ratio": 0.0
            }

        user_vecs = self.encode(user_skills)
        req_vecs = self.encode(target_required_skills)

        matched_skills = []
        missing_skills = []
        similarity_scores = []

        # Threshold for considering a skill semantically matched
        SIM_THRESHOLD = 0.55

        for req_idx, req_skill in enumerate(target_required_skills):
            req_v = req_vecs[req_idx]
            best_sim = 0.0
            best_match = None

            for u_idx, u_skill in enumerate(user_skills):
                u_v = user_vecs[u_idx]
                sim = self.compute_cosine_similarity(req_v, u_v)
                if sim > best_sim:
                    best_sim = sim
                    best_match = u_skill

            similarity_scores.append(best_sim)
            if best_sim >= SIM_THRESHOLD:
                matched_skills.append(req_skill)
            else:
                missing_skills.append(req_skill)

        alignment_score = float(np.mean(similarity_scores)) if similarity_scores else 0.0
        coverage = float(len(matched_skills) / len(target_required_skills)) if target_required_skills else 0.0

        return {
            "semantic_alignment_score": round(alignment_score * 100, 2),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "coverage_ratio": round(coverage * 100, 2)
        }


# Default instance
embedder = SkillSBERTEmbedder()
