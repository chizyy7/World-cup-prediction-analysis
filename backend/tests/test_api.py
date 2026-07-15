from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def sample_team(name: str):
    return {
        "team": name,
        "fifa_rank": 5,
        "elo_rating": 1900,
        "recent_form": 0.8,
        "goals_scored": 2.1,
        "goals_conceded": 0.8,
        "possession": 57,
        "xg": 2.0,
        "squad_market_value": 1200,
        "average_age": 27,
        "manager_experience": 8,
        "wc_pedigree": 9,
    }


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_champion_prediction():
    res = client.post("/predict/champion", json={"teams": [sample_team("Brazil"), sample_team("France")]})
    assert res.status_code == 200
    body = res.json()
    assert "probabilities" in body
    assert len(body["probabilities"]) == 2


def test_match_prediction_probability_sum():
    res = client.post("/predict/match", json={"home": sample_team("Brazil"), "away": sample_team("France")})
    assert res.status_code == 200
    body = res.json()
    total = body["home_win_probability"] + body["draw_probability"] + body["away_win_probability"]
    assert abs(total - 1.0) < 1e-6
