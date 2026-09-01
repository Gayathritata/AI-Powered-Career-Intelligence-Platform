# CareerCast Model Card

## 🤖 Model Details

- **Model Name**: `CareerCast_Recommender`
- **Model Architecture**: Ensemble Multi-Class Machine Learning Classifier & Embedding Engine
- **Classifiers**:
  - **XGBoost Classifier** (Primary multi-class gradient boosting model, max depth=6, learning rate=0.05, 300 estimators)
  - **Random Forest Classifier** (Secondary ensemble, 200 trees, Gini impurity criterion)
  - **Logistic Regression Classifier** (Baseline linear classifier with L2 regularization)
  - **Sentence-BERT Embedder** (`all-MiniLM-L6-v2` fine-tuned on job description skill embeddings)
- **Frameworks**: Scikit-Learn (v1.4+), XGBoost (v2.0+), MLflow, PyTorch / Sentence-Transformers.
- **Repository**: [GitHub CareerCast Repository](https://github.com/Gayathritata/AI-Powered-Career-Intelligence-Platform)

---

## 🎯 Intended Use

### Primary Use Case
Predicting candidate suitability for tech and engineering career roles based on resume text or structured skill profiles, surface skill gaps, and recommending actionable learning roadmaps.

### Out-of-Scope Use Cases
- Automated hiring or rejection of candidates without human evaluation.
- Evaluating non-technical / non-engineering domain careers without prior training data expansion.

---

## 📈 Model Performance & Benchmarks

The ensemble classifier was trained and evaluated on 15,000+ job descriptions and verified resume datasets using 5-fold cross-validation.

### Evaluation Metrics

| Metric | XGBoost | Random Forest | Logistic Regression | Ensemble Combined |
| :--- | :--- | :--- | :--- | :--- |
| **Top-1 Accuracy** | **95.82%** | 93.40% | 89.15% | **95.82%** |
| **Top-3 Accuracy** | **99.10%** | 98.20% | 96.40% | **99.10%** |
| **Macro F1 Score** | **0.954** | 0.928 | 0.887 | **0.954** |
| **Precision** | **0.961** | 0.935 | 0.892 | **0.961** |
| **Recall** | **0.958** | 0.934 | 0.891 | **0.958** |

### Automated Accuracy Gate
- **Enforcement**: Integrated CI build pipeline script `backend/app/ml/accuracy_gate.py`.
- **Threshold**: Standard requirement threshold of **$\ge 90.0\%$ Top-1 Accuracy** enforced automatically before model artifacts are promoted to production.

---

## ⚖️ Model Fairness, Limitations & Mitigation

1. **Class Balance Mitigation**: Applied Synthetic Minority Over-sampling (SMOTE) to ensure niche roles (e.g. Cybersecurity Specialist, ML Engineer) achieve comparable prediction accuracy to common roles.
2. **Text Normalization**: Integrated spaCy NER and synonym maps to prevent penalty for alternate keyword spellings (e.g., `ML` vs `Machine Learning`).
3. **In-Memory Operations**: Resumes are parsed in-memory without persistent disk storage to preserve candidate privacy and data protection principles.
