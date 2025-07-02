export const THEME_CONSTANTS = {
  ICON_SIZES: {
    XS: "h-3 w-3",
    SM: "h-4 w-4",
    MD: "h-5 w-5",
    LG: "h-6 w-6",
    XL: "h-8 w-8",
    XXL: "h-12 w-12",
  },
  TEXT_SIZES: {
    XS: "text-xs",
    SM: "text-sm",
    BASE: "text-base",
    LG: "text-lg",
    XL: "text-xl",
    TWO_XL: "text-2xl",
    THREE_XL: "text-3xl",
    FOUR_XL: "text-4xl",
  },
  SPACING: {
    XS: "2",
    SM: "3",
    MD: "4",
    LG: "6",
    XL: "8",
  },
  PADDING: {
    SM: "p-2",
    MD: "p-3",
    LG: "p-4",
    XL: "p-6",
    XXL: "p-8",
  },
  MARGIN: {
    SM: "m-2",
    MD: "m-3",
    LG: "m-4",
    XL: "m-6",
  },
  GAP: {
    SM: "gap-2",
    MD: "gap-4",
    LG: "gap-6",
    XL: "gap-8",
  },
};

export const UI_CONSTANTS = {
  HEIGHT: {
    MIN_400: "min-h-[400px]",
    H_64: "h-64",
  },
  WIDTH: {
    MIN_8: "min-w-[8rem]",
    W_16: "w-16",
    H_16: "h-16",
  },
  SIDEBAR: {
    WIDTH_PX: "280px",
    COLLAPSED_WIDTH_PX: "80px",
    EXPANDED_WIDTH_PX: "288px",
    COLLAPSED_WIDTH_CSS_PX: "80px",
  },
  MIN_HEIGHT_400: "400px",
  MIN_HEIGHT_64: "64px",
  GRID_COLUMNS: {
    ONE: "grid-cols-1",
    TWO: "grid-cols-2",
    FOUR: "grid-cols-4",
    RESPONSIVE_TWO: "grid-cols-1 lg:grid-cols-2",
    RESPONSIVE_FOUR: "grid-cols-1 md:grid-cols-4",
  },
};

export const MESSAGE_CONSTANTS = {
  APP_NAME: "FF META",
  APP_TAGLINE: "Fantasy Football Meta",
  COPYRIGHT: `© ${new Date().getFullYear()} FF META. Fantasy Football Meta Analytics.`,
  LOADING: "Loading your experience...",
  ERROR_GENERIC: "An unknown error occurred.",
  ERROR_AUTH: "Authentication Error",
  ERROR_404: "404 Error: User attempted to access non-existent route:",
  ERROR_PLAYER_SYNC: "Player sync failed:",
  ERROR_STATS_SYNC: "Stats sync failed:",
  ERROR_FANTASY_POINTS: "Error calculating fantasy points:",
  RETRY_LABEL: "Retry",
  LOGIN_LABEL: "Login",
  SIGNUP_LABEL: "Sign Up",
  SYNC_PLAYERS_LABEL: "Sync NFL Players",
  SYNC_STATS_LABEL: "Sync Weekly Stats",
  SYNCING_PLAYERS_LABEL: "Syncing Players...",
  SYNCING_STATS_LABEL: "Syncing Stats...",
  UPGRADE_NOW_LABEL: "UPGRADE NOW",
  SOON_LABEL: "SOON",
  ACCOUNT_CREATED_SUCCESS:
    "Account created successfully! Please check your email to confirm your account before signing in.",
  PLAYER_SYNC_SUCCESS: "Player sync completed successfully! Added",
  STATS_SYNC_SUCCESS: "Stats sync completed successfully! Added",
  FAILED_TO_LOAD_DATA: "Failed to load data",
  PLAYERS_ADDED: "Added:",
  PLAYERS_PROCESSED: "Processed:",
  PRO_TIER_TITLE: "PRO TIER",
  PRO_TIER_DESCRIPTION: "Unlock advanced analytics and AI insights",
  DOMINATE_LEAGUE: "DOMINATE YOUR LEAGUE",
};

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
export const CARD_TYPES = {
  STAT: "stat",
  PLAYER: "player",
  FEATURE: "feature",
} as const;

export const SIDEBAR_EXPANDED_WIDTH_PX = UI_CONSTANTS.SIDEBAR.EXPANDED_WIDTH_PX;
export const SIDEBAR_COLLAPSED_WIDTH_CSS_PX =
  UI_CONSTANTS.SIDEBAR.COLLAPSED_WIDTH_CSS_PX;
