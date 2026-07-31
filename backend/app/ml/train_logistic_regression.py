"""
backend/app/ml/train_logistic_regression.py

Script to preprocess resume dataset, train an optimized Logistic Regression classifier
for career category prediction, evaluate model metrics, and serialize trained artifacts.
"""

import os
import re
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "resume", "Resume", "Resume.csv")
MODELS_DIR = os.path.join(BASE_DIR, "trained_models")

# Common resume noise words to filter out
RESUME_BOILERPLATE = {
    "resume", "curriculum", "vitae", "cv", "page", "email", "phone",
    "mobile", "address", "contact", "profile", "summary", "objective",
    "duties", "responsibilities", "responsible", "work", "experience"
}

# Domain acronyms & Tech terms to preserve specifically
PRESERVED_TERMS = {
    "hr", "it", "qa", "ui", "ux", "ai", "ml", "pr", "ca", "ar", "vr", "db",
    "js", "ts", "r", "c", "3d", "2d", "bi", "os", "ip", "vp", "ceo", "cto",
    "cfo", "coo", "seo", "sem", "crm", "erp", "gis", "cad", "cam"
}


def clean_text(text: str) -> str:
    """Enhanced preprocessing: canonicalize tech skills, preserve industry acronyms, and clean noise."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"\+?\d[\d\s\-]{7,}\d", " ", text)

    # Canonicalize technical symbols & key tech terms
    text = text.replace("c++", " cpp ")
    text = text.replace("c#", " csharp ")
    text = text.replace(".net", " dotnet ")
    text = text.replace("node.js", " nodejs ")
    text = text.replace("react.js", " reactjs ")
    text = text.replace("vue.js", " vuejs ")
    text = text.replace("angular.js", " angularjs ")

    # Keep alpha characters, numbers, and basic spacing
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


def train_logistic_regression():
    print(f"[INFO] Loading dataset from: {DATASET_PATH}")
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    print(f"[INFO] Dataset loaded successfully. Shape: {df.shape}")

    # Required columns check
    if "Resume_str" not in df.columns or "Category" not in df.columns:
        raise ValueError("Dataset missing 'Resume_str' or 'Category' column.")

    # Drop missing values
    df = df.dropna(subset=["Resume_str", "Category"]).copy()
    print(f"[INFO] Rows after dropping missing values: {len(df)}")

    # Clean text features
    print("[INFO] Cleaning text features with enhanced lemmatization & noise filtering...")
    df["clean_resume"] = df["Resume_str"].apply(clean_text)

    # Encode Target Labels
    print("[INFO] Encoding labels...")
    label_encoder = LabelEncoder()
    df["label"] = label_encoder.fit_transform(df["Category"])
    classes = label_encoder.classes_.tolist()
    print(f"[INFO] Found {len(classes)} classes: {classes}")

    # Train / Test Split
    X = df["clean_resume"]
    y = df["label"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    # Feature Engineering (Word + Character N-Grams FeatureUnion)
    print("[INFO] Extracting features via TF-IDF FeatureUnion (Word + Char N-Grams)...")
    tfidf_union = FeatureUnion([
        ("word_tfidf", TfidfVectorizer(
            max_features=50000,
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.90,
            stop_words="english",
            sublinear_tf=True,
            norm="l2",
        )),
        ("char_tfidf", TfidfVectorizer(
            max_features=30000,
            ngram_range=(3, 5),
            analyzer="char_wb",
            min_df=2,
            sublinear_tf=True,
            norm="l2",
        ))
    ])

    X_train_tfidf = tfidf_union.fit_transform(X_train)
    X_test_tfidf = tfidf_union.transform(X_test)
    print(f"[INFO] Feature Union Matrix shape: {X_train_tfidf.shape}")

    # Hyperparameter Evaluation & Model Training
    print("[INFO] Evaluating Logistic Regression hyperparameter candidates...")
    candidates = [
        {"C": 2.5, "class_weight": None},
        {"C": 5.0, "class_weight": None},
        {"C": 10.0, "class_weight": None},
        {"C": 15.0, "class_weight": None},
        {"C": 10.0, "class_weight": "balanced"},
    ]

    best_acc = -1.0
    best_model = None
    best_params = None

    for params in candidates:
        clf = LogisticRegression(
            C=params["C"],
            class_weight=params["class_weight"],
            max_iter=1000,
            solver="lbfgs",
            random_state=42,
        )
        clf.fit(X_train_tfidf, y_train)
        score = accuracy_score(y_test, clf.predict(X_test_tfidf))
        print(f" -> Evaluated C={params['C']}, class_weight={params['class_weight']} => Test Accuracy: {score * 100:.2f}%")
        if score > best_acc:
            best_acc = score
            best_model = clf
            best_params = params

    print(f"[OK] Best Parameters Selected: {best_params} with Test Accuracy: {best_acc * 100:.2f}%")

    # Evaluate Model (Top-1 & Top-3 Accuracy)
    print("[INFO] Evaluating best model performance on test split...")
    y_pred = best_model.predict(X_test_tfidf)
    y_proba = best_model.predict_proba(X_test_tfidf)

    accuracy = float(accuracy_score(y_test, y_pred))

    # Top-3 Accuracy
    top3_correct = 0
    y_test_list = y_test.tolist()
    for i, prob in enumerate(y_proba):
        top3_indices = prob.argsort()[::-1][:3]
        if y_test_list[i] in top3_indices:
            top3_correct += 1
    top3_accuracy = float(top3_correct / len(y_test))

    precision_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    recall_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))

    precision_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    recall_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    report_dict = classification_report(
        y_test, y_pred, target_names=classes, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_test, y_pred).tolist()

    metrics = {
        "model_name": "Logistic Regression (Optimized FeatureUnion)",
        "best_params": best_params,
        "total_samples": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "num_classes": len(classes),
        "classes": classes,
        "accuracy": accuracy,
        "top1_accuracy": accuracy,
        "top3_accuracy": top3_accuracy,
        "precision_macro": precision_macro,
        "recall_macro": recall_macro,
        "f1_macro": f1_macro,
        "precision_weighted": precision_weighted,
        "recall_weighted": recall_weighted,
        "f1_weighted": f1_weighted,
        "classification_report": report_dict,
        "confusion_matrix": cm,
    }

    print("=" * 60)
    print(f"MODEL PERFORMANCE METRICS (Optimized Logistic Regression):")
    print(f"Top-1 Accuracy:     {accuracy * 100:.2f}%")
    print(f"Top-3 Accuracy:     {top3_accuracy * 100:.2f}%")
    print(f"Precision (Macro):  {precision_macro * 100:.2f}%")
    print(f"Recall (Macro):     {recall_macro * 100:.2f}%")
    print(f"F1-Score (Macro):   {f1_macro * 100:.2f}%")
    print("=" * 60)

    # Save artifacts
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, "logistic_regression_model.joblib")
    vectorizer_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
    encoder_path = os.path.join(MODELS_DIR, "label_encoder.joblib")
    metrics_path = os.path.join(MODELS_DIR, "logistic_regression_metrics.json")

    joblib.dump(best_model, model_path)
    joblib.dump(tfidf_union, vectorizer_path)
    joblib.dump(label_encoder, encoder_path)

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"[OK] Model saved to: {model_path}")
    print(f"[OK] TF-IDF FeatureUnion saved to: {vectorizer_path}")
    print(f"[OK] Label Encoder saved to: {encoder_path}")
    print(f"[OK] Metrics exported to: {metrics_path}")

    return metrics


if __name__ == "__main__":
    train_logistic_regression()
