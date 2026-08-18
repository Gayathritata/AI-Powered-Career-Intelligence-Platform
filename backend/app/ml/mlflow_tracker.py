"""
backend/app/ml/mlflow_tracker.py

MLflow Experiment Tracker & Model Registry Manager.
Logs model metrics (Top-1 Accuracy, Top-3 Accuracy, Precision, Recall, F1 Score),
hyperparameters, and model artifacts to MLflow registry.
"""

import os
from typing import Dict, Any, Optional

try:
    import mlflow
    import mlflow.sklearn
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False


class MLflowTracker:
    """MLflow experiment logging & model registry tracker."""

    def __init__(self, experiment_name: str = "CareerCast_Model_Training"):
        self.experiment_name = experiment_name
        self.enabled = MLFLOW_AVAILABLE

        if self.enabled:
            try:
                mlflow.set_experiment(self.experiment_name)
                print(f"[MLflow] Experiment set to: '{self.experiment_name}'")
            except Exception as e:
                print(f"[MLflow] Warning: Could not initialize MLflow experiment: {e}")
                self.enabled = False
        else:
            print("[MLflow] Notice: MLflow package not detected. Falling back to local artifact logging.")

    def log_model_run(
        self,
        model_name: str,
        model_object: Any,
        params: Dict[str, Any],
        metrics: Dict[str, float],
        register_as_best: bool = False
    ) -> Optional[str]:
        """
        Logs hyperparameters, metrics, and serialized model object to MLflow tracking.
        Registers the model in MLflow Model Registry if register_as_best is True.
        """
        if not self.enabled:
            return None

        try:
            with mlflow.start_run(run_name=f"Train_{model_name}") as run:
                # Log hyperparameters
                mlflow.log_params(params)

                # Log evaluation metrics
                mlflow.log_metrics(metrics)

                # Log model artifact
                mlflow.sklearn.log_model(
                    sk_model=model_object,
                    artifact_path="model",
                    registered_model_name="CareerCast-Predictor" if register_as_best else None
                )

                run_id = run.info.run_id
                print(f"[MLflow] Logged run '{model_name}' successfully. Run ID: {run_id}")
                return run_id
        except Exception as e:
            print(f"[MLflow] Warning: Failed to log run '{model_name}': {e}")
            return None


# Global tracker instance
mlflow_tracker = MLflowTracker()
