import { sampleTeams } from "./fixtures";
import { ChampionPrediction, KnockoutResult, MatchPrediction, TeamFeatures } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function safeFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getTeams(): Promise<TeamFeatures[]> {
  const api = await safeFetch<TeamFeatures[]>("/teams");
  return api?.length ? api : sampleTeams;
}

export async function getTeam(team: string): Promise<(TeamFeatures & { history?: Array<Record<string, number>> }) | null> {
  const api = await safeFetch<TeamFeatures & { history?: Array<Record<string, number>> }>(`/teams/${encodeURIComponent(team)}`);
  if (api) return api;
  const fallback = sampleTeams.find((t) => t.team.toLowerCase() === team.toLowerCase());
  if (!fallback) return null;
  return {
    ...fallback,
    history: [2014, 2018, 2022].map((year, i) => ({
      year,
      goals_scored: Math.max(0.8, fallback.goals_scored - i * 0.1),
      goals_conceded: fallback.goals_conceded + i * 0.04,
      xg: Math.max(0.8, fallback.xg - i * 0.08),
      recent_form: Math.max(0.6, fallback.recent_form - i * 0.03),
    })),
  };
}

export async function getHistory(): Promise<Array<{ year: number; host: string; winner: string; runner_up: string }>> {
  const api = await safeFetch<Array<{ year: number; host: string; winner: string; runner_up: string }>>("/history/world-cups");
  return api ?? [
    { year: 2014, host: "Brazil", winner: "Germany", runner_up: "Argentina" },
    { year: 2018, host: "Russia", winner: "France", runner_up: "Croatia" },
    { year: 2022, host: "Qatar", winner: "Argentina", runner_up: "France" },
  ];
}

export async function predictChampion(teams: TeamFeatures[]): Promise<ChampionPrediction[]> {
  const api = await safeFetch<{ probabilities: ChampionPrediction[] }>("/predict/champion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teams }),
  });
  if (api?.probabilities?.length) return api.probabilities;
  const total = teams.reduce((acc, t) => acc + t.elo_rating, 0);
  return teams
    .map((t) => ({
      team: t.team,
      probability: t.elo_rating / total,
      explanation: `${t.team} fallback probability is estimated from relative Elo strength while API is unavailable.`,
    }))
    .sort((a, b) => b.probability - a.probability);
}

export async function predictMatch(home: TeamFeatures, away: TeamFeatures): Promise<MatchPrediction> {
  const api = await safeFetch<MatchPrediction>("/predict/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ home, away }),
  });
  if (api) return api;
  const total = home.elo_rating + away.elo_rating;
  const draw = 0.2;
  const remaining = 1 - draw;
  const homeWin = remaining * (home.elo_rating / total);
  return {
    home_team: home.team,
    away_team: away.team,
    home_win_probability: homeWin,
    draw_probability: draw,
    away_win_probability: 1 - draw - homeWin,
    explanation: "Fallback prediction based on relative Elo split and fixed draw prior.",
  };
}

export async function simulateKnockout(teams: TeamFeatures[]): Promise<KnockoutResult> {
  const api = await safeFetch<KnockoutResult>("/predict/knockout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teams, simulations: 800 }),
  });
  if (api) return api;
  const champion = await predictChampion(teams);
  const all = Object.fromEntries(champion.map((c) => [c.team, c.probability]));
  return {
    winner: champion[0].team,
    winner_probability: champion[0].probability,
    all_probabilities: all,
    explanation: "Fallback simulation uses champion probabilities as bracket approximations.",
  };
}
