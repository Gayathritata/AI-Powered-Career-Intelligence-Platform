from setuptools import setup, find_packages

setup(
    name="careercast",
    version="1.0.0",
    description="AI-Powered Career Path Prediction & Skill Gap Intelligence Platform",
    author="CareerCast Team - Infosys Springboard Internship",
    author_email="career.intelligence@careercast.ai",
    url="https://github.com/Gayathritata/AI-Powered-Career-Intelligence-Platform",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "fastapi>=0.110.0",
        "uvicorn>=0.28.0",
        "scikit-learn>=1.4.0",
        "xgboost>=2.0.0",
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "spacy>=3.7.0",
        "sentence-transformers>=2.5.0",
        "pydantic>=2.6.0",
        "sqlalchemy>=2.0.0",
        "PyMuPDF>=1.23.0",
        "python-docx>=1.1.0",
        "fpdf2>=2.7.8",
        "streamlit>=1.31.0",
        "plotly>=5.18.0",
    ],
    entry_points={
        "console_scripts": [
            "careercast=careercast.cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
)
