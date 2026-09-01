"""
careercast/cli.py

Command-line Interface (CLI) for CareerCast AI Career Intelligence Platform.
Supports commands: predict, recommend, gap-report, export.
"""

import sys
import os
import argparse
import json
from typing import List

# Ensure project root and backend are in Python path
CLI_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CLI_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.ml.predictor import CareerPredictor
from app.services.skill_gap_service import gap_analyzer
from app.parser.resume_parser import extract_text_from_bytes, extract_ner_entities


def handle_predict(args):
    text = ""
    if args.file:
        if not os.path.exists(args.file):
            print(f"Error: File '{args.file}' not found.")
            sys.exit(1)
        with open(args.file, "rb") as f:
            file_bytes = f.read()
        text = extract_text_from_bytes(file_bytes, args.file)
    elif args.text:
        text = args.text
    else:
        print("Error: Please provide either --file or --text.")
        sys.exit(1)

    predictor = CareerPredictor.get_instance()
    if not predictor.is_loaded:
        predictor.load_artifacts()

    predictions = predictor.predict(raw_text=text, top_n=args.top_n)
    
    if args.json:
        print(json.dumps({"input_text_length": len(text), "predictions": predictions}, indent=2))
    else:
        print("\n" + "=" * 60)
        print("[CAREERCAST] AI CAREER PREDICTIONS")
        print("=" * 60)
        for idx, pred in enumerate(predictions, 1):
            print(f"{idx}. {pred['career']:<30} Confidence: {pred['confidence']:.2f}%")
        print("=" * 60 + "\n")


def handle_recommend(args):
    user_skills = [s.strip() for s in args.skills.split(",") if s.strip()]
    if not user_skills:
        print("Error: Please provide at least one skill using --skills.")
        sys.exit(1)

    res = gap_analyzer.analyze_gap(
        raw_text="",
        user_skills=user_skills,
        target_career=args.career
    )

    if args.json:
        print(json.dumps(res, indent=2))
    else:
        print("\n" + "=" * 60)
        print(f"[CAREERCAST] RECOMMENDED LEARNING ROADMAP for '{res['target_career']}'")
        print("=" * 60)
        print(f"Match Score: {res['match_score']:.1f}%")
        print(f"Matched Skills ({len(res['matched_skills'])}): {', '.join(res['matched_skills']) if res['matched_skills'] else 'None'}")
        print(f"Missing Skills ({len(res['missing_skills'])}): {', '.join(res['missing_skills']) if res['missing_skills'] else 'None'}")
        print("-" * 60)
        print("Recommended Skill Priorities:")
        for idx, prio in enumerate(res.get("skill_priorities", []), 1):
            print(f"  {idx}. {prio.get('skill_name')} [{prio.get('priority')}] - Est. {prio.get('estimated_hours')} hrs")
        print("=" * 60 + "\n")


def handle_gap_report(args):
    user_skills = [s.strip() for s in args.skills.split(",") if s.strip()]
    res = gap_analyzer.analyze_gap(
        raw_text=args.text or "",
        user_skills=user_skills,
        target_career=args.career
    )

    if args.json:
        print(json.dumps(res, indent=2))
    else:
        print("\n" + "=" * 60)
        print(f"[CAREERCAST] SKILL GAP ANALYSIS REPORT: {res['target_career']}")
        print("=" * 60)
        print(f"Overall Skill Match: {res['match_score']:.1f}%")
        print("\nPriority Skill Roadmaps:")
        for prio in res.get("skill_priorities", []):
            print(f"  [{prio['priority'].upper()}] {prio['skill_name']} - Est. {prio['estimated_hours']} hrs")
        print("=" * 60 + "\n")


def handle_export(args):
    text = ""
    if args.file:
        if not os.path.exists(args.file):
            print(f"Error: File '{args.file}' not found.")
            sys.exit(1)
        with open(args.file, "rb") as f:
            text = extract_text_from_bytes(f.read(), args.file)
    else:
        text = args.text or "Python SQL Machine Learning Developer"

    predictor = CareerPredictor.get_instance()
    if not predictor.is_loaded:
        predictor.load_artifacts()

    predictions = predictor.predict(raw_text=text, top_n=5)
    top_career = predictions[0]["career"] if predictions else "Software Engineer"
    
    entities = extract_ner_entities(text)
    user_skills = [e["text"] for e in entities if e["label"] == "SKILL"]

    gap_res = gap_analyzer.analyze_gap(raw_text=text, user_skills=user_skills, target_career=top_career)

    export_data = {
        "candidate_summary": {
            "text_preview": text[:200] + "...",
            "extracted_skills": user_skills,
        },
        "top_predictions": predictions,
        "skill_gap_analysis": gap_res
    }

    out_file = args.out or "careercast_report.json"
    if out_file.endswith(".json"):
        with open(out_file, "w") as f:
            json.dump(export_data, f, indent=2)
        print(f"✅ Successfully exported JSON career report to '{out_file}'")
    else:
        # Save as formatted text report
        with open(out_file, "w") as f:
            f.write(f"CAREERCAST CAREER REPORT\n{'='*50}\n")
            f.write(f"Top Recommended Career: {top_career}\n")
            f.write(f"Match Score: {predictions[0]['confidence']}%\n\n")
            f.write(f"Matched Skills: {', '.join(gap_res['matched_skills'])}\n")
            f.write(f"Missing Skills: {', '.join(gap_res['missing_skills'])}\n")
        print(f"✅ Successfully exported text career report to '{out_file}'")


def main():
    parser = argparse.ArgumentParser(
        prog="careercast",
        description="CareerCast CLI: AI-Powered Career Path Prediction & Skill Gap Intelligence",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Predict subcommand
    predict_parser = subparsers.add_parser("predict", help="Predict top career paths from resume file or text")
    predict_parser.add_argument("--file", "-f", type=str, help="Path to resume file (PDF, DOCX, TXT)")
    predict_parser.add_argument("--text", "-t", type=str, help="Raw resume text")
    predict_parser.add_argument("--top-n", "-n", type=int, default=5, help="Number of career recommendations (default: 5)")
    predict_parser.add_argument("--json", action="store_true", help="Output in JSON format")

    # Recommend subcommand
    recommend_parser = subparsers.add_parser("recommend", help="Get course and roadmap recommendations for a target career")
    recommend_parser.add_argument("--skills", "-s", type=str, required=True, help="Comma-separated user skills")
    recommend_parser.add_argument("--career", "-c", type=str, default="ML Engineer", help="Target career title")
    recommend_parser.add_argument("--json", action="store_true", help="Output in JSON format")

    # Gap-report subcommand
    gap_parser = subparsers.add_parser("gap-report", help="Generate detailed skill gap analysis")
    gap_parser.add_argument("--skills", "-s", type=str, default="", help="Comma-separated user skills")
    gap_parser.add_argument("--text", "-t", type=str, default="", help="Resume text")
    gap_parser.add_argument("--career", "-c", type=str, default="ML Engineer", help="Target career title")
    gap_parser.add_argument("--json", action="store_true", help="Output in JSON format")

    # Export subcommand
    export_parser = subparsers.add_parser("export", help="Export career analysis report to file")
    export_parser.add_argument("--file", "-f", type=str, help="Resume input file")
    export_parser.add_argument("--text", "-t", type=str, help="Resume input text")
    export_parser.add_argument("--out", "-o", type=str, default="careercast_report.json", help="Output report filename")

    args = parser.parse_args()

    if args.command == "predict":
        handle_predict(args)
    elif args.command == "recommend":
        handle_recommend(args)
    elif args.command == "gap-report":
        handle_gap_report(args)
    elif args.command == "export":
        handle_export(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
