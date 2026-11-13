import numpy as np
from sklearn.compose import TransformedTargetRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer

from house_price.preprocess import build_preprocessor, engineer_features

MODEL_FACTORIES = {
    "linear_regression": LinearRegression,
    "random_forest": lambda: RandomForestRegressor(n_estimators=300, min_samples_leaf=2, random_state=42),
    "gradient_boosting": lambda: GradientBoostingRegressor(random_state=42),
}

MODEL_LABELS = {
    "linear_regression": "Linear Regression",
    "random_forest": "Random Forest Regressor",
    "gradient_boosting": "Gradient Boosting Regressor",
}


def build_model_pipeline(name: str) -> TransformedTargetRegressor:
    if name not in MODEL_FACTORIES:
        raise ValueError(f"Unknown model: {name}")
    pipeline = Pipeline(
        [
            ("features", FunctionTransformer(engineer_features)),
            ("preprocess", build_preprocessor()),
            ("regressor", MODEL_FACTORIES[name]()),
        ]
    )
    return TransformedTargetRegressor(regressor=pipeline, func=np.log1p, inverse_func=np.expm1)
