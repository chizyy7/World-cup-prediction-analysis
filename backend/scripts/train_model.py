from __future__ import annotations

from pathlib import Path
import json
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURES = [
    "fifa_rank",
    "elo_rating",
    "recent_form",
    "goals_scored",
    "goals_conceded",
    "possession",
    "xg",
    "squad_market_value",
    "average_age",
    "manager_experience",
    "wc_pedigree",
]


def train() -> dict:
    root = Path(__file__).resolve().parents[1]
    data_path = root / "app" / "data" / "team_features_1998_2022.csv"
    if not data_path.exists():
        from scripts.prepare_features import build_dataset

        df = build_dataset()
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    for col in FEATURES:
        if col not in df.columns:
            df[col] = 0.0

    X = df[FEATURES]
    y = df["is_champion"].astype(int)

    pipeline = Pipeline(
        steps=[
            ("preprocess", ColumnTransformer([("num", StandardScaler(), FEATURES)])),
            ("model", LogisticRegression(max_iter=2000, class_weight="balanced")),
        ]
    )

    pipeline.fit(X, y)
    proba = pipeline.predict_proba(X)[:, 1]
    metrics = {
        "roc_auc": float(roc_auc_score(y, proba)),
        "brier_score": float(brier_score_loss(y, proba)),
        "samples": int(len(df)),
        "period": "1998-2022",
    }

    model_path = root / "app" / "artifacts" / "champion_model.joblib"
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline, "features": FEATURES}, model_path)

    metrics_path = root / "app" / "artifacts" / "evaluation.json"
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    train()
