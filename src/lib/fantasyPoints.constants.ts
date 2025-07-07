export interface ScoringSettings {
  format: "standard" | "ppr" | "half_ppr";
  passing_yards_per_point: number;
  rushing_receiving_yards_per_point: number;
  passing_td_points: number;
  rushing_receiving_td_points: number;
  reception_points: number;
  interception_penalty: number;
  fumble_penalty: number;
}

export const DEFAULT_SCORING_SETTINGS: Record<string, ScoringSettings> = {
  standard: {
    format: "standard",
    passing_yards_per_point: 25,
    rushing_receiving_yards_per_point: 10,
    passing_td_points: 6,
    rushing_receiving_td_points: 6,
    reception_points: 0,
    interception_penalty: -2,
    fumble_penalty: -2,
  },
  ppr: {
    format: "ppr",
    passing_yards_per_point: 25,
    rushing_receiving_yards_per_point: 10,
    passing_td_points: 6,
    rushing_receiving_td_points: 6,
    reception_points: 1,
    interception_penalty: -2,
    fumble_penalty: -2,
  },
  half_ppr: {
    format: "half_ppr",
    passing_yards_per_point: 25,
    rushing_receiving_yards_per_point: 10,
    passing_td_points: 6,
    rushing_receiving_td_points: 6,
    reception_points: 0.5,
    interception_penalty: -2,
    fumble_penalty: -2,
  },
};

