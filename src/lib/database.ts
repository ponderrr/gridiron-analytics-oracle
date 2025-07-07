export interface Player {
  active: boolean | null;
  bye_week: number | null;
  created_at: string;
  id: string;
  metadata: any | null;
  name: string;
  player_id: string;
  position: string;
  team: string;
  updated_at: string;
}

export interface WeeklyStat {
  created_at: string;
  fantasy_points: number | null;
  fumbles_lost: number | null;
  id: string;
  passing_interceptions: number | null;
  passing_tds: number | null;
  passing_yards: number | null;
  player_id: string | null;
  receiving_tds: number | null;
  receiving_yards: number | null;
  receptions: number | null;
  rushing_tds: number | null;
  rushing_yards: number | null;
  season: number;
  week: number;
}

export interface Projection {
  confidence_score: number | null;
  created_at: string;
  id: string;
  player_id: string | null;
  projected_points: number;
  projection_type: string;
  season: number;
  week: number;
}

export interface TradeValue {
  created_at: string;
  id: string;
  player_id: string | null;
  season: number;
  tier: number | null;
  trade_value: number;
  week: number;
}

export interface DraftPick {
  created_at: string;
  id: string;
  league_type: string;
  overall_pick: number;
  pick: number;
  round: number;
  year: number;
}

export interface UserRankingsPlayer {
  created_at: string;
  notes: string | null;
  overall_rank: number | null;
  pick_id: string | null;
  player_id: string;
  ranking_set_id: string;
  tier: number | null;
}

export interface UserRankingsSet {
  created_at: string;
  format: string;
  id: string;
  is_active: boolean | null;
  name: string;
  updated_at: string;
  user_id: string;
}
