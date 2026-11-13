import io
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

from api import config

SUPPORTED_EXTENSIONS = (".pdf", ".docx")
MIN_EXTRACTED_CHARS = 40
MAX_ENTRIES = 12

SECTION_PATTERNS = {
    "summary": r"summary|profile|objective|about me",
    "experience": r"experience|employment|work history|professional experience",
    "education": r"education|academic background|qualifications",
    "skills": r"skills|technical skills|core competencies|key skills",
    "projects": r"projects|selected projects",
    "certifications": r"certifications?|licenses?|awards",
}
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+?\d[\d\s().-]{6,}\d")
LINKEDIN_RE = re.compile(r"linkedin\.com/in/[A-Za-z0-9_-]+", re.IGNORECASE)
DEGREE_RE = re.compile(
    r"\b(b\.?sc|m\.?sc|b\.?s|m\.?s|b\.?a|m\.?a|b\.?tech|m\.?tech|b\.?eng|m\.?eng|mba|ph\.?d|bachelor|master|"
    r"associate|diploma|doctorate)\b",
    re.IGNORECASE,
)
YEAR_RE = re.compile(r"\b(19[5-9]\d|20[0-4]\d)\b")
DATE_RANGE_RE = re.compile(
    r"\b((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present|current|now)\b",
    re.IGNORECASE,
)
STATED_YEARS_RE = re.compile(r"\b(\d{1,2})\+?\s*(?:years|yrs)\b", re.IGNORECASE)
BULLET_RE = re.compile(r"^\s*(?:[-*•▪●◦]|\d+[.)])\s+", re.MULTILINE)
MEASURABLE_RE = re.compile(
    r"(\d+(?:\.\d+)?\s*%|\$\s?\d[\d,.]*|\d+(?:\.\d+)?\s*x\b|\b\d{2,}\+?\s+(?:users|customers|clients|projects|engineers|people|team members))",
    re.IGNORECASE,
)


class ResumeParseError(Exception):
    pass


@dataclass(frozen=True)
class ContactInfo:
    email: str | None
    phone: str | None
    linkedin: str | None


@dataclass(frozen=True)
class EducationEntry:
    text: str
    year: int | None


@dataclass(frozen=True)
class ParsedResume:
    text: str
    word_count: int
    contact: ContactInfo
    sections: tuple[str, ...]
    education: tuple[EducationEntry, ...]
    experience_entries: tuple[str, ...]
    years_of_experience: float | None
    bullet_count: int
    has_measurable_results: bool


def extract_resume_text(filename: str, data: bytes) -> str:
    suffix = Path(filename or "").suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise ResumeParseError("Unsupported file type. Upload a PDF or DOCX resume.")
    if not data:
        raise ResumeParseError("The uploaded file is empty.")

    if suffix == ".pdf":
        if not data.startswith(b"%PDF"):
            raise ResumeParseError("The file does not look like a valid PDF.")
        raw_text = _pdf_text(data)
    else:
        if not data.startswith(b"PK"):
            raise ResumeParseError("The file does not look like a valid DOCX document.")
        raw_text = _docx_text(data)

    text = _normalise(raw_text)
    if len(text) < MIN_EXTRACTED_CHARS:
        raise ResumeParseError(
            "Too little text could be read from this file. Scanned image PDFs are not supported; "
            "upload a text-based PDF or DOCX."
        )
    if len(text) > config.MAX_RESUME_TEXT_CHARS:
        raise ResumeParseError("The resume is too long to process.")
    return text


def _pdf_text(data: bytes) -> str:
    import fitz

    try:
        with fitz.open(stream=data, filetype="pdf") as document:
            return "\n".join(page.get_text("text") for page in document)
    except (RuntimeError, ValueError) as exc:
        raise ResumeParseError("This PDF could not be opened.") from exc


def _docx_text(data: bytes) -> str:
    from docx import Document

    try:
        document = Document(io.BytesIO(data))
    except Exception as exc:  # python-docx raises several unrelated exception types for corrupt files
        raise ResumeParseError("This DOCX file could not be opened.") from exc

    parts = [paragraph.text for paragraph in document.paragraphs]
    for table in document.tables:
        for row in table.rows:
            parts.extend(cell.text for cell in row.cells)
    return "\n".join(parts)


def _normalise(text: str) -> str:
    lines = (re.sub(r"[ \t\u00a0]+", " ", line).strip() for line in text.splitlines())
    return "\n".join(line for line in lines if line)


def parse_resume(text: str) -> ParsedResume:
    lines = text.splitlines()
    return ParsedResume(
        text=text,
        word_count=len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'+#./-]*", text)),
        contact=_contact(text),
        sections=_sections(lines),
        education=_education(lines),
        experience_entries=_experience_entries(lines),
        years_of_experience=_years_of_experience(text),
        bullet_count=len(BULLET_RE.findall(text)),
        has_measurable_results=bool(MEASURABLE_RE.search(text)),
    )


def _contact(text: str) -> ContactInfo:
    email = EMAIL_RE.search(text)
    phone = None
    for match in PHONE_RE.finditer(text):
        digits = re.sub(r"\D", "", match.group(0))
        if 7 <= len(digits) <= 15:
            phone = match.group(0).strip()
            break
    linkedin = LINKEDIN_RE.search(text)
    return ContactInfo(
        email=email.group(0) if email else None,
        phone=phone,
        linkedin=linkedin.group(0) if linkedin else None,
    )


def _sections(lines: list[str]) -> tuple[str, ...]:
    found = []
    for line in lines:
        heading = line.strip().rstrip(":").strip()
        if len(heading) > 40:
            continue
        for name, pattern in SECTION_PATTERNS.items():
            if re.fullmatch(rf"(?:{pattern})", heading, re.IGNORECASE) and name not in found:
                found.append(name)
    return tuple(found)


def _education(lines: list[str]) -> tuple[EducationEntry, ...]:
    entries = []
    for line in lines:
        if DEGREE_RE.search(line):
            year = YEAR_RE.search(line)
            entries.append(EducationEntry(text=line[:200], year=int(year.group(1)) if year else None))
        if len(entries) >= MAX_ENTRIES:
            break
    return tuple(entries)


def _experience_entries(lines: list[str]) -> tuple[str, ...]:
    entries = [line[:200] for line in lines if DATE_RANGE_RE.search(line)]
    return tuple(entries[:MAX_ENTRIES])


def _years_of_experience(text: str) -> float | None:
    today_year = date.today().year
    intervals = []
    for match in DATE_RANGE_RE.finditer(text):
        start = int(match.group(1))
        end_text = match.group(2).lower()
        end = today_year if end_text in {"present", "current", "now"} else int(end_text)
        if end >= start:
            intervals.append((start, end))

    if intervals:
        intervals.sort()
        merged_total = 0
        current_start, current_end = intervals[0]
        for start, end in intervals[1:]:
            if start <= current_end:
                current_end = max(current_end, end)
            else:
                merged_total += current_end - current_start
                current_start, current_end = start, end
        merged_total += current_end - current_start
        return round(float(merged_total), 1)

    stated = [int(value) for value in STATED_YEARS_RE.findall(text)]
    return float(max(stated)) if stated else None
