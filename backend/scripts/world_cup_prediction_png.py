from __future__ import annotations

from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
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


def _load_data() -> pd.DataFrame:
    root = Path(__file__).resolve().parents[1]
    data_path = root / "app" / "data" / "team_features_1998_2022.csv"
    if not data_path.exists():
        from scripts.prepare_features import build_dataset

        df = build_dataset()
        data_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)
    return df


def _predict_from_previous_years(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, int]:
    predict_year = int(df["year"].max())
    train_df = df[df["year"] < predict_year].copy()
    eval_df = df[df["year"] == predict_year].copy()

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["is_champion"].astype(int)
    X_eval = eval_df[FEATURE_COLUMNS]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_eval_scaled = scaler.transform(X_eval)

    gb_model = GradientBoostingClassifier(
        n_estimators=250,
        learning_rate=0.05,
        max_depth=3,
        random_state=42,
    )
    gb_model.fit(X_train_scaled, y_train)
    gb_proba = gb_model.predict_proba(X_eval_scaled)[:, 1]

    rf_model = RandomForestClassifier(
        n_estimators=300,
        max_depth=6,
        class_weight="balanced",
        random_state=42,
    )
    rf_model.fit(X_train_scaled, y_train)
    rf_proba = rf_model.predict_proba(X_eval_scaled)[:, 1]

    eval_df["GB_Probability"] = gb_proba
    eval_df["RF_Probability"] = rf_proba
    eval_df["Final_Score"] = eval_df["GB_Probability"] * 0.6 + eval_df["RF_Probability"] * 0.4
    eval_df["Win_Probability_%"] = eval_df["Final_Score"] / eval_df["Final_Score"].sum() * 100
    results = eval_df[["team", "Win_Probability_%"]].sort_values(
        by="Win_Probability_%", ascending=False
    ).reset_index(drop=True)

    feature_importance = pd.DataFrame(
        {"feature": FEATURE_COLUMNS, "importance": rf_model.feature_importances_}
    ).sort_values(by="importance", ascending=False)

    return results, feature_importance, predict_year


def _save_chart(results: pd.DataFrame, feature_importance: pd.DataFrame, year: int, output_path: Path) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    top_n = min(10, len(results))
    top = results.head(top_n).iloc[::-1]
    colors = plt.cm.Blues(np.linspace(0.35, 0.9, top_n))
    bars = axes[0].barh(top["team"], top["Win_Probability_%"], color=colors)
    axes[0].set_title(f"World Cup {year} Predicted Win Probability")
    axes[0].set_xlabel("Win Probability (%)")
    axes[0].bar_label(bars, fmt="%.1f%%", padding=3)

    top_features = feature_importance.head(8).iloc[::-1]
    axes[1].barh(top_features["feature"], top_features["importance"], color="steelblue")
    axes[1].set_title("Top Feature Importances")
    axes[1].set_xlabel("Importance")

    plt.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def main() -> None:
    df = _load_data()
    results, feature_importance, year = _predict_from_previous_years(df)

    root = Path(__file__).resolve().parents[1]
    output = root / "app" / "artifacts" / f"world_cup_prediction_{year}.png"
    _save_chart(results, feature_importance, year, output)

    print(f"World Cup {year} predicted winner: {results.iloc[0]['team']}")
    print("Top 5 probabilities:")
    for idx, row in results.head(5).iterrows():
        print(f"{idx + 1}. {row['team']}: {row['Win_Probability_%']:.2f}%")
    print(f"Saved PNG: {output}")


if __name__ == "__main__":
    main()
