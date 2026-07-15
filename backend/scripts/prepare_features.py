from __future__ import annotations

from pathlib import Path
import numpy as np
import pandas as pd

YEARS = [1998, 2002, 2006, 2010, 2014, 2018, 2022]
CHAMPIONS = {
    1998: "France",
    2002: "Brazil",
    2006: "Italy",
    2010: "Spain",
    2014: "Germany",
    2018: "France",
    2022: "Argentina",
}
TEAMS = {
    "Argentina": 85,
    "Brazil": 90,
    "France": 89,
    "Germany": 87,
    "Spain": 84,
    "England": 82,
    "Portugal": 81,
    "Netherlands": 80,
    "Italy": 83,
    "Belgium": 79,
    "Croatia": 76,
    "Uruguay": 75,
}


def _row(team: str, year: int, base: int, champion: str) -> dict:
    year_factor = (year - 1998) / 24
    trend = np.sin((year - 1998) / 4)
    champion_bonus = 4 if team == champion else 0
    np.random.seed(abs(hash((team, year))) % (2**32 - 1))
    fifa_rank = max(1, int(25 - (base - 70) / 2 + np.random.randint(-3, 4) - champion_bonus / 2))
    elo_rating = 1700 + base * 4 + int(20 * trend) + champion_bonus * 10
    recent_form = round(0.45 + (base - 70) / 50 + champion_bonus / 12 + np.random.normal(0, 0.04), 3)
    goals_scored = round(1.1 + (base - 70) / 25 + champion_bonus / 6 + np.random.normal(0, 0.2), 2)
    goals_conceded = round(1.3 - (base - 70) / 40 - champion_bonus / 10 + abs(np.random.normal(0, 0.15)), 2)
    possession = round(45 + (base - 70) * 0.8 + np.random.normal(0, 1.5), 2)
    xg = round(1.0 + (base - 70) / 28 + champion_bonus / 7 + np.random.normal(0, 0.12), 2)
    squad_value = round(300 + (base - 70) * 42 + year_factor * 200 + np.random.normal(0, 15), 2)
    avg_age = round(25.5 + np.random.normal(0, 1.1), 2)
    manager_experience = round(4 + (base - 70) / 8 + np.random.normal(0, 1), 2)
    wc_pedigree = round((base - 70) / 3 + (2 if team in {"Brazil", "Germany", "Italy", "Argentina", "France"} else 0), 2)

    return {
        "year": year,
        "team": team,
        "fifa_rank": fifa_rank,
        "elo_rating": elo_rating,
        "recent_form": max(0.0, min(1.0, recent_form)),
        "goals_scored": max(0.2, goals_scored),
        "goals_conceded": max(0.2, goals_conceded),
        "possession": max(35.0, min(70.0, possession)),
        "xg": max(0.4, xg),
        "squad_market_value": max(120.0, squad_value),
        "average_age": max(22.0, min(32.0, avg_age)),
        "manager_experience": max(1.0, manager_experience),
        "wc_pedigree": max(0.0, wc_pedigree),
        "is_champion": int(team == champion),
    }


def build_dataset() -> pd.DataFrame:
    rows = []
    for year in YEARS:
        champion = CHAMPIONS[year]
        for team, base in TEAMS.items():
            rows.append(_row(team, year, base, champion))
    return pd.DataFrame(rows)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    output = root / "app" / "data" / "team_features_1998_2022.csv"
    output.parent.mkdir(parents=True, exist_ok=True)
    build_dataset().to_csv(output, index=False)
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
