import numpy as np
import pandas as pd
import pytest

from api import config
from house_price.dataset import DatasetError, InsufficientDataError, load_dataset
from house_price.predict import ModelNotTrainedError, predict_price
from house_price.train import train_from_file


def _synthetic_csv(path, rows: int) -> None:
    rng = np.random.default_rng(0)
    area = rng.uniform(500, 4000, rows)
    bedrooms = rng.integers(1, 6, rows)
    bathrooms = np.clip(bedrooms - rng.integers(0, 2, rows), 1, None)
    year_built = rng.integers(1950, 2020, rows)
    noise = rng.normal(0, 15_000, rows)
    price = area * 180 + bedrooms * 12_000 + bathrooms * 8_000 + noise
    locations = rng.choice(["downtown", "suburbs", "harbour"], rows)
    frame = pd.DataFrame(
        {
            "price": price.round(0),
            "area_sqft": area.round(0),
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "year_built": year_built,
            "location": locations,
        }
    )
    frame.loc[frame.sample(frac=0.05, random_state=1).index, "year_built"] = np.nan
    frame.to_csv(path, index=False)


@pytest.fixture
def isolated_paths(tmp_path, monkeypatch):
    dataset_dir = tmp_path / "datasets"
    model_dir = tmp_path / "models"
    dataset_dir.mkdir()
    model_dir.mkdir()
    monkeypatch.setattr(config, "DATASET_DIR", dataset_dir)
    monkeypatch.setattr(config, "MODEL_DIR", model_dir)
    monkeypatch.setattr(config, "MODEL_PATH", model_dir / "model.joblib")
    monkeypatch.setattr(config, "METRICS_PATH", model_dir / "metrics.json")
    return dataset_dir


def test_load_dataset_rejects_missing_required_columns(tmp_path):
    path = tmp_path / "bad.csv"
    pd.DataFrame({"price": [1, 2], "area_sqft": [3, 4]}).to_csv(path, index=False)
    with pytest.raises(DatasetError, match="missing required columns"):
        load_dataset(path)


def test_load_dataset_requires_minimum_valid_rows(tmp_path):
    path = tmp_path / "small.csv"
    _synthetic_csv(path, rows=10)
    with pytest.raises(InsufficientDataError):
        load_dataset(path)


def test_train_compares_three_models_and_selects_one(isolated_paths):
    _synthetic_csv(isolated_paths / "houses.csv", rows=300)
    report = train_from_file("houses.csv")

    labels = {row["model"] for row in report["comparison"]}
    assert labels == {"linear_regression", "random_forest", "gradient_boosting"}
    assert report["selected_model"] in labels
    for row in report["comparison"]:
        assert set(row["holdout"]) == {"mae", "rmse", "r2"}
        assert {"mae_mean", "rmse_mean", "r2_mean"} <= set(row["cross_validation"])
    assert report["dataset"]["valid_rows"] == 300


def test_predict_requires_a_trained_model(isolated_paths):
    with pytest.raises(ModelNotTrainedError):
        predict_price({"area_sqft": 1200, "bedrooms": 3, "bathrooms": 2})


def test_predict_returns_model_output_with_range(isolated_paths):
    _synthetic_csv(isolated_paths / "houses.csv", rows=300)
    train_from_file("houses.csv")

    result = predict_price({"area_sqft": 2500, "bedrooms": 4, "bathrooms": 3, "location": "Downtown"})

    assert result["estimated_price"] > 0
    assert result["range_low"] <= result["estimated_price"] <= result["range_high"]
    assert result["model"] in {"linear_regression", "random_forest", "gradient_boosting"}
