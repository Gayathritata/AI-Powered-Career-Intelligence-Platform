"""
backend/app/parser/resume_parser.py

Resume parser service supporting text extraction from PDF, DOCX, and TXT files,
and SpaCy NER / regex-based Named Entity Recognition (NER) for skills, job titles, and education.
"""

import re
from typing import List, Dict, Any, Tuple

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import docx
except ImportError:
    docx = None

try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = None
except ImportError:
    spacy = None
    nlp = None


# Core skill patterns
SKILL_PATTERNS = [
    r"\bPython\b", r"\bMachine Learning\b", r"\bSQL\b", r"\bData Visualization\b",
    r"\bReact(?:\.js)?\b", r"\bNode(?:\.js)?\b", r"\bTypeScript\b", r"\bFastAPI\b",
    r"\bPostgreSQL\b", r"\bDocker\b", r"\bAWS\b", r"\bGraphQL\b", r"\bGit\b",
    r"\bPyTorch\b", r"\bTensorFlow\b", r"\bScikit-Learn\b", r"\bPandas\b", r"\bNumPy\b",
    r"\bNLP\b", r"\bJava\b", r"\bC\+\+\b", r"\bJavaScript\b", r"\bHTML\b", r"\bCSS\b",
    r"\bTailwind\b", r"\bKeras\b", r"\bMongoDB\b", r"\bRedis\b", r"\bKubernetes\b",
    r"\bCI/CD\b", r"\bLinux\b", r"\bTableau\b", r"\bPowerBI\b", r"\bExcel\b",
    r"\bSystem Architecture\b", r"\bAgile\b", r"\bScrum\b", r"\bJira\b", r"\bA/B Testing\b"
]

# Core job role / title patterns
ROLE_PATTERNS = [
    r"\bData Scientist(?:\s+Intern|\s+Senior|\s+Lead)?\b",
    r"\bData Analyst\b",
    r"\bSoftware Engineer(?:\s+Intern|\s+Senior|\s+Lead)?\b",
    r"\bFull Stack Engineer\b",
    r"\bFull Stack Developer\b",
    r"\bBackend Developer\b",
    r"\bFrontend Developer\b",
    r"\bMachine Learning Engineer\b",
    r"\bAI Researcher\b",
    r"\bBusiness Analyst\b",
    r"\bProduct Manager\b",
    r"\bDevOps Engineer\b",
    r"\bSolutions Architect\b",
    r"\bSystems Engineer\b"
]

# Core education / degree patterns
EDUCATION_PATTERNS = [
    r"\bB\.?S\.?\s+(?:in\s+)?Computer Science\b",
    r"\bM\.?S\.?\s+(?:in\s+)?Data Science(?:\s+&\s+AI)?\b",
    r"\bMaster of Science in Data Science\b",
    r"\bBachelor of Science\b",
    r"\bMaster of Science\b",
    r"\bPh\.?D\.?\b",
    r"\bB\.?A\.?\s+(?:in\s+)?Business Economics\b",
    r"\bUniversity of California,?\s+Berkeley\b",
    r"\bStanford University\b",
    r"\bMIT\b",
    r"\bNYU\b",
    r"\bHarvard University\b"
]


def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """Extract raw text content from PDF, DOCX, or plain text bytes."""
    filename_lower = filename.lower()
    
    # 1. PDF Text Extraction via PyMuPDF (fitz) or PyPDF
    if filename_lower.endswith(".pdf"):
        # Try PyMuPDF (fitz)
        if fitz:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                pages_text = [page.get_text() for page in doc]
                extracted = "\n".join(pages_text).strip()
                if extracted:
                    return extracted
            except Exception as e:
                print(f"[WARN] PyMuPDF PDF extraction failed: {e}")
        
        # Try pypdf fallback
        if pypdf:
            try:
                import io
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                pages_text = [page.extract_text() for page in reader.pages if page.extract_text()]
                extracted = "\n".join(pages_text).strip()
                if extracted:
                    return extracted
            except Exception as e:
                print(f"[WARN] pypdf extraction failed: {e}")

    # 2. DOCX Text Extraction via python-docx
    if filename_lower.endswith(".docx") and docx:
        try:
            import io
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
            if text.strip():
                return text
        except Exception as e:
            print(f"[WARN] DOCX text extraction failed: {e}")

    # 3. Fallback text decoding with PDF binary stream sanitizer
    try:
        raw = file_bytes.decode("utf-8", errors="ignore")
        if filename_lower.endswith(".pdf"):
            # Strip PDF binary headers, stream objects, and PDF syntax tags
            raw = re.sub(r"<</Type.*?>", " ", raw, flags=re.DOTALL)
            raw = re.sub(r"stream.*?endstream", " ", raw, flags=re.DOTALL)
            raw = re.sub(r"/Font<.*?>", " ", raw)
            raw = re.sub(r"/ProcSet\[.*?\]", " ", raw)
            raw = re.sub(r"\d+\s+\d+\s+obj.*?", " ", raw)
            raw = re.sub(r"endobj", " ", raw)
            raw = re.sub(r"[^\x20-\x7E\n\r\t]", " ", raw)  # Keep printable ASCII & whitespace
            raw = re.sub(r"\s+", " ", raw).strip()
        return raw
    except Exception:
        return ""


def extract_ner_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extract Named Entities (SKILL, ROLE, EDUCATION) from resume text.
    Uses regex rule-based pattern matching supplemented by SpaCy if available.
    Returns list of dicts with text, label, start, end.
    """
    entities: List[Dict[str, Any]] = []
    seen_spans: List[Tuple[int, int]] = []

    def is_overlapping(start: int, end: int) -> bool:
        return any(s <= start < e or s < end <= e or (start <= s and end >= e) for s, e in seen_spans)

    # 1. Extract Roles
    for pattern in ROLE_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            s, e = match.span()
            if not is_overlapping(s, e):
                entities.append({
                    "text": match.group(0),
                    "label": "ROLE",
                    "start": s,
                    "end": e
                })
                seen_spans.append((s, e))

    # 2. Extract Skills
    for pattern in SKILL_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            s, e = match.span()
            if not is_overlapping(s, e):
                entities.append({
                    "text": match.group(0),
                    "label": "SKILL",
                    "start": s,
                    "end": e
                })
                seen_spans.append((s, e))

    # 3. Extract Education
    for pattern in EDUCATION_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            s, e = match.span()
            if not is_overlapping(s, e):
                entities.append({
                    "text": match.group(0),
                    "label": "EDUCATION",
                    "start": s,
                    "end": e
                })
                seen_spans.append((s, e))

    # Sort entities by start index
    entities.sort(key=lambda x: x["start"])
    return entities
