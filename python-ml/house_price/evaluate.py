import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_validate


def regression_metrics(y_true, y_pred) -> dict[str, float]:
    actual = np.asarray(y_true, dtype=float)
    predicted = np.asarray(y_pred, dtype=float)
    return {
        "mae": round(float(mean_absolute_error(actual, predicted)), 2),
        "rmse": round(float(np.sqrt(mean_squared_error(actual, predicted))), 2),
        "r2": round(float(r2_score(actual, predicted)), 4),
    }


def cross_validate_pipeline(estimator, features, target, folds: int, random_state: int = 42) -> dict:
    splitter = KFold(n_splits=folds, shuffle=True, random_state=random_state)
    scores = cross_validate(
        estimator,
        features,
        target,
        cv=splitter,
        scoring={
            "mae": "neg_mean_absolute_error",
            "rmse": "neg_root_mean_squared_error",
            "r2": "r2",
        },
    )
    mae = -scores["test_mae"]
    rmse = -scores["test_rmse"]
    r2 = scores["test_r2"]
    return {
        "folds": folds,
        "mae_mean": round(float(mae.mean()), 2),
        "mae_std": round(float(mae.std()), 2),
        "rmse_mean": round(float(rmse.mean()), 2),
        "rmse_std": round(float(rmse.std()), 2),
        "r2_mean": round(float(r2.mean()), 4),
        "r2_std": round(float(r2.std()), 4),
    }
