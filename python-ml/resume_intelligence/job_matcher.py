from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from resume_intelligence.skill_extractor import extract_skills

TOP_JOB_TERMS = 40
MAX_KEYWORD_GAPS = 15


def match_job(resume_text: str, job_text: str) -> dict:
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), sublinear_tf=True)
    try:
        matrix = vectorizer.fit_transform([resume_text, job_text])
    except ValueError:
        similarity = 0.0
        keyword_gaps: list[str] = []
    else:
        similarity = float(cosine_similarity(matrix[0], matrix[1])[0][0])
        keyword_gaps = _keyword_gaps(vectorizer, matrix[1].toarray().ravel(), resume_text)

    job_skills = extract_skills(job_text)
    resume_skills = set(extract_skills(resume_text))
    return {
        "method": "TF-IDF cosine similarity between the resume and the job description",
        "similarity": round(similarity, 4),
        "job_skills": job_skills,
        "matched_skills": sorted(skill for skill in job_skills if skill in resume_skills),
        "missing_skills": sorted(skill for skill in job_skills if skill not in resume_skills),
        "keyword_gaps": keyword_gaps,
    }


def _keyword_gaps(vectorizer: TfidfVectorizer, job_weights, resume_text: str) -> list[str]:
    terms = vectorizer.get_feature_names_out()
    resume_lower = resume_text.lower()
    gaps: list[str] = []
    for index in job_weights.argsort()[::-1][:TOP_JOB_TERMS]:
        if job_weights[index] <= 0:
            break
        term = terms[index]
        if term not in resume_lower:
            gaps.append(str(term))
        if len(gaps) >= MAX_KEYWORD_GAPS:
            break
    return gaps
