from datetime import date

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

RAW_FEATURES = (
    "area_sqft",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size_sqft",
    "garage_spaces",
    "location",
    "property_type",
)
NUMERIC_RAW = ("area_sqft", "bedrooms", "bathrooms", "year_built", "lot_size_sqft", "garage_spaces")
CATEGORICAL_FEATURES = ("location", "property_type")
NUMERIC_FEATURES = (
    "area_sqft",
    "bedrooms",
    "bathrooms",
    "lot_size_sqft",
    "garage_spaces",
    "house_age",
    "bath_per_bedroom",
    "log_area",
)


def normalize_category(value) -> str:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return "unknown"
    text = str(value).strip().lower()
    return text or "unknown"


def engineer_features(frame: pd.DataFrame) -> pd.DataFrame:
    data = frame.copy()
    for column in RAW_FEATURES:
        if column not in data.columns:
            data[column] = np.nan
    for column in NUMERIC_RAW:
        data[column] = pd.to_numeric(data[column], errors="coerce")
    for column in CATEGORICAL_FEATURES:
        data[column] = data[column].map(normalize_category)

    data["house_age"] = (date.today().year - data["year_built"]).clip(lower=0)
    data["bath_per_bedroom"] = data["bathrooms"] / data["bedrooms"].clip(lower=1)
    data["log_area"] = np.log1p(data["area_sqft"].clip(lower=0))
    return data[list(NUMERIC_FEATURES) + list(CATEGORICAL_FEATURES)]


def build_preprocessor() -> ColumnTransformer:
    numeric = Pipeline(
        [
            ("impute", SimpleImputer(strategy="median", keep_empty_features=True)),
            ("scale", StandardScaler()),
        ]
    )
    categorical = Pipeline(
        [
            ("impute", SimpleImputer(strategy="constant", fill_value="unknown")),
            ("encode", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    return ColumnTransformer(
        [
            ("numeric", numeric, list(NUMERIC_FEATURES)),
            ("categorical", categorical, list(CATEGORICAL_FEATURES)),
        ]
    )
