from __future__ import annotations

from pathlib import Path
import json
import pandas as pd


class DataRepository:
    def __init__(self) -> None:
        self.base = Path(__file__).resolve().parents[1]
        self.features_path = self.base / "data" / "team_features_1998_2022.csv"
        self.history_path = self.base / "data" / "world_cup_history.json"

    def _ensure_features(self) -> pd.DataFrame:
        if not self.features_path.exists():
            from scripts.prepare_features import build_dataset

            df = build_dataset()
            self.features_path.parent.mkdir(parents=True, exist_ok=True)
            df.to_csv(self.features_path, index=False)
            return df
        return pd.read_csv(self.features_path)

    def get_latest_team_profiles(self) -> list[dict]:
        df = self._ensure_features()
        latest = df[df["year"] == df["year"].max()].copy()
        return latest.sort_values("elo_rating", ascending=False).to_dict(orient="records")

    def get_team_profile(self, team: str) -> dict | None:
        df = self._ensure_features()
        team_df = df[df["team"].str.lower() == team.lower()].sort_values("year")
        if team_df.empty:
            return None
        latest = team_df.iloc[-1].to_dict()
        history = team_df[["year", "goals_scored", "goals_conceded", "xg", "recent_form"]].to_dict(orient="records")
        latest["history"] = history
        return latest

    def world_cup_history(self) -> list[dict]:
        if not self.history_path.exists():
            return []
        return json.loads(self.history_path.read_text(encoding="utf-8"))
