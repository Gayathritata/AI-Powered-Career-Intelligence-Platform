"""
backend/app/ml/ranking_engine.py

Top-K Career Ranking Engine with Multi-Metric Scoring.
Combines ensemble ML classifier probability predictions, SBERT dense embedding vector
similarity, and skill alignment ratios to produce ranked career recommendations
with confidence scores and skill gap metrics.
"""

import numpy as np
from typing import List, Dict, Any, Optional
from app.ml.sbert_embedder import SkillSBERTEmbedder

import re
import numpy as np
from typing import List, Dict, Any, Optional
from app.ml.sbert_embedder import SkillSBERTEmbedder

# Fixed list of canonical tech & domain career roles with required skill mappings
CAREER_REQUIRED_SKILLS = {
    # ── AI & Data ─────────────────────────────────────────────────────────────
    "AI Engineer": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "NLP", "Computer Vision", "LLMs"],
    "ML Engineer": ["Python", "SQL", "PyTorch", "Kubernetes", "MLOps", "AWS SageMaker"],
    "Machine Learning Engineer": ["Python", "Scikit-Learn", "PyTorch", "TensorFlow", "MLOps", "Docker", "Algorithms", "Feature Engineering"],

    "Deep Learning Engineer": ["Python", "PyTorch", "TensorFlow", "Neural Networks", "Computer Vision", "NLP", "CUDA", "Keras"],
    "Generative AI Engineer": ["Python", "LangChain", "LLMs", "OpenAI", "Transformers", "PyTorch", "Prompt Engineering", "Vector DBs"],
    "Data Scientist": ["Python", "R", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Statistics", "Machine Learning", "Data Analysis"],
    "Data Analyst": ["SQL", "Python", "Excel", "Tableau", "PowerBI", "Data Visualization", "Statistics", "Reporting"],
    "Data Engineer": ["Python", "SQL", "Spark", "Hadoop", "ETL", "Airflow", "Data Warehousing", "PostgreSQL", "Kafka"],
    "Business Intelligence Analyst": ["PowerBI", "Tableau", "SQL", "Excel", "Data Modeling", "ETL", "Dashboarding", "Reporting"],
    "MLOps Engineer": ["Python", "Docker", "Kubernetes", "CI/CD", "MLflow", "Kubeflow", "AWS", "Model Monitoring"],
    "NLP Engineer": ["Python", "NLP", "NLTK", "SpaCy", "Transformers", "BERT", "PyTorch", "Text Processing"],
    "Computer Vision Engineer": ["Python", "OpenCV", "PyTorch", "TensorFlow", "CNN", "Image Processing", "Object Detection", "CUDA"],

    # ── Software Development ──────────────────────────────────────────────────
    "Software Engineer": ["Java", "Python", "C++", "Data Structures", "Algorithms", "Git", "REST APIs", "SQL", "System Design"],
    "Full Stack Developer": ["React", "Node.js", "JavaScript", "TypeScript", "Python", "HTML5", "CSS3", "SQL", "REST APIs", "Git"],
    "Frontend Developer": ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Redux", "Tailwind CSS", "Vue", "Next.js"],
    "Backend Developer": ["Python", "FastAPI", "Node.js", "Express", "Django", "Java", "SQL", "PostgreSQL", "REST APIs", "Docker"],
    "Web Developer": ["HTML5", "CSS3", "JavaScript", "React", "PHP", "WordPress", "Bootstrap", "REST APIs"],
    "Mobile App Developer": ["React Native", "Flutter", "Swift", "Kotlin", "Java", "iOS", "Android", "REST APIs"],
    "Python Developer": ["Python", "FastAPI", "Django", "Flask", "SQL", "PostgreSQL", "REST APIs", "Git", "Pandas"],
    "Java Developer": ["Java", "Spring Boot", "Hibernate", "Microservices", "SQL", "Maven", "REST APIs", "Git"],
    "C++ Developer": ["C++", "STL", "Data Structures", "Algorithms", "Multithreading", "Object-Oriented Programming", "Linux"],
    "C#/.NET Developer": ["C#", ".NET", "ASP.NET", "Entity Framework", "SQL Server", "REST APIs", "Azure"],
    "PHP Developer": ["PHP", "Laravel", "MySQL", "JavaScript", "HTML5", "CSS3", "REST APIs", "Git"],
    "React Developer": ["React", "JavaScript", "TypeScript", "Redux", "HTML5", "CSS3", "Next.js", "REST APIs"],
    "Node.js Developer": ["Node.js", "Express", "JavaScript", "TypeScript", "MongoDB", "REST APIs", "PostgreSQL", "Git"],

    # ── Cloud & DevOps ────────────────────────────────────────────────────────
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux", "Python", "Bash", "Git"],
    "Cloud Engineer": ["AWS", "Azure", "GCP", "Cloud Architecture", "Terraform", "Docker", "Networking", "Linux"],
    "AWS Cloud Engineer": ["AWS", "EC2", "S3", "Lambda", "CloudFormation", "Terraform", "IAM", "Docker"],
    "Azure Cloud Engineer": ["Azure", "Azure DevOps", "ARM Templates", "Virtual Machines", "Azure SQL", "PowerShell"],
    "Google Cloud Engineer": ["GCP", "BigQuery", "Compute Engine", "GKE", "Terraform", "Cloud Storage", "Python"],
    "Site Reliability Engineer (SRE)": ["Linux", "Python", "Kubernetes", "Docker", "Prometheus", "Grafana", "CI/CD", "Monitoring"],

    # ── Cybersecurity ─────────────────────────────────────────────────────────
    "Cybersecurity Analyst": ["Network Security", "SIEM", "Incident Response", "Vulnerability Assessment", "Firewalls", "Security Audit"],
    "Security Engineer": ["Cryptography", "Network Security", "Penetration Testing", "Ethical Hacking", "Python", "Linux"],
    "Ethical Hacker": ["Penetration Testing", "Metasploit", "Kali Linux", "Ethical Hacking", "Network Scanning", "Vulnerability Research"],
    "SOC Analyst": ["SIEM", "Splunk", "Incident Response", "Threat Intelligence", "Log Analysis", "Network Monitoring"],
    "Information Security Analyst": ["ISO 27001", "Risk Management", "Compliance", "Security Policies", "Vulnerability Management"],

    # ── Database & Networking ─────────────────────────────────────────────────
    "Database Administrator": ["SQL", "MySQL", "PostgreSQL", "Oracle", "Database Backup", "Performance Tuning", "Database Security"],
    "SQL Developer": ["SQL", "T-SQL", "PL/SQL", "Stored Procedures", "Query Optimization", "PostgreSQL", "Database Design"],
    "Network Engineer": ["Cisco", "CCNA", "Routing & Switching", "Firewalls", "TCP/IP", "VPN", "Network Troubleshooting"],
    "System Administrator": ["Linux", "Windows Server", "Active Directory", "Bash", "Shell Scripting", "Networking", "System Backups"],

    # ── Testing & Quality ─────────────────────────────────────────────────────
    "QA Engineer": ["QA", "Software Testing", "Test Cases", "Bug Tracking", "Jira", "Manual Testing", "Regression Testing"],
    "Software Test Engineer": ["Software Testing", "Selenium", "Test Planning", "API Testing", "Postman", "Defect Tracking"],
    "Automation Test Engineer": ["Selenium", "Python", "Java", "TestNG", "Cypress", "Automated Testing", "CI/CD"],

    # ── Design ────────────────────────────────────────────────────────────────
    "UI Designer": ["Figma", "UI Design", "Adobe XD", "Visual Design", "Typography", "Color Theory", "Prototyping"],
    "UX Designer": ["UX Research", "Wireframing", "User Testing", "Figma", "Information Architecture", "Usability"],
    "UI/UX Designer": ["Figma", "UI/UX", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Visual Design"],
    "Graphic Designer": ["Adobe Photoshop", "Adobe Illustrator", "InDesign", "Branding", "Graphic Design", "Creativity"],

    # ── Business & Management ──────────────────────────────────────────────────
    "Business Analyst": ["Business Analysis", "Requirements Gathering", "SQL", "Excel", "Tableau", "Process Mapping", "Communication"],
    "Product Manager": ["Product Strategy", "Roadmapping", "Agile", "Scrum", "User Stories", "Market Research", "Analytics"],
    "Project Manager": ["Project Management", "Agile", "Scrum", "Jira", "Risk Management", "Budgeting", "Stakeholder Management"],
    "Technical Consultant": ["Technical Consulting", "Solution Architecture", "Client Relations", "Requirements Analysis", "Problem Solving"],

    # ── Emerging Technologies ─────────────────────────────────────────────────
    "Blockchain Developer": ["Solidity", "Blockchain", "Ethereum", "Smart Contracts", "Web3.js", "Cryptography", "Go"],
    "IoT Engineer": ["IoT", "Embedded C", "Raspberry Pi", "Arduino", "MQTT", "Sensors", "Python", "Networking"],
    "Embedded Systems Engineer": ["C", "C++", "Microcontrollers", "RTOS", "Embedded Systems", "PCB Design", "Hardware"],
    "Robotics Engineer": ["ROS", "Python", "C++", "Robotics", "Control Systems", "Kinematics", "Computer Vision"],
    "AR/VR Developer": ["Unity", "Unreal Engine", "C#", "C++", "3D Modeling", "ARKit", "ARCore", "Virtual Reality"],

    # ── Support & Entry-Level ─────────────────────────────────────────────────
    "Technical Support Engineer": ["Technical Support", "Troubleshooting", "Customer Service", "Linux", "Windows", "Networking", "Ticketing"],
    "IT Support Engineer": ["IT Support", "Hardware Troubleshooting", "Active Directory", "Desktop Support", "Networking"],
    "Graduate Engineer Trainee (GET)": ["Python", "Java", "C++", "SQL", "Problem Solving", "Data Structures", "Engineering"],
    "Software Engineer Trainee": ["Python", "Java", "JavaScript", "HTML5", "CSS3", "Git", "SQL", "Data Structures"],
    "AI/ML Intern": ["Python", "Machine Learning", "Data Analysis", "Pandas", "Scikit-Learn", "PyTorch", "TensorFlow"],
}


def extract_skills_from_text(text: str) -> List[str]:
    """Extract known technical & domain skills from raw resume text."""
    if not text or not isinstance(text, str):
        return []

    known_skills = [
        "Python", "Java", "C++", "C#", ".NET", "PHP", "JavaScript", "TypeScript", "HTML5", "HTML", "CSS3", "CSS",
        "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot",
        "Hibernate", "Laravel", "Redux", "Tailwind", "Bootstrap", "WordPress", "React Native", "Flutter", "Swift",
        "Kotlin", "Android", "iOS", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Oracle", "SQL Server",
        "Machine Learning", "Deep Learning", "Artificial Intelligence", "AI", "NLP", "Computer Vision", "Generative AI",
        "LLMs", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "Pandas", "NumPy", "OpenCV", "SpaCy", "NLTK",
        "LangChain", "OpenAI", "Data Analysis", "Data Visualization", "Statistics", "Tableau", "PowerBI", "Excel",
        "Spark", "Hadoop", "ETL", "Airflow", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Terraform",
        "Linux", "Bash", "Shell", "Git", "Cybersecurity", "Network Security", "Ethical Hacking", "Penetration Testing",
        "SIEM", "Splunk", "Firewalls", "Cryptography", "QA", "Selenium", "Postman", "Cypress", "Testing",
        "Test Automation", "Jira", "Agile", "Scrum", "Figma", "UI/UX", "Adobe XD", "Photoshop", "Illustrator",
        "Wireframing", "Prototyping", "Business Analysis", "Product Management", "Project Management",
        "Requirements Gathering", "Solidity", "Blockchain", "IoT", "Embedded", "ROS", "Unity", "Unreal Engine"
    ]

    found = []
    text_lower = text.lower()
    for skill in known_skills:
        escaped = re.escape(skill.lower())
        if re.search(r"\b" + escaped + r"\b", text_lower):
            found.append(skill)

    return list(set(found))


class TopKCareerRankingEngine:
    """Ranks careers using hybrid scoring (SBERT Embeddings + Direct Skill Overlap + Classifier Probabilities)."""

    def __init__(self, embedder: Optional[SkillSBERTEmbedder] = None):
        self.embedder = embedder or SkillSBERTEmbedder()
        self._role_req_vectors: Dict[str, np.ndarray] = {}

    def _get_role_req_vector(self, role_title: str, req_skills: List[str]) -> np.ndarray:
        """Cache static role required skills vectors on first access or init using fast batch encoding."""
        if role_title not in self._role_req_vectors:
            if req_skills:
                self._role_req_vectors[role_title] = self.embedder.encode(req_skills)
            else:
                self._role_req_vectors[role_title] = np.zeros((0, 384), dtype=np.float32)
        return self._role_req_vectors[role_title]

    def calculate_hybrid_score(
        self,
        classifier_prob: float,
        sbert_sim: float,
        skill_coverage: float,
        w_prob: float = 0.20,
        w_sbert: float = 0.50,
        w_coverage: float = 0.30
    ) -> float:
        """
        Weighted Multi-Metric Formula:
        Match Score = (0.50 * SBERT Similarity) + (0.30 * Skill Coverage) + (0.20 * Probability)
        """
        score = (w_prob * classifier_prob) + (w_sbert * sbert_sim) + (w_coverage * skill_coverage)
        return float(np.clip(score, 0.0, 1.0))

    def rank_careers(
        self,
        user_skills: List[str],
        user_text: str,
        class_probabilities: Dict[str, float],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Ranks top-K career predictions given user profile information across canonical fixed roles.
        """
        # Auto-extract skills if none passed explicitly
        if not user_skills and user_text:
            user_skills = extract_skills_from_text(user_text)

        # Encode user skills EXACTLY ONCE for all 50+ role comparisons
        user_vecs = self.embedder.encode(user_skills) if user_skills else None

        ranked_results = []

        # Category mapping helper to bridge dataset labels to role titles
        cat_map = {
            "INFORMATION-TECHNOLOGY": ["Software Engineer", "Full Stack Developer", "Backend Developer", "Frontend Developer", "Python Developer"],
            "ENGINEERING": ["Software Engineer", "Systems Engineer", "C++ Developer", "Java Developer"],
            "DESIGNER": ["UI/UX Designer", "UI Designer", "UX Designer", "Graphic Designer"],
            "FINANCE": ["Financial Analyst", "Business Analyst"],
            "ACCOUNTANT": ["Financial Analyst", "Business Analyst"],
            "BUSINESS-DEVELOPMENT": ["Business Analyst", "Product Manager"],
        }

        for role_title, req_skills in CAREER_REQUIRED_SKILLS.items():
            # Get probability from classifier if exact match or category map match
            prob = class_probabilities.get(role_title, 0.0)
            if prob == 0.0 and class_probabilities:
                for cat_label, cat_prob in class_probabilities.items():
                    if cat_label in cat_map and role_title in cat_map[cat_label]:
                        prob = max(prob, cat_prob)

            # Retrieve pre-cached required skill embedding vectors for role
            req_vecs = self._get_role_req_vector(role_title, req_skills)

            # Evaluate alignment using pre-encoded user & role vectors (0 extra model inference calls)
            alignment = self.embedder.evaluate_skill_semantic_alignment(
                user_skills=user_skills,
                target_required_skills=req_skills,
                user_vecs=user_vecs,
                req_vecs=req_vecs
            )
            sbert_sim = alignment["semantic_alignment_score"] / 100.0
            coverage = alignment["coverage_ratio"] / 100.0

            # Composite hybrid match score
            match_score = self.calculate_hybrid_score(prob, sbert_sim, coverage)

            ranked_results.append({
                "career_title": role_title,
                "match_score": round(match_score * 100, 1),
                "confidence_score": round(max(prob, sbert_sim) * 100, 1),
                "skill_alignment_score": round(alignment["semantic_alignment_score"], 1),
                "matched_skills": alignment["matched_skills"],
                "missing_skills": alignment["missing_skills"],
                "coverage_ratio": round(alignment["coverage_ratio"], 1),
                "required_skills": req_skills
            })

        # Sort by match_score descending
        ranked_results.sort(key=lambda x: x["match_score"], reverse=True)

        # Assign rank indices
        top_k_results = []
        for i, item in enumerate(ranked_results[:top_k], start=1):
            item["rank"] = i
            top_k_results.append(item)

        return top_k_results

