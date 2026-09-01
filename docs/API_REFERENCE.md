# CareerCast API Reference Documentation

This document provides complete technical specifications for the Python core modules and FastAPI REST API endpoints of the **CareerCast AI-Powered Career Intelligence Platform**.

---

## 🐍 Python Core SDK

### 1. `CareerPredictor`
**Module:** `backend.app.ml.predictor` / `careercast.CareerPredictor`

Singleton class managing model inference using ensemble classifiers (XGBoost, Random Forest, Logistic Regression) and Sentence-BERT embeddings.

#### Methods
- `get_instance() -> CareerPredictor`  
  Returns singleton instance.
- `load_artifacts() -> None`  
  Loads trained model binaries (`xgboost_model.pkl`, `rf_model.pkl`, `lr_model.pkl`, `tfidf_vectorizer.pkl`) and Sentence-BERT models.
- `predict(raw_text: str = "", user_skills: List[str] = None, top_n: int = 5) -> List[Dict[str, Any]]`  
  Generates Top-$N$ career predictions with composite match confidence scores (0.0% – 100.0%).

---

### 2. `SkillGapAnalyzer`
**Module:** `backend.app.services.skill_gap_service` / `careercast.gap_analyzer`

Service evaluating user skill vectors against target career canonical skill taxonomies (derived from O*NET and ESCO).

#### Methods
- `analyze_gap(raw_text: str = "", user_skills: List[str] = None, target_career: str = None) -> Dict[str, Any]`  
  Returns dictionary containing:
  - `target_career`: Evaluated target career name.
  - `match_score`: Overall percentage match score.
  - `matched_skills`: List of user skills matching target role.
  - `missing_skills`: List of missing canonical skills.
  - `skill_priorities`: List of prioritized missing skills with estimated study hours and portfolio project ideas.
  - `recommended_courses`: Curated list of course recommendations covering missing skills.

---

### 3. `ResumeParser`
**Module:** `backend.app.parser.resume_parser` / `careercast.extract_text_from_bytes`

Parsing engine utilizing PyMuPDF (`fitz`), `python-docx`, and spaCy NER for text and entity extraction.

#### Functions
- `extract_text_from_bytes(file_bytes: bytes, filename: str) -> str`  
  Parses raw file bytes (PDF, DOCX, TXT) and returns extracted plain text.
- `extract_ner_entities(text: str) -> List[Dict[str, str]]`  
  Extracts named entities (`SKILL`, `ROLE`, `EDUCATION`, `EXPERIENCE`) using fine-tuned spaCy pipeline.

---

## 🌐 FastAPI REST API Endpoints

### 1. `POST /predict`
Submit candidate resume text or skill profile to retrieve top career path predictions.

**Request Body:**
```json
{
  "text": "Experienced Python Developer proficient in SQL, PyTorch, FastAPI, and Machine Learning.",
  "top_n": 5
}
```

**Response:**
```json
{
  "top_career": "ML Engineer",
  "confidence": 95.8,
  "top1_accuracy": 95.8,
  "predictions": [
    { "career": "ML Engineer", "confidence": 95.8 },
    { "career": "AI Engineer", "confidence": 89.2 },
    { "career": "Data Scientist", "confidence": 84.5 }
  ]
}
```

---

### 2. `POST /gap-report`
Generate detailed skill gap analysis report comparing candidate skills against target career requirements.

**Request Body:**
```json
{
  "user_skills": ["Python", "SQL", "PyTorch"],
  "target_career": "ML Engineer"
}
```

**Response:**
```json
{
  "target_career": "ML Engineer",
  "match_score": 75.0,
  "coverage_ratio": 75.0,
  "matched_skills": ["Python", "SQL", "PyTorch"],
  "missing_skills": ["Docker", "MLOps", "Kubernetes"],
  "skill_priorities": [
    {
      "skill_name": "Docker",
      "priority": "High",
      "estimated_hours": 15,
      "difficulty": "Intermediate"
    }
  ]
}
```

---

### 3. `POST /recommend`
Retrieve curated course recommendations and actionable learning paths for missing skills.

**Request Body:**
```json
{
  "user_skills": ["Python", "SQL"],
  "target_career": "ML Engineer"
}
```

**Response:**
```json
{
  "target_career": "ML Engineer",
  "recommended_learning_paths": [
    {
      "course_name": "Docker for Machine Learning Engineers",
      "provider": "Coursera",
      "skill_covered": "Docker",
      "difficulty": "Intermediate"
    }
  ],
  "actionable_roadmap": [
    "Prioritize learning Docker (Est. 15 hours)"
  ]
}
```

---

### 4. `GET /mlflow/models`
Retrieve active registered model versions and validation benchmark metadata from MLflow Model Registry (`CareerCast_Recommender`).
