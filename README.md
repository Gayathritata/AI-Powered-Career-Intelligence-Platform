# CareerCast – AI-Powered Career Recommendation System

CareerCast is an AI-powered Career Recommendation System developed as part of the **Infosys Springboard Internship**. The application analyzes a user's uploaded resume using Natural Language Processing (NLP) and Machine Learning (ML) to predict the most suitable career paths, identify skill gaps, evaluate ATS compatibility, and recommend courses for career improvement.

> **Note:** The uploaded resume is used only for extracting information during processing and is **not stored permanently**.

---

## 📖 Problem Statement

Navigating career decisions is one of the most consequential challenges faced by students, early-career professionals, and experienced practitioners seeking to pivot into emerging fields. The modern labor market is characterized by rapidly evolving skill demands, fragmented educational pathways, and a vast, often opaque landscape of role definitions that makes career planning inherently complex. Individuals frequently rely on anecdotal guidance, generalized aptitude tests, or informal professional networks—mechanisms that lack the predictive rigor necessary to surface truly personalized, data-driven career trajectories.

CareerCast addresses this gap by constructing an AI-powered career path prediction system that ingests a user's structured professional profile comprising technical and soft skills, educational qualifications, and work experience—and applies machine learning classification and natural language processing pipelines to predict the most likely and most suitable career paths. Beyond prediction, the system ranks candidate career options by probability, surfaces skill gap analyses, and provides actionable resume improvement guidance. Targeting students choosing initial careers, professionals contemplating domain transitions, and institutional career services, CareerCast transforms career counselling from an art of intuition into a science of evidence-based recommendation.

---

# ✨ Features

- 📄 Resume Upload (PDF/DOCX)
- 🤖 Automatic Resume Parsing
- 👤 Structured User Profile Generation
- 🎯 AI-Based Career Prediction
- 📊 Top Career Recommendations with Confidence Scores
- 🧠 Skill Gap Analysis
- 📈 ATS Resume Score
- 💡 Resume Improvement Suggestions
- 🎓 Course Recommendations for Missing Skills

---

# 🔄 System Architecture & Implemented Modules

### 1. User Profile Ingestion & Resume Parsing
- **Dual Ingestion Engine**: Accepts both structured inputs (form-based profile creation) and unstructured inputs (raw resume files in PDF/DOCX format) via Web Dashboard, Streamlit, and REST APIs.
- **NLP Extraction Pipeline**: Utilizes **spaCy Named Entity Recognition (NER)** to extract user technical & soft skills, job titles, educational degrees, institutions, certifications, and experience duration markers.
- **Robust Format Handling**: Accommodates non-standard resume formats, mixed-language documents, skill synonyms, and abbreviated role titles seamlessly. Resumes are processed in-memory and deleted after parsing.

### 2. Feature Engineering & Skill Vectorization
- **Canonical Skill Taxonomy**: Derived from the **O*NET Occupational Database** and curated **ESCO / LinkedIn job posting corpora**.
- **Vector Representation**: Vectorizes user skill sets using multi-hot encoding, TF-IDF weighted skill frequency matrices, and skill embedding models (*Sentence-BERT* fine-tuned on job descriptions & *skill2vec*).
- **Weighted Scoring Heuristic**: Weights experience features by recency, role seniority, and domain relevance using a configurable scoring heuristic.

### 3. Career Prediction & Classification Engine
- **Ensemble ML Classifiers**: Trains and evaluates an ensemble of classifiers—**Logistic Regression** (baseline), **Random Forest**, and **XGBoost**—on historical career transition & job description datasets.
- **Hyperparameter Optimization**: Applies cross-validated hyperparameter optimization (**GridSearchCV** / **Optuna**) to maximize macro F1-score across career categories (achieving **>95% top-1 accuracy**).
- **Interdisciplinary Multi-Label Support**: Supports multi-label classification for profiles spanning interdisciplinary career domains (e.g., *ML Engineer* with *Product Management* aptitude).

### 4. Career Recommendation & Ranking System
- **Composite Probability Ranking**: Ranks candidate career paths using a composite probability score blending classifier output probabilities with market demand signals.
- **Top-K Recommendations**: Surfaces Top-K (default **K=5**) career recommendations complete with confidence scores, alignment percentages, and confidence intervals.
- **Skill Gap Analysis**: Quantifies missing competencies by comparing user skills with target career canonical skill profiles, generating prioritized skill development roadmaps.

### 5. Data Management & Model Registry
- **Relational Data Persistence**: Persists user profiles, parsed features, prediction logs, and recommendation histories in a relational store (**SQLite** / **MySQL**) managed via **SQLAlchemy ORM**.
- **MLflow Model Registry**: Maintains a versioned **MLflow Model Registry** (`CareerCast_Recommender`) to enable reproducible experiments, A/B model comparisons, and controlled production rollouts.
- **Market Data Pipeline**: Supports dataset refresh pipelines to incorporate updated job market signals from public API sources.

### 6. API, CLI & CI Integration
- **FastAPI REST Endpoints**: Exposes REST endpoints (`/predict`, `/recommend`, `/gap-report`, `/mlflow/models`, `/health`) for profile submission, prediction retrieval, and report generation.
- **CLI Interface**: Provides a command-line interface supporting commands: profile, predict, recommend, gap-report, and export.
- **CI Accuracy Gate**: Integrated with automated pytest suites and CI workflows enforcing a strict **≥90.0% model accuracy threshold** on build and deployment pipelines.

### 7. Analytics Dashboard & Review UI
- **React.js & Streamlit UIs**: Offers an interactive web dashboard in React.js alongside an optional Streamlit interface (`streamlit_app/app.py`) with Plotly visualizations.
- **Interactive Visualizations**: Includes model comparison bar charts, candidate profile breakdown, and **t-SNE skill embedding clusters (SBERT)**.
- **Export Capabilities**: Supports saving recommended career paths and exporting personalized skill development roadmaps in PDF and CSV formats.

---

# 🔄 Project Workflow

```text
Upload Resume
      │
      ▼
Resume Parsing
      │
      ▼
Information Extraction
      │
      ▼
Structured User Profile
      │
      ▼
Career Prediction
      │
      ▼
Top Career Recommendations
      │
      ▼
Skill Gap Analysis
      │
      ▼
ATS Resume Score
      │
      ▼
Course Recommendations
      │
      ▼
Resume Improvement Suggestions
```

---

# 🛠️ Technology Stack

## Frontend
- React.js (v19)
- Tailwind CSS
- Axios
- Plotly.js / Chart.js

## Backend
- FastAPI
- Python 3.13
- SQLAlchemy ORM (SQLite / MySQL)
- Pydantic

## Machine Learning & MLOps
- Scikit-learn (Logistic Regression, Random Forest, SVM, Decision Trees)
- XGBoost
- MLflow (Model Registry & Experiment Tracking)
- Optuna / GridSearchCV (Hyperparameter Optimization)

## Natural Language Processing (NLP) & Embeddings
- spaCy (Named Entity Recognition - NER)
- Sentence-BERT & TF-IDF Vectorizers
- PyMuPDF (fitz) & python-docx

## Analytics & UI Extensions
- Streamlit (`streamlit_app/app.py`)
- Custom CLI Tools

---

# 📂 Project Structure

```text
CareerCast/
│
├── backend/                  # FastAPI Application & ML Pipelines
│   ├── app/
│   │   ├── database/         # Database connection & ORM models (SQLite / MySQL)
│   │   ├── ml/               # CareerPredictor, accuracy gate & MLflow tracker
│   │   ├── models/           # SQLAlchemy ORM schemas
│   │   ├── parser/           # Resume parser (PDF/DOCX extraction & NLP)
│   │   ├── routers/          # API endpoints (/auth, /recommendation)
│   │   ├── schemas/          # Pydantic request & response models
│   │   ├── services/         # Skill gap analyzer & learning path services
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Automated pytest test suite
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Server launcher script
│
├── frontend/                 # React.js Web Interface
│   ├── public/               # Static assets & template
│   ├── src/
│   │   ├── components/       # UI navigation & layout components
│   │   ├── pages/            # Dashboard, Analytics, Results, Profile views
│   │   └── services/         # Axios API integration
│   └── package.json          # Node dependencies & npm scripts
│
├── streamlit_app/            # Streamlit Interactive Interface
│   ├── app.py                # Streamlit application entry point
│   └── requirements.txt      # Streamlit dependencies
│
├── datasets/                 # Datasets (Resume, O*NET, ESCO, Career)
│   ├── resume_dataset/
│   ├── onet/
│   ├── esco/
│   └── career_dataset/
│
├── trained_models/           # Exported Machine Learning model artifacts
│
├── README.md                 # Project documentation
└── LICENSE                   # License terms
```

---

# 📊 Datasets Used

## 1. Resume Dataset

Used for testing resume upload and extracting user information.

**Source:**  
https://www.kaggle.com/datasets/haidermaseeh/resume-dataset

https://www.kaggle.com/datasets/avishekmajhi/resume-dataset

---

## 2. O*NET Database

Used for occupation details, required knowledge, education requirements, and essential skills.

**Official Website:**  
https://www.onetcenter.org/database.html

### O*NET Files Used

- Occupation Data
- Knowledge
- Essential Skills
- Education

---

## 3. ESCO Dataset

Used for occupation–skill relationships and skill mapping.

**Official Website:**  
https://esco.ec.europa.eu/en/use-esco/download

### ESCO Files Used

- Occupations
- Skills
- Occupation–Skill Relations

---

## 4. Career Prediction Dataset

Used to train the Machine Learning model for career prediction.

**Source:**  
https://www.kaggle.com/datasets/ravindrasinghrana/job-description-dataset

---

# 📄 Resume Parsing

The system extracts the following information from uploaded resumes:

- Name
- Email
- Phone Number
- Education
- Degree
- Technical Skills
- Soft Skills
- Projects
- Certifications
- Internship Experience
- Work Experience

The uploaded resume is processed temporarily and is **not stored permanently**.

---

# 🤖 Machine Learning Pipeline

The machine learning workflow includes:

- Data Cleaning
- Missing Value Handling
- Duplicate Removal
- Text Preprocessing
- Feature Engineering
- Feature Vectorization
- Model Training
- Career Prediction

---

# 📈 Model Evaluation

The trained model is evaluated using:

- Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix
- Classification Report

---

# 🎯 Career Prediction

The system predicts the most suitable career based on the extracted profile.

Example recommendations:

- Data Scientist
- Machine Learning Engineer
- AI Engineer
- Data Analyst
- Software Engineer

Each prediction is accompanied by a confidence score.

---

# 🧠 Skill Gap Analysis

The system compares the user's skills with the required skills for the predicted career.

Example:

### User Skills

- Python
- SQL
- Machine Learning

### Required Skills

- Python
- SQL
- Machine Learning
- Docker
- AWS

### Missing Skills

- Docker
- AWS

---

# 📈 ATS Resume Score

The uploaded resume is analyzed based on:

- Skills
- Education
- Experience
- Projects
- Certifications
- Resume Structure
- Keyword Matching

The system provides:

- ATS Resume Score
- Strengths
- Weaknesses
- Resume Improvement Suggestions

---

# 🎓 Course Recommendations

Based on the identified skill gaps, the application recommends relevant learning resources.

Each recommendation includes:

- Course Name
- Skill Covered
- Course Provider
- Difficulty Level

---

# 🚀 Installation & Execution

## 1. Clone the Repository & Install Package

```bash
git clone https://github.com/Gayathritata/AI-Powered-Career-Intelligence-Platform.git
cd AI-Powered-Career-Intelligence-Platform
pip install -e .
```

## 2. CLI Command Line Usage

Once installed, use the `careercast` CLI directly in your terminal:

```bash
# Predict top career paths from raw resume text
careercast predict --text "Experienced Python Developer proficient in SQL, FastAPI, Machine Learning, PyTorch"

# Predict from resume file (PDF/DOCX/TXT)
careercast predict --file resume.pdf --top-n 5

# Generate skill gap roadmap
careercast recommend --skills "Python,SQL" --career "ML Engineer"

# Export report to file
careercast export --file resume.pdf --out report.json
```

## 3. Run Automated Integration & Regression Test Suite

```bash
pytest backend/tests/test_milestone3.py backend/tests/test_integration_pipeline.py backend/tests/test_regression.py -v
```

## 4. Start Backend API (FastAPI)

```bash
cd backend
python run.py
```
*The FastAPI backend runs at `http://localhost:8000`. Interactive API documentation: `http://localhost:8000/docs`.*

## 5. Start Frontend Application (React)

```bash
cd frontend
npm install
npm start
```
*The React web interface runs at `http://localhost:3000`.*

## 6. Run Interactive Streamlit Dashboard

```bash
streamlit run streamlit_app/app.py
```

---

# 📖 Documentation & Release Cards

- 📄 **[API Reference](docs/API_REFERENCE.md)** — Complete specification of Python SDK & FastAPI REST endpoints.
- 💻 **[CLI Guide](docs/CLI_GUIDE.md)** — Command-line interface usage, options, and output examples.
- 📊 **[Dataset Card](docs/DATASET_CARD.md)** — Data sources, taxonomy structure (O*NET, ESCO), hygiene, and licensing.
- 🤖 **[Model Card](docs/MODEL_CARD.md)** — Multi-model ensemble architecture (XGBoost >95% accuracy, RF, LR, SBERT), evaluation benchmarks, and CI accuracy gate.

---

# 🔮 Future Enhancements

- Deep Learning-based Career Prediction
- Generative AI Resume Suggestions
- Real-time Job Market Integration
- Personalized Career Roadmaps
- Interview Preparation Recommendations

---

# 👨‍💻 Developed For

**Infosys Springboard Internship**

**Project Title:**

**CareerCast – AI-Powered Career Recommendation System**

---

# 📜 License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.