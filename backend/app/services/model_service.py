from __future__ import annotations

from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from ..schemas import TeamFeatures


class ModelService:
    def __init__(self) -> None:
        self.base = Path(__file__).resolve().parents[1]
        self.model_path = self.base / "artifacts" / "champion_model.joblib"
        self.bundle = self._load_or_train()
        self.pipeline = self.bundle["pipeline"]
        self.features = self.bundle["features"]

    def _load_or_train(self):
        if self.model_path.exists():
            return joblib.load(self.model_path)
        from scripts.train_model import train

        train()
        return joblib.load(self.model_path)

    def _to_frame(self, teams: list[TeamFeatures]) -> pd.DataFrame:
        rows = [t.model_dump() for t in teams]
        df = pd.DataFrame(rows)
        for feature in self.features:
            if feature not in df.columns:
                df[feature] = 0.0
        return df

    def champion_probabilities(self, teams: list[TeamFeatures]) -> list[tuple[str, float, str]]:
        df = self._to_frame(teams)
        raw = self.pipeline.predict_proba(df[self.features])[:, 1]
        normalized = raw / raw.sum() if raw.sum() > 0 else np.ones_like(raw) / len(raw)
        output: list[tuple[str, float, str]] = []
        model = self.pipeline.named_steps["model"]
        coefs = np.array(model.coef_[0])
        for idx, team in enumerate(teams):
            row = df.iloc[idx]
            impacts = {feat: row[feat] * weight for feat, weight in zip(self.features, coefs)}
            top_feature = max(impacts, key=lambda k: abs(impacts[k]))
            explanation = (
                f"{team.team} probability is boosted by {top_feature.replace('_', ' ')} "
                f"and overall model strength signals."
            )
            output.append((team.team, float(normalized[idx]), explanation))
        return sorted(output, key=lambda x: x[1], reverse=True)

    def match_probabilities(self, home: TeamFeatures, away: TeamFeatures) -> tuple[float, float, float, str]:
        champion = self.champion_probabilities([home, away])
        probs = {name: p for name, p, _ in champion}
        home_p = probs.get(home.team, 0.5)
        away_p = probs.get(away.team, 0.5)
        closeness = abs(home_p - away_p)
        draw = max(0.12, 0.28 - closeness * 0.45)
        remaining = max(1e-9, 1 - draw)
        total_non_draw = home_p + away_p
        home_win = remaining * (home_p / total_non_draw)
        away_win = remaining * (away_p / total_non_draw)
        explanation = (
            f"{home.team} vs {away.team} balances model strength, recent form and defensive indicators; "
            f"draw chance is adjusted by team parity."
        )
        return float(home_win), float(draw), float(away_win), explanation
