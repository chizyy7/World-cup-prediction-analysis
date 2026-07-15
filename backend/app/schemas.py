from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Dict, List


class TeamFeatures(BaseModel):
    team: str
    fifa_rank: int = Field(ge=1, le=210)
    elo_rating: float
    recent_form: float = Field(ge=0, le=1)
    goals_scored: float = Field(ge=0)
    goals_conceded: float = Field(ge=0)
    possession: float = Field(ge=0, le=100)
    xg: float = Field(ge=0)
    squad_market_value: float = Field(ge=0)
    average_age: float = Field(ge=16, le=45)
    manager_experience: float = Field(ge=0)
    wc_pedigree: float = Field(ge=0)


class ChampionPredictionRequest(BaseModel):
    teams: List[TeamFeatures]


class MatchPredictionRequest(BaseModel):
    home: TeamFeatures
    away: TeamFeatures


class KnockoutSimulationRequest(BaseModel):
    teams: List[TeamFeatures]
    simulations: int = Field(default=500, ge=100, le=5000)


class TeamProbability(BaseModel):
    team: str
    probability: float
    explanation: str


class ChampionPredictionResponse(BaseModel):
    probabilities: List[TeamProbability]


class MatchPredictionResponse(BaseModel):
    home_team: str
    away_team: str
    home_win_probability: float
    draw_probability: float
    away_win_probability: float
    explanation: str


class KnockoutResult(BaseModel):
    winner: str
    winner_probability: float
    all_probabilities: Dict[str, float]
    explanation: str
