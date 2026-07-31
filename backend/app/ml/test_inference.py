"""
backend/app/ml/test_inference.py

Test script to verify CareerPredictor inference on sample text inputs.
"""

from app.ml.predictor import CareerPredictor


def run_tests():
    predictor = CareerPredictor.get_instance()
    print(f"[INFO] Model loaded status: {predictor.is_loaded}")

    test_samples = [
        {
            "name": "Software & IT Developer Profile",
            "text": """
            Senior Software Engineer with 6 years of experience in Python, FastAPI, React, SQL, PostgreSQL,
            Docker, Kubernetes, AWS cloud deployment, REST APIs, Git, object-oriented design, microservices,
            and machine learning model integration.
            """,
        },
        {
            "name": "Human Resources Profile",
            "text": """
            HR Manager with 8+ years of experience managing talent acquisition, employee relations, onboarding,
            payroll processing, labor compliance, HR policies, performance appraisals, and employee engagement.
            """,
        },
        {
            "name": "Finance & Accounting Profile",
            "text": """
            Chartered Accountant and Finance Specialist proficient in financial reporting, corporate tax preparation,
            auditing, QuickBooks, SAP ERP, balance sheet reconciliation, budgeting, and financial risk modeling.
            """,
        },
    ]

    for sample in test_samples:
        print("=" * 60)
        print(f"Testing Sample: {sample['name']}")
        predictions = predictor.predict(raw_text=sample["text"], top_n=5)
        print("Top 5 Predictions:")
        for idx, item in enumerate(predictions, 1):
            print(f"  {idx}. {item['career']} - {item['confidence']}% confidence")
        print("=" * 60)


if __name__ == "__main__":
    run_tests()
