export const ADMIN_TABS = {
  PLAYERS: "players",
  STATS: "stats",
  PROJECTIONS: "projections",
  TRADE_VALUES: "trade-values",
  DATA_SYNC: "data-sync",
} as const;

export const ADMIN_TAB_LABELS = {
  PLAYERS: "Players",
  WEEKLY_STATS: "Weekly Stats",
  PROJECTIONS: "Projections",
  TRADE_VALUES: "Trade Values",
  DATA_SYNC: "Data Sync",
} as const;

export const SYNC_SECTIONS = {
  PLAYER_SYNC: "NFL Player Data Sync",
  STATS_SYNC: "Weekly Stats Sync",
} as const;

export const SYNC_DESCRIPTIONS = {
  PLAYER_SYNC:
    "Sync current season player data from ESPN including names, positions, teams, and bye weeks.",
  STATS_SYNC:
    "Sync weekly player statistics including passing, rushing, receiving, and defensive stats.",
} as const;
