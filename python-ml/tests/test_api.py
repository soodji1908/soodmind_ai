import pytest
from fastapi.testclient import TestClient

from api import config
from api.main import app

API_KEY = "test-key-123"
HEADERS = {"X-ML-API-Key": API_KEY}


@pytest.fixture
def client(tmp_path, monkeypatch):
    dataset_dir = tmp_path / "datasets"
    model_dir = tmp_path / "models"
    dataset_dir.mkdir()
    model_dir.mkdir()
    monkeypatch.setattr(config, "ML_API_KEY", API_KEY)
    monkeypatch.setattr(config, "DATASET_DIR", dataset_dir)
    monkeypatch.setattr(config, "MODEL_DIR", model_dir)
    monkeypatch.setattr(config, "MODEL_PATH", model_dir / "model.joblib")
    monkeypatch.setattr(config, "METRICS_PATH", model_dir / "metrics.json")
    return TestClient(app)


def test_health_is_public(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_protected_endpoints_reject_missing_key(client):
    response = client.get("/api/ml/models/status")
    assert response.status_code == 401
    assert response.json()["error"] == "unauthorized"


def test_protected_endpoints_reject_wrong_key(client):
    response = client.get("/api/ml/models/status", headers={"X-ML-API-Key": "wrong"})
    assert response.status_code == 401


def test_predict_without_trained_model_returns_conflict(client):
    response = client.post(
        "/api/ml/house-price/predict",
        headers=HEADERS,
        json={"area_sqft": 1800, "bedrooms": 3, "bathrooms": 2},
    )
    assert response.status_code == 409
    assert response.json()["error"] == "model_not_trained"


def test_predict_validates_input(client):
    response = client.post(
        "/api/ml/house-price/predict",
        headers=HEADERS,
        json={"area_sqft": -5, "bedrooms": 3, "bathrooms": 2},
    )
    assert response.status_code == 422


def test_train_with_missing_dataset_returns_clear_error(client):
    response = client.post("/api/ml/house-price/train", headers=HEADERS, json={"dataset": "houses.csv"})
    assert response.status_code == 422
    assert response.json()["error"] == "invalid_dataset"


def test_train_rejects_path_traversal(client):
    response = client.post("/api/ml/house-price/train", headers=HEADERS, json={"dataset": "../secrets.csv"})
    assert response.status_code == 422


def test_resume_analyze_accepts_pasted_text(client):
    text = (
        "Jane Doe jane@example.com\nExperience\n2018 - 2023 Data analyst\n"
        "- Built Python dashboards that saved 30% of reporting time.\n"
        "- Maintained SQL pipelines for 4 teams.\n- Presented findings to executives monthly.\n"
        "Education\nBSc Statistics 2016\nSkills\nPython, SQL, Excel, Tableau, Git, pandas, Power BI, Communication skills"
    )
    response = client.post("/api/ml/resume/analyze", headers=HEADERS, data={"resume_text": text})
    assert response.status_code == 200
    body = response.json()
    assert "Python" in body["skills"]
    assert body["ats"]["max_score"] == 100


def test_resume_analyze_rejects_unsupported_upload(client):
    response = client.post(
        "/api/ml/resume/analyze",
        headers=HEADERS,
        files={"file": ("resume.txt", b"some text content for the resume", "text/plain")},
    )
    assert response.status_code == 422
    assert response.json()["error"] == "unreadable_resume"


def test_resume_match_requires_job_description(client):
    response = client.post(
        "/api/ml/resume/match",
        headers=HEADERS,
        data={"resume_text": "Python developer with SQL and Git experience across many projects."},
    )
    assert response.status_code == 422


def test_models_status_reports_untrained_house_price_model(client):
    response = client.get("/api/ml/models/status", headers=HEADERS)
    assert response.status_code == 200
    assert response.json()["house_price"]["trained"] is False
