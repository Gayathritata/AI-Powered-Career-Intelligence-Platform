# CareerCast – AI-Powered Career Recommendation System

CareerCast is an AI-powered Career Recommendation System developed as part of the **Infosys Springboard Internship**. The application analyzes a user's uploaded resume using Natural Language Processing (NLP) and Machine Learning (ML) to predict the most suitable career paths, identify skill gaps, evaluate ATS compatibility, and recommend courses for career improvement.

> **Note:** The uploaded resume is used only for extracting information during processing and is **not stored permanently**.

---

## 📖 Problem Statement

Navigating career decisions is one of the most consequential challenges faced by students, early career professionals, and experienced practitioners seeking to pivot into emerging fields. The modern labor market is characterized by rapidly evolving skill demands, fragmented educational pathways, and a vast landscape of role definitions, making career planning inherently complex.

CareerCast addresses this challenge by constructing an AI-powered career recommendation system that analyzes a user's structured professional profile extracted from their resume and predicts the most suitable career paths. The system also performs skill gap analysis, evaluates resume quality through an ATS Resume Score, and provides personalized recommendations to improve career readiness.

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
- React.js
- Tailwind CSS
- Axios

## Backend
- FastAPI
- Python

## Database
- MySQL

## Machine Learning
- Scikit-learn

## Natural Language Processing
- spaCy
- PyMuPDF
- python-docx

---

# 📂 Project Structure

```text
CareerCast/
│
├── frontend/
│
├── backend/
│
├── datasets/
│   ├── resume_dataset/
│   ├── onet/
│   ├── esco/
│   └── career_dataset/
│
├── trained_models/
│
├── requirements.txt
│
├── README.md
│
└── LICENSE
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

# 🚀 Installation

## Clone the repository

```bash
git clone https://github.com/your-username/CareerCast.git
cd CareerCast
```

## Install Backend Dependencies

```bash
pip install -r requirements.txt
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Start Backend

```bash
uvicorn app.main:app --reload
```

## Start Frontend

```bash
npm run dev
```

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