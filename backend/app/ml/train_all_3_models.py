import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "resume", "it_resumes_cleaned.csv")
MODELS_DIR = os.path.join(BASE_DIR, "trained_models")
os.makedirs(MODELS_DIR, exist_ok=True)

CATEGORY_MAP = {
    "Frontend Developer": "Software & Web Development",
    "Web Developer": "Software & Web Development",
    "Java Developer": "Software & Web Development",
    "Python Developer": "Software & Web Development",
    "Software Engineer": "Software & Web Development",
    "SQL Developer": "Database & Data Engineering",
    "Database Administrator": "Database & Data Engineering",
    "Data Engineer": "Database & Data Engineering",
    "Business Analyst": "Business Intelligence & Analytics",
    "Business Intelligence Analyst": "Business Intelligence & Analytics",
    "System Administrator": "IT Infrastructure & System Support",
    "Technical Support Engineer": "IT Infrastructure & System Support",
    "Network Engineer": "IT Infrastructure & System Support",
    "Project Manager": "IT Project Management",
    "Cybersecurity Analyst": "Cybersecurity & Security"
}

def train_and_eval_all_models():
    print(f"[INFO] Loading IT dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH).dropna(subset=["Cleaned_Resume", "Cleaned_Category"]).copy()

    # Consolidate overlapping categories to resolve label ambiguity
    df["Consolidated_Category"] = df["Cleaned_Category"].map(CATEGORY_MAP).fillna(df["Cleaned_Category"])
    
    label_encoder = LabelEncoder()
    df["label"] = label_encoder.fit_transform(df["Consolidated_Category"])
    
    X = df["Cleaned_Resume"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )

    print("[INFO] Vectorizing TF-IDF features...")
    tfidf = TfidfVectorizer(max_features=20000, ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
    X_train_vec = tfidf.fit_transform(X_train)
    X_test_vec = tfidf.transform(X_test)

    results = {}

    # 1. Logistic Regression
    print("\n[INFO] Training 1/3: Logistic Regression Classifier...")
    lr = LogisticRegression(max_iter=1000, C=5.0, random_state=42)
    lr.fit(X_train_vec, y_train)
    lr_preds = lr.predict(X_test_vec)
    lr_probs = lr.predict_proba(X_test_vec)
    
    lr_top1 = accuracy_score(y_test, lr_preds) * 100
    lr_top3 = np.mean([y_test.iloc[i] in np.argsort(lr_probs[i])[-3:] for i in range(len(y_test))]) * 100
    lr_f1 = f1_score(y_test, lr_preds, average="weighted") * 100
    lr_prec = precision_score(y_test, lr_preds, average="weighted") * 100

    results["Logistic Regression"] = {
        "top1_accuracy": round(lr_top1, 2),
        "top3_accuracy": round(lr_top3, 2),
        "precision": round(lr_prec, 2),
        "recall": round(lr_top1, 2),
        "f1_score": round(lr_f1, 2)
    }

    # 2. Random Forest
    print("[INFO] Training 2/3: Random Forest Classifier...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=25, random_state=42, n_jobs=-1)
    rf.fit(X_train_vec, y_train)
    rf_preds = rf.predict(X_test_vec)
    rf_probs = rf.predict_proba(X_test_vec)

    rf_top1 = accuracy_score(y_test, rf_preds) * 100
    rf_top3 = np.mean([y_test.iloc[i] in np.argsort(rf_probs[i])[-3:] for i in range(len(y_test))]) * 100
    rf_f1 = f1_score(y_test, rf_preds, average="weighted") * 100
    rf_prec = precision_score(y_test, rf_preds, average="weighted") * 100

    results["Random Forest"] = {
        "top1_accuracy": round(rf_top1, 2),
        "top3_accuracy": round(rf_top3, 2),
        "precision": round(rf_prec, 2),
        "recall": round(rf_top1, 2),
        "f1_score": round(rf_f1, 2)
    }

    # 3. XGBoost
    print("[INFO] Training 3/3: XGBoost Classifier...")
    xgb = XGBClassifier(n_estimators=150, max_depth=7, learning_rate=0.1, subsample=0.85, colsample_bytree=0.85, random_state=42, n_jobs=-1)
    xgb.fit(X_train_vec, y_train)
    xgb_preds = xgb.predict(X_test_vec)
    xgb_probs = xgb.predict_proba(X_test_vec)

    xgb_top1 = accuracy_score(y_test, xgb_preds) * 100
    xgb_top3 = np.mean([y_test.iloc[i] in np.argsort(xgb_probs[i])[-3:] for i in range(len(y_test))]) * 100
    xgb_f1 = f1_score(y_test, xgb_preds, average="weighted") * 100
    xgb_prec = precision_score(y_test, xgb_preds, average="weighted") * 100

    results["XGBoost"] = {
        "top1_accuracy": round(xgb_top1, 2),
        "top3_accuracy": round(xgb_top3, 2),
        "precision": round(xgb_prec, 2),
        "recall": round(xgb_top1, 2),
        "f1_score": round(xgb_f1, 2)
    }

    # Serialize models & vectorizers
    joblib.dump(lr, os.path.join(MODELS_DIR, "logistic_regression_model.joblib"))
    joblib.dump(rf, os.path.join(MODELS_DIR, "rf_model.joblib"))
    joblib.dump(xgb, os.path.join(MODELS_DIR, "xgb_model.joblib"))
    joblib.dump(tfidf, os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib"))
    joblib.dump(label_encoder, os.path.join(MODELS_DIR, "label_encoder.joblib"))

    metrics_path = os.path.join(MODELS_DIR, "accuracy_results.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n========================================================")
    print("ALL 3 MODELS VALIDATION ACCURACY RESULTS (IT DATASET):")
    print("========================================================")
    print(json.dumps(results, indent=2))
    print(f"\n[OK] Models and evaluation results exported to: {MODELS_DIR}")

if __name__ == "__main__":
    train_and_eval_all_models()

