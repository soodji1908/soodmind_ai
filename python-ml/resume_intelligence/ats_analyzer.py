from resume_intelligence.parser import ParsedResume

MAX_SCORE = 100
METHOD_NOTE = (
    "Each check is a fixed rule with a fixed number of points. The total only shows how many of these "
    "structural checks the resume passes. It does not predict whether a real ATS or recruiter will accept it."
)


def analyze_ats(parsed: ParsedResume, skills: list[str]) -> dict:
    checks = [
        _check(
            "contact_email",
            "Email address present",
            parsed.contact.email is not None,
            10,
            "An email address was found.",
            "No email address was found. Add one in the header.",
        ),
        _check(
            "contact_phone",
            "Phone number present",
            parsed.contact.phone is not None,
            5,
            "A phone number was found.",
            "No phone number was found. Add one in the header.",
        ),
        _check(
            "section_experience",
            "Experience section",
            "experience" in parsed.sections,
            15,
            "An Experience heading was found.",
            "Add a clearly titled Experience section.",
        ),
        _check(
            "section_education",
            "Education section",
            "education" in parsed.sections,
            10,
            "An Education heading was found.",
            "Add a clearly titled Education section.",
        ),
        _check(
            "section_skills",
            "Skills section",
            "skills" in parsed.sections,
            10,
            "A Skills heading was found.",
            "Add a clearly titled Skills section.",
        ),
        _check(
            "length",
            "Length between 300 and 900 words",
            300 <= parsed.word_count <= 900,
            10,
            f"The resume has {parsed.word_count} words.",
            f"The resume has {parsed.word_count} words. Most ATS-friendly resumes fall between 300 and 900.",
        ),
        _check(
            "dates",
            "Work history includes dates",
            bool(parsed.experience_entries),
            10,
            "Date ranges were found in the work history.",
            "No date ranges such as 2019 - 2022 were found in the work history.",
        ),
        _check(
            "bullets",
            "Achievements use bullet points",
            parsed.bullet_count >= 3,
            10,
            f"{parsed.bullet_count} bullet points were found.",
            "Use bullet points for achievements. Fewer than 3 were found.",
        ),
        _check(
            "skills_listed",
            "At least 8 recognised skills",
            len(skills) >= 8,
            10,
            f"{len(skills)} recognised skills were found.",
            f"Only {len(skills)} recognised skills were found. Name the tools and methods you use.",
        ),
        _check(
            "measurable_results",
            "Measurable results",
            parsed.has_measurable_results,
            10,
            "Numbers, percentages or currency figures describe results.",
            "No measurable results were found. Add figures such as percentages, money saved or team sizes.",
        ),
    ]
    return {
        "score": sum(check["points_awarded"] for check in checks),
        "max_score": MAX_SCORE,
        "checks": checks,
        "method": METHOD_NOTE,
    }


def _check(check_id: str, label: str, passed: bool, points: int, pass_note: str, fail_note: str) -> dict:
    return {
        "id": check_id,
        "label": label,
        "passed": passed,
        "points_awarded": points if passed else 0,
        "max_points": points,
        "explanation": pass_note if passed else fail_note,
    }
