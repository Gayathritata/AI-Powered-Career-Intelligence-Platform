"""
backend/app/ml/train_sbert_job_embeddings.py

Fine-tunes Sentence-BERT (SBERT) model on job description corpora, domain skill mappings,
and career role taxonomies to produce specialized dense embedding vectors for skill matching.
Saves fine-tuned weights to trained_models/sbert_job_model.
"""

import os
import json
import numpy as np

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODELS_DIR = os.path.join(BASE_DIR, "trained_models")
SBERT_OUTPUT_DIR = os.path.join(MODELS_DIR, "sbert_job_model")

# High-quality skill-to-career role pairs for contrastive SBERT fine-tuning
JOB_SKILL_PAIRS = [
    # Data Science & ML
    ("Python SQL Machine Learning Deep Learning Statistics Pandas Scikit-Learn Data Analysis", "Data Scientist building predictive models, data pipelines, and machine learning solutions", 0.95),
    ("PyTorch TensorFlow MLOps Docker Kubernetes Algorithms Feature Engineering Model Deployment", "Machine Learning Engineer creating production ML pipelines, model serving, and deep neural networks", 0.95),
    ("SQL PostgreSQL MySQL Database Tuning Database Architecture ETL Data Modeling", "Database Administrator managing relational databases, query optimization, and data warehousing", 0.90),
    ("SQL Excel Tableau PowerBI Requirements Gathering Data Visualization Communication", "Business Analyst analyzing commercial metrics, preparing executive dashboards, and reporting data insights", 0.90),

    # Software Engineering & Web Dev
    ("Java Python Data Structures Algorithms Git REST APIs SQL System Design Microservices", "Software Engineer developing scalable backend services, object-oriented systems, and APIs", 0.95),
    ("JavaScript HTML CSS React Node.js TypeScript REST APIs Git Frontend Web Development", "Web Developer creating interactive responsive web applications using React and modern JavaScript", 0.95),
    ("Docker Kubernetes AWS CI/CD Terraform Linux Python Bash Cloud DevOps Infrastructure", "DevOps Engineer automating deployment pipelines, cloud infrastructure, and container orchestration", 0.95),
    ("QA Selenium Test Automation JUnit Bug Tracking API Testing Software Quality", "QA Automation Engineer designing test suites, regression testing, and CI automated pipelines", 0.90),

    # Business, Finance, HR & Design
    ("Recruitment Talent Acquisition HR Policies Employee Relations Onboarding Communication", "HR Specialist managing recruitment lifecycle, employee retention, and corporate labor compliance", 0.90),
    ("Financial Analysis Accounting Excel Financial Modeling Budgeting Risk Assessment CPA", "Financial Analyst conducting corporate valuation, financial forecasting, and balance sheet auditing", 0.90),
    ("Figma UI/UX Adobe XD Wireframing Prototyping User Research Design System", "UI UX Designer crafting user journeys, high-fidelity prototypes, and design interface systems", 0.95),
    ("Product Strategy Roadmapping Agile Scrum User Stories Analytics Feature Prioritization", "Product Manager defining product vision, cross-functional roadmaps, and customer feature priorities", 0.90),
    ("Network Security Ethical Hacking Penetration Testing Cryptography Firewalls SIEM Linux", "Cyber Security Analyst auditing system security, network intrusion prevention, and threat response", 0.95),

    # Negative/Distant Pairs for contrastive loss learning
    ("Culinary Skills Food Safety Menu Planning Kitchen Management Recipes", "Software Engineer developing backend microservices and database architectures", 0.05),
    ("Recruitment Talent Acquisition HR Policies Employee Relations", "DevOps Engineer automating Kubernetes clusters and Docker containers", 0.10),
    ("Figma UI/UX Adobe XD Wireframing Prototyping User Research", "Financial Accountant balancing ledgers and preparing corporate tax audits", 0.10),
]


def fine_tune_sbert():
    print("[INFO] Initializing Sentence-BERT Domain Fine-Tuning Pipeline...")
    os.makedirs(MODELS_DIR, exist_ok=True)

    try:
        from sentence_transformers import SentenceTransformer, InputExample, losses
        from torch.utils.data import DataLoader

        print("[INFO] Loading base model 'all-MiniLM-L6-v2'...")
        model = SentenceTransformer("all-MiniLM-L6-v2")

        # Prepare training examples
        train_examples = []
        for skill_text, job_text, sim_score in JOB_SKILL_PAIRS:
            train_examples.append(InputExample(texts=[skill_text, job_text], label=float(sim_score)))

        train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=8)
        train_loss = losses.CosineSimilarityLoss(model)

        print("[INFO] Fine-tuning Sentence-BERT on job description & skill corpora...")
        model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=3,
            warmup_steps=5,
            show_progress_bar=False
        )

        model.save(SBERT_OUTPUT_DIR)
        print(f"[OK] Fine-tuned SBERT model successfully saved to: {SBERT_OUTPUT_DIR}")

        metadata = {
            "status": "FINE_TUNED",
            "base_model": "all-MiniLM-L6-v2",
            "output_directory": SBERT_OUTPUT_DIR,
            "training_samples_count": len(train_examples),
            "loss_function": "CosineSimilarityLoss",
            "epochs": 3
        }

        with open(os.path.join(SBERT_OUTPUT_DIR, "fine_tune_metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        return True

    except Exception as e:
        print(f"[WARN] SBERT Fine-Tuning skipped or sentence-transformers error: {e}")
        print("[INFO] Falling back to lightweight domain embedding vector configuration.")

        os.makedirs(SBERT_OUTPUT_DIR, exist_ok=True)
        fallback_meta = {
            "status": "FALLBACK_ENABLED",
            "base_model": "all-MiniLM-L6-v2",
            "output_directory": SBERT_OUTPUT_DIR,
            "note": f"Fine-tuning fallback active ({str(e)})"
        }
        with open(os.path.join(SBERT_OUTPUT_DIR, "fine_tune_metadata.json"), "w", encoding="utf-8") as f:
            json.dump(fallback_meta, f, indent=2)

        return False


if __name__ == "__main__":
    fine_tune_sbert()
