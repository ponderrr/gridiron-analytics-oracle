import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import {
  ETLBase,
  ETLRun,
  SleeperDraft,
  SleeperPick,
  SleeperPlayer,
  SleeperStats,
} from "../_shared/etl-utils.ts";

// Database operations class using shared base
class DatabaseOps extends ETLBase {
  computeQueryHash(queryType: string, params: unknown): string {
    const serialized = JSON.stringify({ queryType, params });
    return createHash("md5").update(serialized).toString();
  }

  async insertDraft(draft: SleeperDraft): Promise<void> {
    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_drafts")
      .upsert(draft, { onConflict: "draft_id" });
    const end = Date.now();
    const execution_time_ms = end - start;
    await this.logQueryPerformance({
      query_type: "upsert_sleeper_drafts",
      execution_time_ms,
      rows_affected: 1,
      query_hash: this.computeQueryHash("upsert_sleeper_drafts", draft),
    });
    if (error) throw error;
  }

  async insertPicks(draftId: string, picks: SleeperPick[]): Promise<void> {
    if (picks.length === 0) return;
    const picksData = picks.map((pick) => ({
      draft_id: draftId,
      player_id: pick.player_id,
      pick_no: pick.pick_no,
    }));
    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_picks")
      .upsert(picksData, { onConflict: "draft_id,player_id" });
    const end = Date.now();
    const execution_time_ms = end - start;
    await this.logQueryPerformance({
      query_type: "upsert_sleeper_picks",
      execution_time_ms,
      rows_affected: picksData.length,
      query_hash: this.computeQueryHash("upsert_sleeper_picks", picksData),
    });
    if (error) throw error;
  }

  async insertStats(
    season: number,
    week: number,
    stats: Record<string, SleeperStats>
  ): Promise<void> {
    const statsData = Object.entries(stats).map(([playerId, stat]) => ({
      season,
      week,
      player_id: playerId,
      pts_ppr: stat.pts_ppr,
      rec_yd: stat.rec_yd || 0,
      rec_td: stat.rec_td || 0,
      rush_yd: stat.rush_yd || 0,
      pass_yd: stat.pass_yd || 0,
      pass_td: stat.pass_td || 0,
    }));
    if (statsData.length === 0) return;
    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_stats")
      .upsert(statsData, { onConflict: "season,week,player_id" });
    const end = Date.now();
    const execution_time_ms = end - start;
    await this.logQueryPerformance({
      query_type: "upsert_sleeper_stats",
      execution_time_ms,
      rows_affected: statsData.length,
      query_hash: this.computeQueryHash("upsert_sleeper_stats", statsData),
    });
    if (error) throw error;
  }

  async upsertPlayers(players: Record<string, SleeperPlayer>): Promise<void> {
    const playersData = Object.entries(players).map(([playerId, player]) => ({
      player_id: playerId,
      full_name: player.full_name,
      position: player.position,
      team: player.team,
      bye_week: player.bye_week,
    }));
    if (playersData.length === 0) return;
    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_players_cache")
      .upsert(playersData, { onConflict: "player_id" });
    const end = Date.now();
    const execution_time_ms = end - start;
    await this.logQueryPerformance({
      query_type: "upsert_sleeper_players_cache",
      execution_time_ms,
      rows_affected: playersData.length,
      query_hash: this.computeQueryHash(
        "upsert_sleeper_players_cache",
        playersData
      ),
    });
    if (error) throw error;
  }
}

// Main ETL processor using shared base
class ETLProcessor extends ETLBase {
  private db: DatabaseOps;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    super(supabaseUrl, supabaseServiceKey);
    this.db = new DatabaseOps(supabaseUrl, supabaseServiceKey);
  }

  // Add the new private method for processing a draft type
  private async processDraftType(
    type: "redraft" | "dynasty",
    lastRefresh: number
  ): Promise<{
    totalDrafts: number;
    totalPicks: number;
    lastCreatedTimestamp?: number;
  }> {
    let totalDrafts = 0;
    let totalPicks = 0;
    let lastCreatedTimestamp: number | undefined = undefined;
    let offset = 0;
    const limit = 50;

    while (true) {
      const drafts = await this.api.getMockDrafts(type, limit, offset);
      if (drafts.length === 0) break;

      // Filter drafts created after last refresh
      const newDrafts = drafts.filter((draft) => draft.created > lastRefresh);
      if (newDrafts.length === 0) break;

      for (const draft of newDrafts) {
        try {
          // Insert draft metadata
          await this.db.insertDraft(draft);
          totalDrafts++;

          // Fetch and insert picks
          const picks = await this.api.getDraftPicks(draft.draft_id);
          await this.db.insertPicks(draft.draft_id, picks);
          totalPicks += picks.length;

          // Update last created timestamp
          if (draft.created > (lastCreatedTimestamp || 0)) {
            lastCreatedTimestamp = draft.created;
          }
        } catch (error) {
          console.error(`Error processing draft ${draft.draft_id}:`, error);
          // Continue with other drafts
        }
      }

      offset += limit;
      // Stop if we got fewer results than requested (end of data)
      if (drafts.length < limit) break;
    }

    return { totalDrafts, totalPicks, lastCreatedTimestamp };
  }

  async processADP(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: "adp",
      records_processed: 0,
      status: "success",
    };

    try {
      const lastRefresh = await this.getLastRefresh("adp");
      let totalDrafts = 0;
      let totalPicks = 0;
      let lastCreatedTimestamp: number | undefined = undefined;

      // Process both redraft and dynasty drafts using the new method
      for (const type of ["redraft", "dynasty"] as const) {
        const result = await this.processDraftType(type, lastRefresh);
        totalDrafts += result.totalDrafts;
        totalPicks += result.totalPicks;
        if (
          result.lastCreatedTimestamp &&
          result.lastCreatedTimestamp > (lastCreatedTimestamp || 0)
        ) {
          lastCreatedTimestamp = result.lastCreatedTimestamp;
        }
      }

      run.records_processed = totalDrafts + totalPicks;
      if (lastCreatedTimestamp) {
        run.last_created_timestamp = lastCreatedTimestamp;
      }
      return run;
    } catch (error) {
      run.status = "error";
      run.error_message = error.message;
      await this.handleErrors(error, "adp-processing");
      throw error;
    }
  }

  async processStats(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: "stats",
      records_processed: 0,
      status: "success",
    };

    try {
      const { last_season, last_week } = await this.getLastStatsRefresh();
      const state = await this.api.getNFLState();

      // Only process if we have a new week
      if (
        state.season > last_season ||
        (state.season === last_season && state.week > last_week)
      ) {
        const stats = await this.api.getWeeklyStats(state.season, state.week);
        await this.db.insertStats(state.season, state.week, stats);

        run.records_processed = Object.keys(stats).length;
        run.last_season = state.season;
        run.last_week = state.week;
      }

      return run;
    } catch (error) {
      run.status = "error";
      run.error_message = error.message;
      await this.handleErrors(error, "stats-processing");
      throw error;
    }
  }

  async processPlayers(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: "players",
      records_processed: 0,
      status: "success",
    };

    try {
      const shouldUpdate = await this.shouldUpdatePlayers();

      if (shouldUpdate) {
        const players = await this.api.getPlayers();
        await this.db.upsertPlayers(players);
        run.records_processed = Object.keys(players).length;
      }

      return run;
    } catch (error) {
      run.status = "error";
      run.error_message = error.message;
      await this.handleErrors(error, "players-processing");
      throw error;
    }
  }

  async runFullETL(): Promise<void> {
    console.log("Starting weekly ETL process...");

    try {
      // Process ADP data
      console.log("Processing ADP data...");
      const adpRun = await this.processADP();
      await this.logETLRun(adpRun);
      console.log(
        `ADP processing complete: ${adpRun.records_processed} records`
      );

      // Process weekly stats
      console.log("Processing weekly stats...");
      const statsRun = await this.processStats();
      await this.logETLRun(statsRun);
      console.log(
        `Stats processing complete: ${statsRun.records_processed} records`
      );

      // Process player data (if needed)
      console.log("Processing player data...");
      const playersRun = await this.processPlayers();
      await this.logETLRun(playersRun);
      console.log(
        `Players processing complete: ${playersRun.records_processed} records`
      );

      // Refresh materialized views
      console.log("Refreshing materialized views...");
      await this.refreshViews();
      console.log("Materialized views refreshed");

      // Clean old metadata
      console.log("Cleaning old metadata...");
      await this.cleanOldMetadata();
      console.log("Old metadata cleaned");

      console.log("Weekly ETL process completed successfully");
    } catch (error) {
      console.error("ETL process failed:", error);
      throw error;
    }
  }
}

// Main handler
serve(async (req) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Initialize and run ETL
    const processor = new ETLProcessor(supabaseUrl, supabaseServiceKey);
    await processor.runFullETL();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Weekly ETL process completed successfully",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
