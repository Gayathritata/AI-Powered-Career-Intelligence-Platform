"""
backend/app/services/skill_gap_service.py

Skill Gap Analysis & Actionable Competency Improvement Engine.
Evaluates user resume skills against target career requirements, prioritizes skill gaps,
and provides structured, actionable recommendations, project ideas, and learning roadmaps.
"""

from typing import List, Dict, Any, Optional
import math
from app.ml.ranking_engine import CAREER_REQUIRED_SKILLS, extract_skills_from_text, TopKCareerRankingEngine
from app.ml.sbert_embedder import embedder as default_embedder


# Skill difficulty & resource database for generating actionable suggestions
SKILL_METADATA: Dict[str, Dict[str, Any]] = {
    "Python": {
        "priority": "High",
        "difficulty": "Beginner-Intermediate",
        "estimated_hours": 30,
        "resources": ["Core Python Docs", "Automate the Boring Stuff with Python", "LeetCode Python Essentials"],
        "project": "Build an Automated Web Scraper or CLI Automation Tool"
    },
    "Machine Learning": {
        "priority": "High",
        "difficulty": "Intermediate-Advanced",
        "estimated_hours": 50,
        "resources": ["Scikit-Learn Official Guides", "Andrew Ng's Machine Learning Specialization", "Kaggle Competitions"],
        "project": "Develop an End-to-End Customer Churn Prediction Model"
    },
    "Deep Learning": {
        "priority": "High",
        "difficulty": "Advanced",
        "estimated_hours": 60,
        "resources": ["Fast.ai Practical Deep Learning for Coders", "DeepLearning.AI Specialization", "PyTorch Tutorials"],
        "project": "Train a Convolutional Neural Network for Medical Image Classification"
    },
    "PyTorch": {
        "priority": "High",
        "difficulty": "Intermediate",
        "estimated_hours": 40,
        "resources": ["Official PyTorch 60min Blitz", "Deep Learning with PyTorch (Manning)"],
        "project": "Implement a Custom Transformer Architecture from Scratch"
    },
    "TensorFlow": {
        "priority": "Medium",
        "difficulty": "Intermediate",
        "estimated_hours": 40,
        "resources": ["TensorFlow Developer Certificate Course", "Keras Developer Guides"],
        "project": "Deploy a Keras Transfer Learning Model for Sentiment Analysis"
    },
    "NLP": {
        "priority": "High",
        "difficulty": "Intermediate-Advanced",
        "estimated_hours": 45,
        "resources": ["Hugging Face NLP Course", "SpaCy 101 Guide", "NLTK Documentation"],
        "project": "Build a Resume Parser & Entity Extractor using SpaCy and Transformers"
    },
    "LLMs": {
        "priority": "High",
        "difficulty": "Advanced",
        "estimated_hours": 50,
        "resources": ["Hugging Face Open Source LLM Course", "LangChain Developer Docs", "DeepLearning.AI Building Systems with ChatGPT API"],
        "project": "Build a RAG (Retrieval-Augmented Generation) Q&A Bot on Enterprise PDFs"
    },
    "LangChain": {
        "priority": "High",
        "difficulty": "Intermediate",
        "estimated_hours": 25,
        "resources": ["LangChain Documentation", "Pinecone Vector DB Tutorials"],
        "project": "Create a LangChain Autonomous Agent with Custom Tools"
    },
    "React": {
        "priority": "High",
        "difficulty": "Intermediate",
        "estimated_hours": 35,
        "resources": ["React.dev Official Docs", "Full Stack Open (University of Helsinki)", "Kent C. Dodds Epic React"],
        "project": "Build a Dynamic Interactive Dashboard with React & Tailwind CSS"
    },
    "Node.js": {
        "priority": "High",
        "difficulty": "Intermediate",
        "estimated_hours": 30,
        "resources": ["Node.js Official Documentation", "Node.js Developer Roadmap"],
        "project": "Build a Scalable Real-time WebSockets Chat Application"
    },
    "FastAPI": {
        "priority": "Medium",
        "difficulty": "Beginner-Intermediate",
        "estimated_hours": 20,
        "resources": ["FastAPI Official Documentation", "TestDriven.io FastAPI Async Guide"],
        "project": "Develop a Production RESTful Microservice with Pydantic & Async SQLAlchemy"
    },
    "Docker": {
        "priority": "High",
        "difficulty": "Intermediate",
        "estimated_hours": 20,
        "resources": ["Docker Curriculum", "Docker Mastery by Bret Fisher"],
        "project": "Containerize a Multi-Container Microservice Application with Docker Compose"
    },
    "Kubernetes": {
        "priority": "High",
        "difficulty": "Advanced",
        "estimated_hours": 45,
        "resources": ["Kubernetes Fundamentals (Linux Foundation)", "CKA Certification Prep"],
        "project": "Deploy an Auto-Scaling Kubernetes Cluster with Helm Charts and Ingress Controller"
    },
    "AWS": {
        "priority": "High",
        "difficulty": "Intermediate-Advanced",
        "estimated_hours": 40,
        "resources": ["AWS Certified Solutions Architect Course", "AWS Skill Builder"],
        "project": "Build a Serverless Event-Driven Pipeline using AWS Lambda, S3, and DynamoDB"
    },
    "SQL": {
        "priority": "High",
        "difficulty": "Beginner-Intermediate",
        "estimated_hours": 25,
        "resources": ["Mode Analytics SQL Tutorial", "SQLZoo", "LeetCode SQL Study Plan"],
        "project": "Design a Relational E-Commerce Database with Complex Window Functions"
    },
    "PostgreSQL": {
        "priority": "Medium",
        "difficulty": "Intermediate",
        "estimated_hours": 20,
        "resources": ["PostgreSQL Tutorial", "Use The Index, Luke!"],
        "project": "Optimize Database Performance with Indexing, Query Tuning, and Partitioning"
    },
    "CI/CD": {
        "priority": "Medium",
        "difficulty": "Intermediate",
        "estimated_hours": 20,
        "resources": ["GitHub Actions Documentation", "GitLab CI/CD Guide"],
        "project": "Configure an Automated CI/CD Pipeline with Testing, Linting, and Auto-Deployment"
    },
    "Cybersecurity": {
        "priority": "High",
        "difficulty": "Intermediate-Advanced",
        "estimated_hours": 50,
        "resources": ["CompTIA Security+ Study Guide", "TryHackMe Security Fundamentals"],
        "project": "Conduct a Network Penetration Test & Vulnerability Assessment Report"
    },
    "Figma": {
        "priority": "High",
        "difficulty": "Beginner-Intermediate",
        "estimated_hours": 20,
        "resources": ["Figma Academy", "UI/UX Design Specialization (Coursera)"],
        "project": "Create a High-Fidelity Interactive Mobile App Prototype in Figma"
    }
}


class SkillGapAnalyzer:
    """Analyzer service for skill gap identification and actionable suggestions."""

    def __init__(self):
        self.ranking_engine = TopKCareerRankingEngine(embedder=default_embedder)

    def analyze_gap(
        self,
        raw_text: str,
        user_skills: Optional[List[str]] = None,
        target_career: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates skill gaps against a target career path (or auto-selects top recommended career)
        and generates actionable competency improvement suggestions.
        """
        # Auto extract skills if not provided
        if not user_skills and raw_text:
            user_skills = extract_skills_from_text(raw_text)
        elif not user_skills:
            user_skills = []

        # Deduplicate user skills
        user_skills_clean = list(set([s.strip() for s in user_skills if s.strip()]))

        # Auto-select target career if not provided
        if not target_career or target_career not in CAREER_REQUIRED_SKILLS:
            # Predict top career using ranking engine
            ranked = self.ranking_engine.rank_careers(
                user_skills=user_skills_clean,
                user_text=raw_text,
                class_probabilities={},
                top_k=1
            )
            if ranked:
                target_career = ranked[0]["career_title"]
            else:
                target_career = "Software Engineer"

        required_skills = CAREER_REQUIRED_SKILLS.get(target_career, ["Python", "SQL", "Git", "System Design"])

        # Perform semantic & exact matching alignment
        alignment = default_embedder.evaluate_skill_semantic_alignment(
            user_skills=user_skills_clean,
            target_required_skills=required_skills
        )

        matched_skills = alignment["matched_skills"]
        missing_skills = alignment["missing_skills"]
        match_score = alignment["semantic_alignment_score"]
        coverage_ratio = alignment["coverage_ratio"]

        # Build detailed gap priorities & suggestions for missing skills
        skill_priorities = []
        total_estimated_hours = 0

        for idx, skill in enumerate(missing_skills):
            meta = SKILL_METADATA.get(skill, {
                "priority": "High" if idx < 2 else "Medium",
                "difficulty": "Intermediate",
                "estimated_hours": 30,
                "resources": [f"Official {skill} Documentation", f"Learn {skill} Tutorial"],
                "project": f"Build a Hands-on Project utilizing {skill}"
            })
            
            total_estimated_hours += meta["estimated_hours"]
            skill_priorities.append({
                "skill_name": skill,
                "priority": meta["priority"],
                "difficulty": meta["difficulty"],
                "estimated_hours": meta["estimated_hours"],
                "recommended_resources": meta["resources"],
                "suggested_project": meta["project"]
            })

        # Calculate estimated weeks (assuming 10-15 hours/week study time)
        estimated_weeks = math.ceil(total_estimated_hours / 12) if total_estimated_hours > 0 else 1
        time_frame_str = f"{estimated_weeks} - {estimated_weeks + 2} Weeks ({total_estimated_hours} Hours Total)"

        # Generate overall actionable recommendations
        actionable_recommendations = []
        if match_score >= 80:
            actionable_recommendations.append(
                f"[EXCELLENT MATCH] You already possess {len(matched_skills)} of the core required skills for {target_career}."
            )
            actionable_recommendations.append(
                "Focus on polishing advanced portfolio projects and practicing system design / live coding interview questions."
            )
        elif match_score >= 50:
            actionable_recommendations.append(
                f"[GOOD MATCH] You have a solid foundation for {target_career}. Bridging {len(missing_skills)} key skill gaps will make your profile highly competitive."
            )
            if missing_skills:
                actionable_recommendations.append(
                    f"Prioritize learning top missing skills: {', '.join(missing_skills[:3])}."
                )
        else:
            actionable_recommendations.append(
                f"[LEARNING OPPORTUNITY] To transition into {target_career}, focus on foundational technical prerequisites first."
            )
            actionable_recommendations.append(
                f"Follow the structured learning roadmap below for {missing_skills[:3]} over the next {estimated_weeks} weeks."
            )


        return {
            "target_career": target_career,
            "match_score": round(match_score, 1),
            "coverage_ratio": round(coverage_ratio, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "required_skills": required_skills,
            "skill_priorities": skill_priorities,
            "actionable_recommendations": actionable_recommendations,
            "estimated_time_to_bridge": time_frame_str,
            "total_estimated_hours": total_estimated_hours
        }


# Singleton instance
gap_analyzer = SkillGapAnalyzer()
