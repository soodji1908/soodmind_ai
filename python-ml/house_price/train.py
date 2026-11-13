import argparse
import json
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split

from api import config
from house_price.dataset import DatasetSummary, load_dataset, resolve_dataset_path
from house_price.evaluate import cross_validate_pipeline, regression_metrics
from house_price.model import MODEL_FACTORIES, MODEL_LABELS, build_model_pipeline
from house_price.preprocess import RAW_FEATURES

TEST_SIZE = 0.2
CV_FOLDS = 5
RANDOM_STATE = 42
SELECTION_RULE = (
    "The model with the lowest mean cross-validated RMSE on the training split is selected. "
    "Holdout metrics are reported but were not used for selection."
)


@dataclass
class TrainingResult:
    report: dict
    pipeline: object


def train_models(frame: pd.DataFrame, summary: DatasetSummary) -> TrainingResult:
    features = frame.reindex(columns=list(RAW_FEATURES))
    target = frame["price"]
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    folds = max(2, min(CV_FOLDS, len(x_train) // 10))

    comparison = []
    fitted = {}
    for name in MODEL_FACTORIES:
        pipeline = build_model_pipeline(name)
        cross_validation = cross_validate_pipeline(pipeline, x_train, y_train, folds, RANDOM_STATE)
        pipeline.fit(x_train, y_train)
        holdout = regression_metrics(y_test, pipeline.predict(x_test))
        fitted[name] = pipeline
        comparison.append(
            {
                "model": name,
                "label": MODEL_LABELS[name],
                "cross_validation": cross_validation,
                "holdout": holdout,
            }
        )

    best = min(comparison, key=lambda row: row["cross_validation"]["rmse_mean"])
    report = {
        "selected_model": best["model"],
        "selected_label": best["label"],
        "selection_rule": SELECTION_RULE,
        "comparison": comparison,
        "dataset": asdict(summary),
        "train_rows": len(x_train),
        "test_rows": len(x_test),
        "feature_columns": list(RAW_FEATURES),
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    return TrainingResult(report=report, pipeline=fitted[best["model"]])


def save_training_result(result: TrainingResult, model_path: Path | None = None, metrics_path: Path | None = None) -> dict:
    model_path = model_path or config.MODEL_PATH
    metrics_path = metrics_path or config.METRICS_PATH
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(result.pipeline, model_path)
    metrics_path.write_text(json.dumps(result.report, indent=2), encoding="utf-8")
    return result.report


def train_from_file(file_name: str) -> dict:
    path = resolve_dataset_path(file_name)
    frame, summary = load_dataset(path)
    result = train_models(frame, summary)
    return save_training_result(result)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Train and compare house price models from a CSV in house_price/datasets.")
    parser.add_argument("--dataset", required=True, help="CSV file name inside house_price/datasets, e.g. houses.csv")
    args = parser.parse_args(argv)
    try:
        report = train_from_file(args.dataset)
    except Exception as exc:
        print(f"Training stopped: {exc}")
        return 1
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
