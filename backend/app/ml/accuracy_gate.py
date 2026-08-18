"""
backend/app/ml/accuracy_gate.py

Automated ML Accuracy Gate Script for CI/CD Pipeline.
Checks trained model evaluation metrics against strict accuracy threshold.
Exits with 0 if accuracy gate is satisfied, exits with 1 if accuracy falls below threshold.
"""

import os
import sys
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
METRICS_PATH = os.path.join(BASE_DIR, "trained_models", "accuracy_results.json")
DEFAULT_THRESHOLD = 90.0


def verify_accuracy_gate(threshold: float = DEFAULT_THRESHOLD) -> bool:
    """Verifies that best-performing ensemble model meets the target accuracy gate."""
    print("========================================================")
    print(f"AUTOMATED CI ML ACCURACY GATE CHECK (Target >= {threshold}%)")
    print("========================================================")

    if not os.path.exists(METRICS_PATH):
        print(f"[ACCURACY GATE FAILED] Metrics file not found at: {METRICS_PATH}")
        print("Run model training before executing accuracy gate.")
        return False

    try:
        with open(METRICS_PATH, "r", encoding="utf-8") as f:
            metrics_data = json.load(f)

        xgb_acc = metrics_data.get("XGBoost", {}).get("top1_accuracy")
        rf_acc = metrics_data.get("Random Forest", {}).get("top1_accuracy")
        lr_acc = metrics_data.get("Logistic Regression", {}).get("top1_accuracy")

        best_acc = max(filter(None, [xgb_acc, rf_acc, lr_acc]), default=0.0)

        print(f"XGBoost Top-1 Accuracy:            {xgb_acc}%")
        print(f"Random Forest Top-1 Accuracy:      {rf_acc}%")
        print(f"Logistic Regression Top-1 Accuracy:{lr_acc}%")
        print(f"Highest Model Accuracy:            {best_acc}%")
        print(f"Target Accuracy Gate Threshold:    {threshold}%")
        print("--------------------------------------------------------")

        if best_acc >= threshold:
            print(f"[ACCURACY GATE PASSED] Model accuracy {best_acc}% >= {threshold}% target threshold!")
            return True
        else:
            print(f"[ACCURACY GATE FAILED] Best model accuracy {best_acc}% is below {threshold}% threshold.")
            return False

    except Exception as e:
        print(f"[ACCURACY GATE ERROR] Exception encountered while checking metrics: {e}")
        return False


if __name__ == "__main__":
    target = float(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_THRESHOLD
    passed = verify_accuracy_gate(target)
    if not passed:
        sys.exit(1)
    sys.exit(0)
