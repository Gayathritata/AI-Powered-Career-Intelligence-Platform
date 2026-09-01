# CareerCast Dataset Card

## 📌 Dataset Overview

The **CareerCast AI Career Intelligence Platform** synthesizes four curated public datasets to construct a robust skill taxonomy, career trajectory map, and predictive feature matrix.

| Dataset Name | Source / Institution | Scope & Record Count | Role in CareerCast |
| :--- | :--- | :--- | :--- |
| **O*NET Occupational Database (v28.0)** | U.S. Department of Labor | 1,000+ Occupations, 18,000+ Skill Mappings | Canonical Skill Taxonomy & Knowledge Standards |
| **ESCO Dataset** | European Commission | 3,008 Occupations, 13,890 Skills | Occupation-Skill Hierarchical Taxonomy |
| **Kaggle Resume Dataset** | Kaggle Datasets | 2,400+ Parsed Resumes across 25 categories | Training NLP NER & Resume Parsing Models |
| **Job Description Dataset** | Kaggle Datasets | 15,000+ Verified Job Descriptions | Training ML Classifier Ensemble (XGBoost, RF, LR) |

---

## 📊 Dataset Structure & Features

### 1. Canonical Skill Vectorization
- **Technical Skills Matrix**: 250+ normalized technical keywords (e.g., `Python`, `PyTorch`, `React`, `Docker`, `SQL`, `Kubernetes`).
- **Soft Skills Vector**: 30+ soft skill competencies (e.g., `Problem Solving`, `Team Leadership`, `Communication`).
- **Experience Markers**: Years of experience, degree level (`B.S.`, `M.S.`, `Ph.D.`), and industry domain tags.

### 2. Preprocessing & Data Hygiene
- **Text Normalization**: Lowercasing, punctuation stripping, stop-word removal, and synonym normalization (e.g., `JS` $\rightarrow$ `JavaScript`, `Postgres` $\rightarrow$ `PostgreSQL`).
- **De-duplication**: Exact deduplication of overlapping job descriptions across source corpora.
- **Handling Imbalance**: SMOTE (Synthetic Minority Over-sampling Technique) applied to balance rare career classes.

---

## 🔒 Privacy, Ethics & Licensing

- **In-Memory Processing**: Uploaded candidate resumes are processed in-memory during inference and strictly **not persisted to disk**.
- **Data Anonymization**: All Kaggle and test resumes are anonymized, stripping PII (Personally Identifiable Information) including full names, phone numbers, and street addresses.
- **Licensing**:
  - O*NET: Creative Commons Attribution 4.0 International (CC BY 4.0).
  - ESCO: Open Data license (ODC-BY).
  - Kaggle Datasets: Public Domain / Open Database License.
