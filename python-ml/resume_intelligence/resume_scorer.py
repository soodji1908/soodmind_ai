from dataclasses import asdict

from resume_intelligence.ats_analyzer import analyze_ats
from resume_intelligence.job_matcher import match_job
from resume_intelligence.parser import parse_resume
from resume_intelligence.skill_extractor import extract_skills


def build_resume_report(text: str, job_description: str | None = None) -> dict:
    parsed = parse_resume(text)
    skills = extract_skills(text)
    return {
        "word_count": parsed.word_count,
        "contact": asdict(parsed.contact),
        "sections_found": list(parsed.sections),
        "skills": skills,
        "education": [asdict(entry) for entry in parsed.education],
        "experience": {
            "years_estimated": parsed.years_of_experience,
            "date_ranges": list(parsed.experience_entries),
        },
        "ats": analyze_ats(parsed, skills),
        "job_match": match_job(text, job_description) if job_description else None,
    }
