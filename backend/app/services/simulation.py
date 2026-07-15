from __future__ import annotations

import random
from collections import Counter
from ..schemas import TeamFeatures
from .model_service import ModelService


class KnockoutSimulator:
    def __init__(self, model_service: ModelService) -> None:
        self.model_service = model_service

    def _winner(self, a: TeamFeatures, b: TeamFeatures) -> TeamFeatures:
        home, _, away, _ = self.model_service.match_probabilities(a, b)
        return a if random.random() < home / (home + away) else b

    def simulate(self, teams: list[TeamFeatures], runs: int) -> dict[str, float]:
        if len(teams) < 2:
            return {teams[0].team: 1.0} if teams else {}
        counter: Counter[str] = Counter()
        for _ in range(runs):
            remaining = teams[:]
            random.shuffle(remaining)
            while len(remaining) > 1:
                next_round: list[TeamFeatures] = []
                if len(remaining) % 2 == 1:
                    next_round.append(remaining.pop())
                for idx in range(0, len(remaining), 2):
                    next_round.append(self._winner(remaining[idx], remaining[idx + 1]))
                remaining = next_round
            counter[remaining[0].team] += 1
        return {k: v / runs for k, v in sorted(counter.items(), key=lambda x: x[1], reverse=True)}
