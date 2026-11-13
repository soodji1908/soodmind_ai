import io

import fitz
import pytest
from docx import Document

from resume_intelligence.ats_analyzer import analyze_ats
from resume_intelligence.job_matcher import match_job
from resume_intelligence.parser import ResumeParseError, extract_resume_text, parse_resume
from resume_intelligence.resume_scorer import build_resume_report
from resume_intelligence.skill_extractor import extract_skills

SAMPLE_RESUME = """
Jane Doe
jane.doe@example.com | +1 (555) 123-4567 | linkedin.com/in/janedoe

Summary
Data analyst with 6 years of experience in Python, SQL and dashboards.

Experience
Senior Data Analyst, Acme Realty 2019 - 2023
- Built Power BI dashboards that cut reporting time by 40%.
- Automated pandas pipelines processing 2,000,000 rows nightly.
Analyst, Beta Labs 2016 - 2019
- Wrote SQL queries on PostgreSQL for weekly market analysis.

Education
Bachelor of Science in Statistics, State University 2015

Skills
Python, SQL, PostgreSQL, pandas, scikit-learn, Power BI, Excel, Git, Data Analysis, Communication skills
"""

JOB_DESCRIPTION = """
We are hiring a data analyst who knows Python, SQL, Tableau and machine learning.
You will build dashboards, run market analysis and work with scikit-learn models.
Experience with AWS and Docker is a plus.
"""


def _docx_bytes(paragraphs: list[str]) -> bytes:
    document = Document()
    for line in paragraphs:
        document.add_paragraph(line)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def _pdf_bytes(lines: list[str]) -> bytes:
    document = fitz.open()
    page = document.new_page()
    y = 72
    for line in lines:
        page.insert_text((72, y), line, fontsize=11)
        y += 16
    data = document.tobytes()
    document.close()
    return data


def test_skill_extraction_finds_known_skills_and_respects_word_boundaries():
    skills = extract_skills(SAMPLE_RESUME)
    assert {"Python", "SQL", "PostgreSQL", "pandas", "Power BI", "scikit-learn"} <= set(skills)
    assert "Java" not in extract_skills("I write JavaScript every day")


def test_parse_resume_extracts_contact_education_and_experience():
    parsed = parse_resume(SAMPLE_RESUME)
    assert parsed.contact.email == "jane.doe@example.com"
    assert parsed.contact.phone is not None
    assert parsed.contact.linkedin == "linkedin.com/in/janedoe"
    assert {"summary", "experience", "education", "skills"} <= set(parsed.sections)
    assert parsed.education[0].year == 2015
    assert parsed.years_of_experience == 7.0
    assert parsed.bullet_count >= 3
    assert parsed.has_measurable_results is True


def test_years_of_experience_merges_overlapping_ranges():
    parsed = parse_resume("Job A 2010 - 2015\nJob B 2012 - 2018\nSome other line of text here for length")
    assert parsed.years_of_experience == 8.0


def test_extract_docx_text():
    data = _docx_bytes(["Jane Doe", "Experience", "Built pandas pipelines for 3 years at a real estate firm."])
    text = extract_resume_text("resume.docx", data)
    assert "pandas pipelines" in text


def test_extract_pdf_text():
    data = _pdf_bytes(
        [
            "Jane Doe jane.doe@example.com",
            "Experience: Python developer for five years building analytics dashboards.",
            "Skills: Python, SQL, Docker, Git and AWS deployment experience.",
        ]
    )
    text = extract_resume_text("resume.pdf", data)
    assert "analytics dashboards" in text


def test_unsupported_file_type_is_rejected():
    with pytest.raises(ResumeParseError, match="Unsupported file type"):
        extract_resume_text("resume.txt", b"plain text resume content that is long enough to count")


def test_corrupt_pdf_is_rejected():
    with pytest.raises(ResumeParseError):
        extract_resume_text("resume.pdf", b"not really a pdf")


def test_job_match_reports_missing_skills_and_similarity():
    result = match_job(SAMPLE_RESUME, JOB_DESCRIPTION)
    assert 0 < result["similarity"] <= 1
    assert "Python" in result["matched_skills"]
    assert "Tableau" in result["missing_skills"]
    assert "AWS" in result["missing_skills"]


def test_ats_checks_are_explainable_and_sum_to_score():
    parsed = parse_resume(SAMPLE_RESUME)
    ats = analyze_ats(parsed, extract_skills(SAMPLE_RESUME))
    assert ats["max_score"] == 100
    assert ats["score"] == sum(check["points_awarded"] for check in ats["checks"])
    assert all(check["explanation"] for check in ats["checks"])


def test_build_report_includes_job_match_only_when_requested():
    without_job = build_resume_report(SAMPLE_RESUME)
    with_job = build_resume_report(SAMPLE_RESUME, JOB_DESCRIPTION)
    assert without_job["job_match"] is None
    assert with_job["job_match"]["missing_skills"]
