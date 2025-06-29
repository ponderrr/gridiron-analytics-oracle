export interface AppConfig {
  API_BASE_URL: string;
  SUPABASE_FUNCTIONS_URL: string;
  SUPPORT_EMAIL: string;
  FEATURE_FLAGS: {
    enableTradeAnalyzer: boolean;
    enableAdmin: boolean;
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
  },
};
