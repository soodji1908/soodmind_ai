from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

from api import config

REQUIRED_COLUMNS = ("price", "area_sqft", "bedrooms", "bathrooms")
NUMERIC_COLUMNS = ("price", "area_sqft", "bedrooms", "bathrooms", "year_built", "lot_size_sqft", "garage_spaces")
CATEGORICAL_COLUMNS = ("location", "property_type")


class DatasetError(Exception):
    pass


class InsufficientDataError(Exception):
    def __init__(self, valid_rows: int, required_rows: int):
        super().__init__(f"Only {valid_rows} valid rows; at least {required_rows} are required.")
        self.valid_rows = valid_rows
        self.required_rows = required_rows


@dataclass(frozen=True)
class DatasetSummary:
    file_name: str
    total_rows: int
    valid_rows: int
    dropped_rows: int
    missing_values: dict[str, int] = field(default_factory=dict)


def resolve_dataset_path(file_name: str) -> Path:
    name = Path(file_name).name
    if name != file_name or not name.lower().endswith(".csv"):
        raise DatasetError("The dataset must be a CSV file name stored in house_price/datasets.")
    path = config.DATASET_DIR / name
    if not path.is_file():
        raise DatasetError(
            f"Dataset '{name}' was not found in house_price/datasets. Place your CSV file there and try again."
        )
    return path


def load_dataset(path: Path) -> tuple[pd.DataFrame, DatasetSummary]:
    try:
        raw = pd.read_csv(path)
    except (pd.errors.ParserError, pd.errors.EmptyDataError, UnicodeDecodeError) as exc:
        raise DatasetError(f"The CSV file could not be read: {exc}") from exc

    raw.columns = [str(column).strip().lower().replace(" ", "_") for column in raw.columns]
    missing_required = [column for column in REQUIRED_COLUMNS if column not in raw.columns]
    if missing_required:
        raise DatasetError("The dataset is missing required columns: " + ", ".join(missing_required) + ".")

    frame = raw.copy()
    for column in NUMERIC_COLUMNS:
        if column in frame.columns:
            frame[column] = pd.to_numeric(frame[column], errors="coerce")
    for column in CATEGORICAL_COLUMNS:
        if column not in frame.columns:
            frame[column] = "unknown"
        values = frame[column].fillna("").astype(str).str.strip().str.lower()
        frame[column] = values.mask(values == "", "unknown")

    missing_values = {
        column: int(frame[column].isna().sum()) for column in NUMERIC_COLUMNS if column in frame.columns
    }

    valid_mask = (
        frame["price"].gt(0)
        & frame["area_sqft"].gt(0)
        & frame["bedrooms"].ge(0)
        & frame["bathrooms"].ge(0)
    )
    valid = frame.loc[valid_mask].reset_index(drop=True)

    summary = DatasetSummary(
        file_name=path.name,
        total_rows=len(frame),
        valid_rows=len(valid),
        dropped_rows=len(frame) - len(valid),
        missing_values=missing_values,
    )

    if len(valid) < config.MIN_TRAINING_ROWS:
        raise InsufficientDataError(len(valid), config.MIN_TRAINING_ROWS)

    return valid, summary
