"""
streamlit_app/app.py

CareerCast Streamlit Review UI Prototype
Interactive dashboard for Career Prediction, Skill Gap Analysis & PDF/Markdown Report Export.
"""

import sys
import os
import json
import base64
from typing import Dict, Any, List
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ml.predictor import CareerPredictor
from backend.app.services.skill_gap_service import gap_analyzer
from backend.app.ml.ranking_engine import CAREER_REQUIRED_SKILLS
from backend.app.parser.resume_parser import extract_text_from_bytes, extract_ner_entities

# Page configuration
st.set_page_config(
    page_title="CareerCast AI - Review UI Prototype",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.3rem;
        font-weight: 700;
        background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        color: #94a3b8;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #1e293b;
        border-radius: 12px;
        padding: 1.2rem;
        border: 1px solid #334155;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .skill-chip-matched {
        display: inline-block;
        background-color: #064e3b;
        color: #6ee7b7;
        border: 1px solid #047857;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 500;
        margin: 3px;
    }
    .skill-chip-missing {
        display: inline-block;
        background-color: #7f1d1d;
        color: #fca5a5;
        border: 1px solid #b91c1c;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 500;
        margin: 3px;
    }
</style>
""", unsafe_allow_html=True)


def load_predictor():
    p = CareerPredictor.get_instance()
    if not p.is_loaded:
        p.load_artifacts()
    return p


predictor = load_predictor()


def main():
    st.markdown('<div class="main-header">🎯 CareerCast AI Review Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Milestone 3 Prototype — AI Career Predictions, Skill Gap Analysis & Exportable Intelligence Reports</div>', unsafe_allow_html=True)

    # Sidebar setup
    st.sidebar.title("🛠 Settings & Profile Input")
    input_method = st.sidebar.radio("Select Input Method", ["Upload Resume (PDF/DOCX/TXT)", "Paste Resume Text"])

    resume_text = ""
    filename = "resume.txt"

    if input_method == "Upload Resume (PDF/DOCX/TXT)":
        uploaded_file = st.sidebar.file_uploader("Upload Resume File", type=["pdf", "docx", "doc", "txt"])
        if uploaded_file is not None:
            filename = uploaded_file.name
            file_bytes = uploaded_file.read()
            with st.spinner("Extracting text from resume file..."):
                resume_text = extract_text_from_bytes(file_bytes, filename)
            st.sidebar.success(f"File '{filename}' parsed ({len(resume_text)} characters)")
    else:
        resume_text = st.sidebar.text_area("Paste Resume / Candidate Profile Text", height=220, placeholder="Paste candidate resume text here...")

    top_n_roles = st.sidebar.slider("Number of Top Predictions", min_value=3, max_value=10, value=5)
    selected_target_career = st.sidebar.selectbox("Target Career for Skill Gap Report (Optional)", ["Auto-select Top Match"] + list(CAREER_REQUIRED_SKILLS.keys()))

    if not resume_text.strip():
        st.info("👈 Please upload a resume or paste profile text in the sidebar to run career prediction and skill gap analysis.")
        
        # Sample Demo Resume Trigger
        if st.button("🚀 Load Demo AI Engineer Resume"):
            demo_resume = """
            Senior Software Developer & AI Enthusiast with 4 years of experience building scalable web applications.
            Proficient in Python, JavaScript, React, FastAPI, SQL, PostgreSQL, and Git.
            Experience with Machine Learning, Scikit-Learn, PyTorch, Pandas, NumPy, Docker, and REST APIs.
            Holds a Bachelor of Science in Computer Science.
            """
            st.session_state["demo_text"] = demo_resume
            st.rerun()

        if "demo_text" in st.session_state:
            resume_text = st.session_state["demo_text"]

    if resume_text.strip():
        st.subheader("📄 Candidate Overview & Parsed Entities")
        col_text, col_ner = st.columns([1.2, 1])

        with col_text:
            st.text_area("Extracted Resume Text", resume_text, height=180, disabled=True)

        with col_ner:
            entities = extract_ner_entities(resume_text)
            st.write(f"**Extracted NER Entities ({len(entities)} found)**")
            if entities:
                skills_found = [e["text"] for e in entities if e["label"] == "SKILL"]
                roles_found = [e["text"] for e in entities if e["label"] == "ROLE"]
                edu_found = [e["text"] for e in entities if e["label"] == "EDUCATION"]

                if skills_found:
                    st.write("🛠 **Skills:** " + ", ".join(set(skills_found[:12])))
                if roles_found:
                    st.write("💼 **Roles:** " + ", ".join(set(roles_found[:5])))
                if edu_found:
                    st.write("🎓 **Education:** " + ", ".join(set(edu_found[:3])))
            else:
                st.caption("Standard technical term extraction active.")

        st.markdown("---")

        # ── 1. Career Predictions Section ─────────────────────────────────────
        st.subheader("📊 Ensemble Career Path Predictions")
        predictions = predictor.predict(raw_text=resume_text, top_n=top_n_roles)

        if predictions:
            col_chart, col_top = st.columns([1.5, 1])

            with col_chart:
                df_pred = pd_dataframe_from_preds(predictions)
                fig = px.bar(
                    df_pred,
                    x="confidence",
                    y="career",
                    orientation="h",
                    title="Top Predicted Career Match Scores (%)",
                    labels={"confidence": "Composite Match Score (%)", "career": "Career Path"},
                    color="confidence",
                    color_continuous_scale="Viridis",
                    text="confidence"
                )
                fig.update_layout(yaxis={"categoryorder": "total ascending"}, height=350, margin=dict(l=0, r=0, t=40, b=0))
                fig.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
                st.plotly_chart(fig, use_container_width=True)

            with col_top:
                top_role = predictions[0]["career"]
                top_score = predictions[0]["confidence"]
                st.markdown(f"""
                <div class="metric-card">
                    <h3 style="color: #818cf8; margin-top:0;">Top Career Recommendation</h3>
                    <h2 style="font-size: 2rem; margin: 0.5rem 0;">{top_role}</h2>
                    <h3 style="color: #34d399; margin:0;">{top_score}% Match Confidence</h3>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 1rem;">
                        Multi-Model Ensemble powered by XGBoost (95.82% Top-1 Accuracy), Random Forest, Logistic Regression & Sentence-BERT.
                    </p>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("---")

        # ── 2. Skill Gap Analysis Section ─────────────────────────────────────
        st.subheader("🎯 Skill Gap Analysis & Actionable Improvement Plan")

        target_role_eval = None if selected_target_career == "Auto-select Top Match" else selected_target_career
        gap_report = gap_analyzer.analyze_gap(raw_text=resume_text, target_career=target_role_eval)

        st.write(f"Analyzing profile against target role: **{gap_report['target_career']}**")

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Overall Match Score", f"{gap_report['match_score']}%")
        m2.metric("Skill Coverage Ratio", f"{gap_report['coverage_ratio']}%")
        m3.metric("Matched Skills", len(gap_report['matched_skills']))
        m4.metric("Missing Skills", len(gap_report['missing_skills']))

        col_matched, col_missing = st.columns(2)

        with col_matched:
            st.markdown("### ✅ Matched Skills")
            if gap_report["matched_skills"]:
                chips_html = "".join([f'<span class="skill-chip-matched">{s}</span>' for s in gap_report["matched_skills"]])
                st.markdown(chips_html, unsafe_allow_html=True)
            else:
                st.warning("No exact canonical skills matched. Consider adding core technical keywords.")

        with col_missing:
            st.markdown("### ⚠️ Skill Gaps (Missing)")
            if gap_report["missing_skills"]:
                chips_html = "".join([f'<span class="skill-chip-missing">{s}</span>' for s in gap_report["missing_skills"]])
                st.markdown(chips_html, unsafe_allow_html=True)
            else:
                st.success("Perfect alignment! No critical skill gaps identified.")

        st.markdown("#### 💡 Actionable Improvement Roadmap")
        for rec in gap_report["actionable_recommendations"]:
            st.info(rec)

        if gap_report["skill_priorities"]:
            st.markdown("#### 📚 Prioritized Skill Acquisition & Project Ideas")
            for gap in gap_report["skill_priorities"]:
                with st.expander(f"🔹 {gap['skill_name']} — Priority: {gap['priority']} (Est. {gap['estimated_hours']} hrs)"):
                    st.write(f"**Difficulty Level:** {gap['difficulty']}")
                    st.write(f"**Recommended Resources:** {', '.join(gap['recommended_resources'])}")
                    st.write(f"**Portfolio Project Idea:** {gap['suggested_project']}")

        st.markdown("---")

        # ── 3. Report Export Options ──────────────────────────────────────────
        st.subheader("📥 Export Intelligence Report")

        report_markdown = build_markdown_report(resume_text, predictions, gap_report)

        col_exp1, col_exp2, col_exp3 = st.columns(3)
        with col_exp1:
            st.download_button(
                label="📄 Download Report (Markdown)",
                data=report_markdown,
                file_name="CareerCast_Gap_Analysis_Report.md",
                mime="text/markdown"
            )

        with col_exp2:
            report_json = json.dumps({"predictions": predictions, "gap_report": gap_report}, indent=2)
            st.download_button(
                label="📊 Download Report (JSON)",
                data=report_json,
                file_name="CareerCast_Report.json",
                mime="application/json"
            )

        with col_exp3:
            html_report = f"<html><body><pre>{report_markdown}</pre></body></html>"
            st.download_button(
                label="🌐 Download Report (HTML)",
                data=html_report,
                file_name="CareerCast_Report.html",
                mime="text/html"
            )


def pd_dataframe_from_preds(preds: List[Dict[str, Any]]):
    import pandas as pd
    return pd.DataFrame(preds)


def build_markdown_report(raw_text: str, predictions: List[Dict[str, Any]], gap_report: Dict[str, Any]) -> str:
    md = f"""# CareerCast AI - Career Intelligence & Skill Gap Report

## 1. Top Recommended Career Paths
"""
    for idx, p in enumerate(predictions, start=1):
        md += f"{idx}. **{p['career']}** — {p['confidence']}% Match Score\n"

    md += f"""
---
## 2. Skill Gap Analysis for Target Role: {gap_report['target_career']}
- **Overall Match Score:** {gap_report['match_score']}%
- **Skill Coverage Ratio:** {gap_report['coverage_ratio']}%
- **Estimated Time to Bridge Gaps:** {gap_report['estimated_time_to_bridge']}

### ✅ Matched Skills ({len(gap_report['matched_skills'])})
{', '.join(gap_report['matched_skills']) if gap_report['matched_skills'] else 'None'}

### ⚠️ Missing Skill Gaps ({len(gap_report['missing_skills'])})
{', '.join(gap_report['missing_skills']) if gap_report['missing_skills'] else 'None'}

---
## 3. Actionable Learning Roadmap & Portfolio Projects
"""
    for gap in gap_report.get("skill_priorities", []):
        md += f"""
### {gap['skill_name']} ({gap['priority']} Priority)
- **Difficulty:** {gap['difficulty']}
- **Estimated Hours:** {gap['estimated_hours']} hrs
- **Recommended Learning Resources:** {', '.join(gap['recommended_resources'])}
- **Suggested Portfolio Project:** {gap['suggested_project']}
"""

    md += "\n---\n*Report generated by CareerCast AI Intelligence Platform*\n"
    return md


if __name__ == "__main__":
    main()
