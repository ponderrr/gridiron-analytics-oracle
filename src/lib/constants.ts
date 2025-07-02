export const APP_NAME = "FF META";
export const APP_TAGLINE = "Fantasy Football Meta";
export const COPYRIGHT = `© ${new Date().getFullYear()} FF META. Fantasy Football Meta Analytics.`;
export const SIDEBAR_WIDTH = 280; // px
export const SIDEBAR_COLLAPSED_WIDTH = 80; // px
export const SIDEBAR_EXPANDED_WIDTH = "18rem";
export const SIDEBAR_COLLAPSED_WIDTH_CSS = "5rem";
export const MIN_HEIGHT_400 = "400px";
export const MIN_HEIGHT_64 = "64px";
export const LOADING_MESSAGE = "Loading your experience...";
export const ERROR_GENERIC = "An unknown error occurred.";
export const ERROR_AUTH = "Authentication Error";
export const ERROR_404 =
  "404 Error: User attempted to access non-existent route:";
export const ERROR_PLAYER_SYNC = "Player sync failed:";
export const ERROR_STATS_SYNC = "Stats sync failed:";
export const ERROR_FANTASY_POINTS = "Error calculating fantasy points:";
export const RETRY_LABEL = "Retry";
export const LOGIN_LABEL = "Login";
export const SIGNUP_LABEL = "Sign Up";
export const SYNC_PLAYERS_LABEL = "Sync NFL Players";
export const SYNC_STATS_LABEL = "Sync Weekly Stats";
export const SYNCING_PLAYERS_LABEL = "Syncing Players...";
export const SYNCING_STATS_LABEL = "Syncing Stats...";
export const UPGRADE_NOW_LABEL = "UPGRADE NOW";
export const SOON_LABEL = "SOON";
export const ACCOUNT_CREATED_SUCCESS =
  "Account created successfully! Please check your email to confirm your account before signing in.";
export const PLAYER_SYNC_SUCCESS = "Player sync completed successfully! Added";
export const STATS_SYNC_SUCCESS = "Stats sync completed successfully! Added";
export const EMAIL_REQUIRED = "Email is required.";
export const PASSWORD_REQUIRED = "Password is required.";
export const CONFIRM_PASSWORD_REQUIRED = "Please confirm your password.";
export const PASSWORDS_DONT_MATCH = "Passwords do not match.";
export const NAV_SECTIONS = {
  MAIN: "Main",
  ANALYSIS: "Analysis",
  MANAGEMENT: "Management",
  TOOLS: "Tools",
} as const;
export const NAV_ITEMS = {
  DASHBOARD: "Dashboard",
  PLAYERS: "Players",
  ANALYTICS: "Analytics",
  TRADE_ANALYZER: "Trade Analyzer",
  LEAGUE: "League",
  ADMIN_PANEL: "Admin Panel",
  POINTS_CALCULATOR: "Points Calculator",
  SETTINGS: "Settings",
} as const;
export const NAV_PATHS = {
  DASHBOARD: "/dashboard",
  PLAYERS: "/players",
  ANALYTICS: "/analytics",
  TRADE_ANALYZER: "/trade-analyzer",
  LEAGUE: "/league",
  ADMIN: "/admin",
  FANTASY_POINTS_TEST: "/fantasy-points-test",
  SETTINGS: "/settings",
} as const;
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
export const FAILED_TO_LOAD_DATA = "Failed to load data";
export const PLAYERS_ADDED = "Added:";
export const PLAYERS_PROCESSED = "Processed:";
export const PRO_TIER_TITLE = "PRO TIER";
export const PRO_TIER_DESCRIPTION = "Unlock advanced analytics and AI insights";
export const DOMINATE_LEAGUE = "DOMINATE YOUR LEAGUE";
export const CARD_TYPES = {
  STAT: "stat",
  PLAYER: "player",
  FEATURE: "feature",
} as const;
export const ICON_SIZES = {
  XS: "h-3 w-3",
  SM: "h-4 w-4",
  MD: "h-5 w-5",
  LG: "h-6 w-6",
  XL: "h-8 w-8",
  XXL: "h-12 w-12",
} as const;
export const SPACING = {
  XS: "2",
  SM: "3",
  MD: "4",
  LG: "6",
  XL: "8",
} as const;
export const GRID_COLUMNS = {
  ONE: "grid-cols-1",
  TWO: "grid-cols-2",
  FOUR: "grid-cols-4",
  RESPONSIVE_TWO: "grid-cols-1 lg:grid-cols-2",
  RESPONSIVE_FOUR: "grid-cols-1 md:grid-cols-4",
} as const;
export const TEXT_SIZES = {
  XS: "text-xs",
  SM: "text-sm",
  BASE: "text-base",
  LG: "text-lg",
  XL: "text-xl",
  TWO_XL: "text-2xl",
  THREE_XL: "text-3xl",
  FOUR_XL: "text-4xl",
} as const;
export const PADDING = {
  SM: "p-2",
  MD: "p-3",
  LG: "p-4",
  XL: "p-6",
  XXL: "p-8",
} as const;
export const MARGIN = {
  SM: "m-2",
  MD: "m-3",
  LG: "m-4",
  XL: "m-6",
} as const;
export const GAP = {
  SM: "gap-2",
  MD: "gap-4",
  LG: "gap-6",
  XL: "gap-8",
} as const;
export const HEIGHT = {
  MIN_400: "min-h-[400px]",
  H_64: "h-64",
} as const;
export const WIDTH = {
  MIN_8: "min-w-[8rem]",
  W_16: "w-16",
  H_16: "h-16",
} as const;
