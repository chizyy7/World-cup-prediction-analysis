from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    ChampionPredictionRequest,
    ChampionPredictionResponse,
    KnockoutResult,
    KnockoutSimulationRequest,
    MatchPredictionRequest,
    MatchPredictionResponse,
    TeamProbability,
)
from .services.data_repository import DataRepository
from .services.model_service import ModelService
from .services.simulation import KnockoutSimulator

app = FastAPI(title="World Cup Prediction API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = DataRepository()
model_service = ModelService()
simulator = KnockoutSimulator(model_service)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/teams")
def teams() -> list[dict]:
    return repo.get_latest_team_profiles()


@app.get("/teams/{team}")
def team_profile(team: str) -> dict:
    profile = repo.get_team_profile(team)
    if profile is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return profile


@app.get("/history/world-cups")
def history() -> list[dict]:
    return repo.world_cup_history()


@app.post("/predict/champion", response_model=ChampionPredictionResponse)
def predict_champion(payload: ChampionPredictionRequest) -> ChampionPredictionResponse:
    preds = model_service.champion_probabilities(payload.teams)
    return ChampionPredictionResponse(
        probabilities=[
            TeamProbability(team=team, probability=prob, explanation=exp)
            for team, prob, exp in preds
        ]
    )


@app.post("/predict/match", response_model=MatchPredictionResponse)
def predict_match(payload: MatchPredictionRequest) -> MatchPredictionResponse:
    home, draw, away, explanation = model_service.match_probabilities(payload.home, payload.away)
    return MatchPredictionResponse(
        home_team=payload.home.team,
        away_team=payload.away.team,
        home_win_probability=home,
        draw_probability=draw,
        away_win_probability=away,
        explanation=explanation,
    )


@app.post("/predict/knockout", response_model=KnockoutResult)
def predict_knockout(payload: KnockoutSimulationRequest) -> KnockoutResult:
    probs = simulator.simulate(payload.teams, payload.simulations)
    if not probs:
        raise HTTPException(status_code=400, detail="No teams provided")
    winner = next(iter(probs.keys()))
    return KnockoutResult(
        winner=winner,
        winner_probability=float(probs[winner]),
        all_probabilities={k: float(v) for k, v in probs.items()},
        explanation="Tournament simulation combines repeated bracket runs with model-driven match probabilities.",
    )
