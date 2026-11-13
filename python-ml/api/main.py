import hmac
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, Header, UploadFile
from fastapi.responses import JSONResponse

from api import config
from api.schemas import HousePriceInput, TrainRequest
from house_price.dataset import DatasetError, InsufficientDataError
from house_price.predict import ModelNotTrainedError, predict_price, read_metrics, read_model_status
from house_price.train import train_from_file
from resume_intelligence.parser import ResumeParseError, extract_resume_text
from resume_intelligence.resume_scorer import build_resume_report

app = FastAPI(title="EstateMind ML Service", version="1.0.0")

JOB_DESCRIPTION_MIN = 30
JOB_DESCRIPTION_MAX = 50_000
RESUME_TEXT_MIN = 80


class ServiceError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def _error(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"error": code, "message": message})


@app.exception_handler(ServiceError)
async def service_error_handler(_, exc: ServiceError):
    return _error(exc.status_code, exc.code, exc.message)


@app.exception_handler(DatasetError)
async def dataset_error_handler(_, exc: DatasetError):
    return _error(422, "invalid_dataset", str(exc))


@app.exception_handler(InsufficientDataError)
async def insufficient_data_handler(_, exc: InsufficientDataError):
    return _error(
        422,
        "insufficient_data",
        f"The dataset has {exc.valid_rows} valid rows. At least {exc.required_rows} are required to train a model. "
        "No model was created.",
    )


@app.exception_handler(ModelNotTrainedError)
async def model_not_trained_handler(_, exc: ModelNotTrainedError):
    return _error(409, "model_not_trained", str(exc))


@app.exception_handler(ResumeParseError)
async def resume_parse_handler(_, exc: ResumeParseError):
    return _error(422, "unreadable_resume", str(exc))


def require_api_key(x_ml_api_key: str = Header(default="")) -> None:
    if not config.ML_API_KEY:
        raise ServiceError(503, "not_configured", "ML_API_KEY is not set on the ML service.")
    if not hmac.compare_digest(x_ml_api_key, config.ML_API_KEY):
        raise ServiceError(401, "unauthorized", "The ML service rejected this request.")


async def _resume_text_from_input(file: UploadFile | None, resume_text: str | None) -> str:
    if file is not None and file.filename:
        data = await file.read(config.MAX_UPLOAD_BYTES + 1)
        if len(data) > config.MAX_UPLOAD_BYTES:
            raise ServiceError(413, "file_too_large", "The resume file must be 10 MB or smaller.")
        return extract_resume_text(file.filename, data)
    if resume_text and resume_text.strip():
        text = resume_text.strip()
        if len(text) < RESUME_TEXT_MIN:
            raise ServiceError(422, "resume_too_short", "Paste at least a few lines of resume text.")
        if len(text) > config.MAX_RESUME_TEXT_CHARS:
            raise ServiceError(422, "resume_too_long", "The resume text is too long to process.")
        return text
    raise ServiceError(422, "missing_resume", "Upload a PDF or DOCX resume, or paste the resume text.")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "estatemind-ml"}


@app.post("/api/ml/house-price/predict", dependencies=[Depends(require_api_key)])
def predict(payload: HousePriceInput) -> dict:
    return predict_price(payload.model_dump())


@app.post("/api/ml/house-price/train", dependencies=[Depends(require_api_key)])
def train(payload: TrainRequest) -> dict:
    return train_from_file(payload.dataset)


@app.get("/api/ml/house-price/metrics", dependencies=[Depends(require_api_key)])
def metrics() -> dict:
    return read_metrics()


@app.post("/api/ml/resume/analyze", dependencies=[Depends(require_api_key)])
async def analyze_resume(
    file: UploadFile | None = File(default=None),
    resume_text: str | None = Form(default=None),
) -> dict:
    text = await _resume_text_from_input(file, resume_text)
    return build_resume_report(text)


@app.post("/api/ml/resume/match", dependencies=[Depends(require_api_key)])
async def match_resume(
    job_description: str = Form(min_length=JOB_DESCRIPTION_MIN, max_length=JOB_DESCRIPTION_MAX),
    file: UploadFile | None = File(default=None),
    resume_text: str | None = Form(default=None),
) -> dict:
    text = await _resume_text_from_input(file, resume_text)
    return build_resume_report(text, job_description)


@app.get("/api/ml/models/status", dependencies=[Depends(require_api_key)])
def models_status() -> dict:
    return {
        "house_price": read_model_status(),
        "resume": {
            "engine": "Rule-based extraction with TF-IDF cosine similarity",
            "supported_formats": ["pdf", "docx"],
        },
    }
