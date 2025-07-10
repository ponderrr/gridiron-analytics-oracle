import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun, SleeperStats } from "../_shared/etl-utils.ts";

class WeeklyStatsSync extends ETLBase {
  async syncWeeklyStats(week: number, season: number): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: "weekly-stats",
      records_processed: 0,
      status: "success",
      last_season: season,
      last_week: week,
    };

    try {
      const stats = await this.api.getWeeklyStats(season, week);
      await this.upsertStats(season, week, stats);

      run.records_processed = Object.keys(stats).length;
      return run;
    } catch (error) {
      run.status = "error";
      run.error_message = error.message;
      await this.handleErrors(error, "weekly-stats-sync");
      throw error;
    }
  }

  private async upsertStats(
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
      .upsert(statsData, { onConflict: ["season", "week", "player_id"] });
    const end = Date.now();
    const execution_time_ms = end - start;

    await this.logQueryPerformance({
      query_type: "upsert_sleeper_stats",
      execution_time_ms,
      rows_affected: statsData.length,
      query_hash: undefined,
    });

    if (error) throw error;
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

    // Parse request body for week and season
    const body = await req.json();
    const week = body?.week || 1;
    const season = body?.season || 2024;

    // Validate inputs
    if (!week || week < 1 || week > 18) {
      throw new Error("Invalid week parameter. Must be between 1 and 18.");
    }

    if (!season || season < 2020 || season > 2030) {
      throw new Error(
        "Invalid season parameter. Must be between 2020 and 2030."
      );
    }

    // Initialize and run sync
    const sync = new WeeklyStatsSync(supabaseUrl, supabaseServiceKey);
    const result = await sync.syncWeeklyStats(week, season);
    await sync.logETLRun(result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Weekly stats sync completed successfully",
        stats_updated: result.records_processed,
        week: result.last_week,
        season: result.last_season,
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
