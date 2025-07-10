import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Common types for ETL operations
export interface ETLRun {
  run_type: "adp" | "stats" | "players" | "nfl-data" | "weekly-stats";
  records_processed: number;
  status: "success" | "error" | "partial";
  error_message?: string;
  last_created_timestamp?: number;
  last_season?: number;
  last_week?: number;
}

export interface SleeperDraft {
  draft_id: string;
  created: number;
  type: "redraft" | "dynasty";
  season: number;
  season_type: string;
}

export interface SleeperPick {
  player_id: string;
  pick_no: number;
}

export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  position?: string;
  team?: string;
  bye_week?: number;
}

export interface SleeperStats {
  player_id: string;
  pts_ppr?: number;
  rec_yd?: number;
  rec_td?: number;
  rush_yd?: number;
  pass_yd?: number;
  pass_td?: number;
}

export interface SleeperState {
  week: number;
  season: number;
  season_type: string;
}

// Rate limiting helper
export class RateLimiter {
  private lastRequest = 0;
  private minInterval = 500; // 0.5 seconds

  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;

    if (timeSinceLastRequest < this.minInterval) {
      const delay = this.minInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequest = Date.now();
  }
}

// Sleeper API client with rate limiting
export class SleeperAPI {
  private rateLimiter = new RateLimiter();
  private baseUrl = "https://api.sleeper.app/v1";

  async request<T>(endpoint: string): Promise<T> {
    await this.rateLimiter.throttle();

    const response = await fetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(
        `Sleeper API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async getMockDrafts(
    type: "redraft" | "dynasty",
    limit = 50,
    offset = 0
  ): Promise<SleeperDraft[]> {
    const currentYear = new Date().getFullYear();
    return this.request<SleeperDraft[]>(
      `/drafts/nfl/mock-drafts?season=${currentYear}&season_type=regular&type=${type}&limit=${limit}&offset=${offset}`
    );
  }

  async getDraftPicks(draftId: string): Promise<SleeperPick[]> {
    return this.request<SleeperPick[]>(`/draft/${draftId}/picks`);
  }

  async getWeeklyStats(
    season: number,
    week: number
  ): Promise<Record<string, SleeperStats>> {
    return this.request<Record<string, SleeperStats>>(
      `/stats/nfl/${season}/${week}?season_type=regular`
    );
  }

  async getPlayers(): Promise<Record<string, SleeperPlayer>> {
    return this.request<Record<string, SleeperPlayer>>("/players/nfl");
  }

  async getNFLState(): Promise<SleeperState> {
    return this.request<SleeperState>("/state/nfl");
  }
}

// Base ETL class with common functionality
export class ETLBase {
  protected supabase: any;
  protected api: SleeperAPI;

  constructor(supabaseUrl: string, serviceKey: string) {
    this.supabase = createClient(supabaseUrl, serviceKey);
    this.api = new SleeperAPI();
  }

  protected async logETLRun(run: ETLRun): Promise<void> {
    const { error } = await this.supabase.from("etl_metadata").insert({
      run_type: run.run_type,
      last_created_timestamp: run.last_created_timestamp,
      last_season: run.last_season,
      last_week: run.last_week,
      records_processed: run.records_processed,
      status: run.status,
      error_message: run.error_message,
    });

    if (error) throw error;
  }

  protected async handleErrors(error: Error, context: string): Promise<void> {
    console.error(`Error in ${context}:`, error);

    // Log error to database
    await this.supabase.from("etl_metadata").insert({
      run_type: context,
      status: "error",
      error_message: error.message,
      records_processed: 0,
    });

    throw error;
  }

  protected async getLastRefresh(runType: string): Promise<number> {
    const { data, error } = await this.supabase.rpc("get_last_refresh", {
      run_type_param: runType,
    });

    if (error) throw error;
    return data || 0;
  }

  protected async getLastStatsRefresh(): Promise<{
    last_season: number;
    last_week: number;
  }> {
    const { data, error } = await this.supabase.rpc("get_last_stats_refresh");

    if (error) throw error;
    return data[0] || { last_season: 2024, last_week: 0 };
  }

  protected async shouldUpdatePlayers(): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("sleeper_players_cache")
      .select("last_updated")
      .order("last_updated", { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) return true;

    const lastUpdate = new Date(data[0].last_updated);
    const hoursSinceUpdate =
      (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

    return hoursSinceUpdate >= 24;
  }

  protected async refreshViews(): Promise<void> {
    const { error } = await this.supabase.rpc("refresh_views");
    if (error) throw error;
  }

  protected async cleanOldMetadata(): Promise<void> {
    const { error } = await this.supabase.rpc("clean_old_etl_metadata");
    if (error) throw error;
  }

  protected async logQueryPerformance({
    query_type,
    execution_time_ms,
    rows_affected = 0,
    query_hash = undefined,
  }: {
    query_type: string;
    execution_time_ms: number;
    rows_affected?: number;
    query_hash?: string;
  }): Promise<void> {
    if (execution_time_ms > 1000) {
      console.warn(
        `[PERF ALERT] Slow query detected: ${query_type} took ${execution_time_ms}ms` +
          (query_hash ? ` (hash: ${query_hash})` : "")
      );
    }
    const { error } = await this.supabase.from("query_performance_log").insert({
      query_type,
      execution_time_ms,
      rows_affected,
      query_hash,
    });
    if (error) throw error;
  }
}
