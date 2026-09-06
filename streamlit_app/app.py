"""
streamlit_app/app.py

CareerCast Streamlit Dashboard & Review Interface (Milestone 4 Enhanced)
Featuring:
1. Single Resume & Profile Analysis
2. Cohort Analytics & Batch Resume Aggregations
3. Career Comparison Views (Side-by-side)
4. PDF & Multi-Format Report Exporter
"""

import sys
import os
import json
import pandas as pd
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
from streamlit_app.pdf_exporter import generate_pdf_bytes

# Page configuration
st.set_page_config(
    page_title="CareerCast AI - Career Intelligence Platform",
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
        margin-bottom: 0.2rem;
    }
    .sub-header {
        color: #94a3b8;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
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


@st.cache_resource
def load_predictor():
    try:
        p = CareerPredictor.get_instance()
        if not p.is_loaded:
            p.load_artifacts()
        return p
    except Exception as e:
        print(f"[WARN] Predictor load warning: {e}")
        return CareerPredictor.get_instance()


predictor = load_predictor()


def main():
    st.markdown('<div class="main-header">🎯 CareerCast AI Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Milestone 4 — AI Career Predictions, Cohort Analytics, Career Comparison & PDF Export</div>', unsafe_allow_html=True)

    # Main Navigation Tabs
    tab_single, tab_cohort, tab_compare, tab_export = st.tabs([
        "📁 Single Resume Analysis",
        "👥 Cohort Analytics",
        "⚖️ Career Comparison",
        "📄 Export & Documentation"
    ])

    # ── TAB 1: SINGLE RESUME ANALYSIS ──────────────────────────────────────────
    with tab_single:
        st.sidebar.title("🛠 Profile Input")
        input_method = st.sidebar.radio("Select Input Method", ["Upload Resume (PDF/DOCX/TXT)", "Paste Resume Text"], key="single_input")

        resume_text = ""
        filename = "resume.txt"

        if input_method == "Upload Resume (PDF/DOCX/TXT)":
            uploaded_file = st.sidebar.file_uploader("Upload Resume File", type=["pdf", "docx", "doc", "txt"], key="single_file")
            if uploaded_file is not None:
                filename = uploaded_file.name
                file_bytes = uploaded_file.read()
                with st.spinner("Extracting text..."):
                    resume_text = extract_text_from_bytes(file_bytes, filename)
                st.sidebar.success(f"Parsed '{filename}' ({len(resume_text)} chars)")
        else:
            resume_text = st.sidebar.text_area("Paste Resume Text", height=200, placeholder="Paste resume text here...", key="single_text")

        top_n_roles = st.sidebar.slider("Top Predictions Count", 3, 10, 5, key="single_top_n")
        selected_target_career = st.sidebar.selectbox("Target Career for Gap Analysis", ["Auto-select Top Match"] + list(CAREER_REQUIRED_SKILLS.keys()), key="single_target")

        if not resume_text.strip():
            st.info("👈 Please upload a resume or paste profile text in the sidebar to begin analysis.")
            if st.button("🚀 Load Sample Demo Resume (AI/ML Developer)"):
                resume_text = """
                Senior Software Developer & AI Enthusiast with 4 years experience.
                Proficient in Python, SQL, React, FastAPI, PostgreSQL, and Git.
                Experience with Machine Learning, Scikit-Learn, PyTorch, Pandas, NumPy, Docker, and AWS.
                Holds a B.S. in Computer Science.
                """
                st.session_state["demo_text"] = resume_text
                st.rerun()

        if resume_text.strip():
            st.subheader("📄 Extracted Entities & Information")
            col_text, col_ner = st.columns([1.2, 1])

            with col_text:
                st.text_area("Parsed Text Preview", resume_text, height=160, disabled=True)

            with col_ner:
                entities = extract_ner_entities(resume_text)
                st.write(f"**Extracted Entities ({len(entities)} found)**")
                skills_found = list(set([e["text"] for e in entities if e["label"] == "SKILL"]))
                roles_found = list(set([e["text"] for e in entities if e["label"] == "ROLE"]))

                if skills_found:
                    st.write("🛠 **Skills:** " + ", ".join(skills_found[:10]))
                if roles_found:
                    st.write("💼 **Roles:** " + ", ".join(roles_found[:5]))

            st.markdown("---")

            # Predictions
            st.subheader("📊 Ensemble Career Predictions")
            predictions = predictor.predict(raw_text=resume_text, top_n=top_n_roles)
            if predictions:
                col_chart, col_card = st.columns([1.5, 1])

                with col_chart:
                    df_pred = pd.DataFrame(predictions)
                    fig = px.bar(
                        df_pred,
                        x="confidence",
                        y="career",
                        orientation="h",
                        title="Match Scores (%)",
                        color="confidence",
                        color_continuous_scale="Viridis",
                        text="confidence"
                    )
                    fig.update_layout(yaxis={"categoryorder": "total ascending"}, height=330, margin=dict(l=0, r=0, t=30, b=0))
                    fig.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
                    st.plotly_chart(fig, use_container_width=True)

                with col_card:
                    top_role = predictions[0]["career"]
                    top_score = predictions[0]["confidence"]
                    st.markdown(f"""
                    <div class="metric-card">
                        <h4 style="color: #818cf8; margin-top:0;">Top Career Recommendation</h4>
                        <h2 style="font-size: 1.8rem; margin: 0.4rem 0;">{top_role}</h2>
                        <h3 style="color: #34d399; margin:0;">{top_score}% Confidence</h3>
                        <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.8rem;">
                            Ensemble Classifier (XGBoost, Random Forest, Logistic Regression & SBERT).
                        </p>
                    </div>
                    """, unsafe_allow_html=True)

            st.markdown("---")

            # Skill Gap Analysis
            st.subheader("🎯 Skill Gap Analysis & Roadmap")
            eval_target = None if selected_target_career == "Auto-select Top Match" else selected_target_career
            gap_report = gap_analyzer.analyze_gap(raw_text=resume_text, target_career=eval_target)

            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Overall Match Score", f"{gap_report['match_score']}%")
            m2.metric("Skill Coverage Ratio", f"{gap_report['coverage_ratio']}%")
            m3.metric("Matched Skills", len(gap_report['matched_skills']))
            m4.metric("Missing Skills", len(gap_report['missing_skills']))

            c1, c2 = st.columns(2)
            with c1:
                st.markdown("### ✅ Matched Skills")
                chips_matched = "".join([f'<span class="skill-chip-matched">{s}</span>' for s in gap_report["matched_skills"]])
                st.markdown(chips_matched if gap_report["matched_skills"] else "None", unsafe_allow_html=True)

            with c2:
                st.markdown("### ⚠️ Skill Gaps")
                chips_missing = "".join([f'<span class="skill-chip-missing">{s}</span>' for s in gap_report["missing_skills"]])
                st.markdown(chips_missing if gap_report["missing_skills"] else "None", unsafe_allow_html=True)

            st.markdown("#### 📚 Recommended Courses")
            for c in gap_report.get("recommended_courses", []):
                st.write(f"- **{c.get('course_name')}** ({c.get('provider')}) — *Skill:* `{c.get('skill_covered')}` [{c.get('difficulty')}]")

    # ── TAB 2: COHORT ANALYTICS ────────────────────────────────────────────────
    with tab_cohort:
        st.subheader("👥 Cohort Analytics & Batch Portfolio Aggregations")
        st.markdown("Analyze skill frequency and career distribution across candidate cohorts.")

        cohort_files = st.file_uploader("Batch Upload Resumes (PDF/DOCX/TXT)", type=["pdf", "docx", "txt"], accept_multiple_files=True, key="cohort_files")

        if cohort_files:
            cohort_data = []
            for f in cohort_files:
                text = extract_text_from_bytes(f.read(), f.name)
                preds = predictor.predict(raw_text=text, top_n=1)
                top_c = preds[0]["career"] if preds else "Unknown"
                top_conf = preds[0]["confidence"] if preds else 0.0
                ents = extract_ner_entities(text)
                sk = [e["text"] for e in ents if e["label"] == "SKILL"]
                cohort_data.append({
                    "filename": f.name,
                    "top_career": top_c,
                    "confidence": top_conf,
                    "skills_count": len(sk),
                    "skills": sk
                })

            df_cohort = pd.DataFrame(cohort_data)

            col1, col2 = st.columns(2)
            with col1:
                st.markdown("### Top Career Predictions Distribution")
                fig_pie = px.pie(df_cohort, names="top_career", title="Cohort Recommended Careers", color_discrete_sequence=px.colors.qualitative.Pastel)
                st.plotly_chart(fig_pie, use_container_width=True)

            with col2:
                st.markdown("### Match Confidence Scores Across Cohort")
                fig_hist = px.histogram(df_cohort, x="confidence", nbins=10, title="Confidence Score Distribution (%)", color_discrete_sequence=["#6366f1"])
                st.plotly_chart(fig_hist, use_container_width=True)

            st.markdown("### Cohort Resumes Summary Table")
            st.dataframe(df_cohort[["filename", "top_career", "confidence", "skills_count"]], use_container_width=True)
        else:
            st.info("💡 Upload multiple candidate resumes above to run cohort analytics.")

    # ── TAB 3: CAREER COMPARISON VIEWS ──────────────────────────────────────────
    with tab_compare:
        st.subheader("⚖️ Side-by-Side Career Path Comparison")
        st.markdown("Compare multiple target careers for the candidate to evaluate skill coverage and missing priorities.")

        available_careers = list(CAREER_REQUIRED_SKILLS.keys())
        col_select1, col_select2 = st.columns(2)

        with col_select1:
            career1 = st.selectbox("Select Career Option A", available_careers, index=0, key="cmp_c1")
        with col_select2:
            career2 = st.selectbox("Select Career Option B", available_careers, index=1 if len(available_careers)>1 else 0, key="cmp_c2")

        if st.button("⚖️ Compare Careers"):
            rep1 = gap_analyzer.analyze_gap(raw_text=resume_text if 'resume_text' in locals() else "", target_career=career1)
            rep2 = gap_analyzer.analyze_gap(raw_text=resume_text if 'resume_text' in locals() else "", target_career=career2)

            col_a, col_b = st.columns(2)
            with col_a:
                st.markdown(f"### 🎯 Option A: {career1}")
                st.metric("Match Score", f"{rep1['match_score']}%")
                st.write("**Matched Skills:**", ", ".join(rep1['matched_skills']) if rep1['matched_skills'] else "None")
                st.write("**Missing Skills:**", ", ".join(rep1['missing_skills']) if rep1['missing_skills'] else "None")

            with col_b:
                st.markdown(f"### 🎯 Option B: {career2}")
                st.metric("Match Score", f"{rep2['match_score']}%")
                st.write("**Matched Skills:**", ", ".join(rep2['matched_skills']) if rep2['matched_skills'] else "None")
                st.write("**Missing Skills:**", ", ".join(rep2['missing_skills']) if rep2['missing_skills'] else "None")

    # ── TAB 4: EXPORT & DOCUMENTATION ───────────────────────────────────────────
    with tab_export:
        st.subheader("📄 Export Reports & Documentation Release")
        st.markdown("Download generated candidate reports in PDF, Markdown, and JSON formats.")

        if 'gap_report' in locals() and 'predictions' in locals():
            report_payload = {
                "target_career": gap_report["target_career"],
                "match_score": gap_report["match_score"],
                "matched_skills": gap_report["matched_skills"],
                "missing_skills": gap_report["missing_skills"],
                "recommended_courses": gap_report.get("recommended_courses", []),
                "top_predictions": predictions
            }

            pdf_data = generate_pdf_bytes(report_payload)
            json_data = json.dumps(report_payload, indent=2)

            col_d1, col_d2 = st.columns(2)
            with col_d1:
                st.download_button(
                    label="📄 Download PDF Summary Report",
                    data=pdf_data,
                    file_name="CareerCast_Report.pdf",
                    mime="application/pdf"
                )
            with col_d2:
                st.download_button(
                    label="📊 Download JSON Data Export",
                    data=json_data,
                    file_name="CareerCast_Report.json",
                    mime="application/json"
                )
        else:
            st.info("Run a single resume analysis in Tab 1 to generate downloadable PDF/JSON reports.")

        st.markdown("---")
        st.subheader("📖 System Documentation & Release Cards")
        st.markdown("""
        - **[API Reference](file:///d:/CareerCast/docs/API_REFERENCE.md)**
        - **[CLI Guide](file:///d:/CareerCast/docs/CLI_GUIDE.md)**
        - **[Dataset Card](file:///d:/CareerCast/docs/DATASET_CARD.md)**
        - **[Model Card](file:///d:/CareerCast/docs/MODEL_CARD.md)**
        """)


if __name__ == "__main__":
    main()
