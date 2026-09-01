# CareerCast CLI User Guide & Command Reference

The **CareerCast CLI** (`careercast`) allows developers, candidates, and evaluators to interact directly with the CareerCast AI engine from the command-line terminal.

---

## 💻 Installation

Install CareerCast in editable development mode from the project root:

```bash
git clone https://github.com/Gayathritata/AI-Powered-Career-Intelligence-Platform.git
cd AI-Powered-Career-Intelligence-Platform
pip install -e .
```

Verify installation:

```bash
careercast --help
```

---

## 🛠 Available Subcommands

### 1. `careercast predict`
Predict top suitable career paths with composite confidence scores from a resume file or raw text.

#### Usage:
```bash
# Predict from raw resume text
careercast predict --text "Experienced Python Developer proficient in SQL, FastAPI, Machine Learning, PyTorch"

# Predict from resume file (PDF, DOCX, TXT)
careercast predict --file sample_resume.pdf --top-n 5

# JSON Output
careercast predict --text "React, TypeScript, Redux, HTML, CSS Developer" --json
```

#### Example Output:
```text
============================================================
[CAREERCAST] AI CAREER PREDICTIONS
============================================================
1. AI Engineer                    Confidence: 42.10%
2. ML Engineer                    Confidence: 40.00%
3. AI/ML Intern                   Confidence: 34.30%
4. Deep Learning Engineer         Confidence: 29.30%
5. Data Scientist                 Confidence: 26.70%
============================================================
```

---

### 2. `careercast recommend`
Get a prioritized skill learning roadmap and course recommendations for a target career.

#### Usage:
```bash
careercast recommend --skills "Python,SQL,Pandas" --career "ML Engineer"
```

#### Example Output:
```text
============================================================
[CAREERCAST] RECOMMENDED LEARNING ROADMAP for 'ML Engineer'
============================================================
Match Score: 60.0%
Matched Skills (3): Python, SQL, Pandas
Missing Skills (2): PyTorch, Docker
------------------------------------------------------------
Recommended Skill Priorities:
  1. PyTorch [High] - Est. 40 hrs
  2. Docker [High] - Est. 20 hrs
============================================================
```

---

### 3. `careercast gap-report`
Generate a comprehensive skill gap analysis report.

#### Usage:
```bash
careercast gap-report --skills "Python,SQL" --career "Data Scientist" --json
```

---

### 4. `careercast export`
Export a candidate's complete career prediction and skill gap analysis to a formatted file.

#### Usage:
```bash
# Export to JSON
careercast export --file resume.pdf --out report.json

# Export to Text
careercast export --text "Python SQL Machine Learning" --out report.txt
```
