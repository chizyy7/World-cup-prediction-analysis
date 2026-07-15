export type TeamFeatures = {
  team: string;
  fifa_rank: number;
  elo_rating: number;
  recent_form: number;
  goals_scored: number;
  goals_conceded: number;
  possession: number;
  xg: number;
  squad_market_value: number;
  average_age: number;
  manager_experience: number;
  wc_pedigree: number;
};

export type ChampionPrediction = {
  team: string;
  probability: number;
  explanation: string;
};

export type MatchPrediction = {
  home_team: string;
  away_team: string;
  home_win_probability: number;
  draw_probability: number;
  away_win_probability: number;
  explanation: string;
};

export type KnockoutResult = {
  winner: string;
  winner_probability: number;
  all_probabilities: Record<string, number>;
  explanation: string;
};
