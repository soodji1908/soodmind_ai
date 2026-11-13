import json
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

from api import config
from house_price.preprocess import CATEGORICAL_FEATURES, RAW_FEATURES, normalize_category


class ModelNotTrainedError(Exception):
    pass


@lru_cache(maxsize=2)
def _load_pipeline(path_str: str, modified_ns: int):
    return joblib.load(path_str)


def read_metrics(metrics_path: Path | None = None) -> dict:
    metrics_path = metrics_path or config.METRICS_PATH
    if not metrics_path.is_file():
        raise ModelNotTrainedError("No trained house price model exists yet. Train a model first.")
    return json.loads(metrics_path.read_text(encoding="utf-8"))


def load_trained_pipeline(model_path: Path | None = None, metrics_path: Path | None = None):
    model_path = model_path or config.MODEL_PATH
    metrics = read_metrics(metrics_path)
    if not model_path.is_file():
        raise ModelNotTrainedError("The trained model file is missing. Train the model again.")
    pipeline = _load_pipeline(str(model_path), model_path.stat().st_mtime_ns)
    return pipeline, metrics


def predict_price(features: dict, model_path: Path | None = None, metrics_path: Path | None = None) -> dict:
    pipeline, metrics = load_trained_pipeline(model_path, metrics_path)

    row = {column: features.get(column) for column in RAW_FEATURES}
    for column in CATEGORICAL_FEATURES:
        row[column] = normalize_category(row[column])
    frame = pd.DataFrame([row], columns=list(RAW_FEATURES))

    estimate = float(pipeline.predict(frame)[0])
    selected = next(item for item in metrics["comparison"] if item["model"] == metrics["selected_model"])
    holdout_mae = selected["holdout"]["mae"]

    return {
        "estimated_price": round(estimate, 2),
        "range_low": round(max(estimate - holdout_mae, 0.0), 2),
        "range_high": round(estimate + holdout_mae, 2),
        "model": metrics["selected_model"],
        "model_label": metrics["selected_label"],
        "holdout_mae": holdout_mae,
        "holdout_r2": selected["holdout"]["r2"],
        "trained_at": metrics["trained_at"],
        "note": "The range is the estimate plus or minus the model's holdout MAE on its training dataset. It is not a guarantee of sale price.",
    }


def read_model_status(model_path: Path | None = None, metrics_path: Path | None = None, dataset_dir: Path | None = None) -> dict:
    model_path = model_path or config.MODEL_PATH
    metrics_path = metrics_path or config.METRICS_PATH
    dataset_dir = dataset_dir or config.DATASET_DIR

    datasets = sorted(path.name for path in dataset_dir.glob("*.csv"))
    trained = model_path.is_file() and metrics_path.is_file()
    status = {
        "trained": trained,
        "available_datasets": datasets,
        "ready_to_train": bool(datasets),
        "selected_model": None,
        "trained_at": None,
    }
    if trained:
        metrics = read_metrics(metrics_path)
        status["selected_model"] = metrics["selected_model"]
        status["trained_at"] = metrics["trained_at"]
    return status
