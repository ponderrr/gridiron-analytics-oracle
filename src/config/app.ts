export interface AppConfig {
  API_BASE_URL: string;
  SUPABASE_FUNCTIONS_URL: string;
  SUPPORT_EMAIL: string;
  FEATURE_FLAGS: {
    enableTradeAnalyzer: boolean;
    enableAdmin: boolean;
    enableFantasyPointsTest: boolean;
    enableLeagueManagement: boolean;
  };
  UI: {
    sidebarExpandedWidth: string;
    sidebarCollapsedWidth: string;
    defaultAnimationDuration: number;
    maxTableRows: number;
    refreshIntervalMs: number;
  };
  VALIDATION: {
    maxEmailLength: number;
    maxPasswordLength: number;
    maxPlayerNameLength: number;
  };
  PAGINATION: {
    defaultPageSize: number;
    maxPageSize: number;
    pageSizeOptions: number[];
  };
}

export const appConfig: AppConfig = {
  API_BASE_URL: "https://api.fantasyfootball.guru/v1",
  SUPABASE_FUNCTIONS_URL:
    "https://yhibrugwsqqbujeosxzg.supabase.co/functions/v1",
  SUPPORT_EMAIL: "support@fantasyfootball.guru",
  FEATURE_FLAGS: {
    enableTradeAnalyzer: true,
    enableAdmin: true,
    enableFantasyPointsTest: true,
    enableLeagueManagement: false, // Coming soon
  },
  UI: {
    sidebarExpandedWidth: "18rem",
    sidebarCollapsedWidth: "5rem",
    defaultAnimationDuration: 200,
    maxTableRows: 100,
    refreshIntervalMs: 30000, // 30 seconds
  },
  VALIDATION: {
    maxEmailLength: 254,
    maxPasswordLength: 128,
    maxPlayerNameLength: 100,
  },
  PAGINATION: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },
};
