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
      console.log(
        `Starting weekly stats sync for week ${week}, season ${season}`
      );
      const stats = await this.api.getWeeklyStats(season, week);
      console.log(`Got ${Object.keys(stats).length} player stats from API`);

      await this.upsertStats(season, week, stats);
      console.log(`Successfully upserted stats for week ${week}`);

      run.records_processed = Object.keys(stats).length;
      return run;
    } catch (error) {
      console.error(`Error syncing week ${week} stats:`, error);
      run.status = "error";
      run.error_message =
        error instanceof Error ? error.message : String(error);
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
      pts_ppr: stat.pts_ppr || null,
      rec_yd: stat.rec_yd || 0,
      rec_td: stat.rec_td || 0,
      rush_yd: stat.rush_yd || 0,
      pass_yd: stat.pass_yd || 0,
      pass_td: stat.pass_td || 0,
    }));

    if (statsData.length === 0) {
      console.log("No stats data to upsert");
      return;
    }

    console.log(`Upserting ${statsData.length} stat records`);

    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_stats")
      .upsert(statsData, { onConflict: "season,week,player_id" });
    const end = Date.now();
    const execution_time_ms = end - start;

    // Try to log performance, but don't fail if it doesn't work
    try {
      await this.logQueryPerformance({
        query_type: "upsert_sleeper_stats",
        execution_time_ms,
        rows_affected: statsData.length,
        query_hash: undefined,
      });
    } catch (perfError) {
      console.warn("Performance logging failed (non-critical):", perfError);
    }

    if (error) {
      console.error("Database upsert error:", error);
      throw error;
    }

    console.log(`Successfully upserted ${statsData.length} stat records`);
  }
}

// Main handler with improved request parsing
serve(async (req) => {
  try {
    // Handle preflight CORS requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Parse request body safely
    let body: any = {};
    try {
      const requestText = await req.text();
      console.log("Raw request body:", requestText);

      if (requestText && requestText.trim() !== "") {
        body = JSON.parse(requestText);
      }
    } catch (parseError) {
      console.warn("Could not parse request body, using defaults:", parseError);
      // Use defaults if parsing fails
    }

    // Extract parameters with defaults
    const week = body?.week || 18; // Default to week 18
    const season = body?.season || 2024; // Default to 2024

    console.log(`Parsed parameters: week=${week}, season=${season}`);

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

    const response = {
      success: result.status === "success",
      message:
        result.status === "success"
          ? "Weekly stats sync completed successfully"
          : "Weekly stats sync completed with errors",
      stats_updated: result.records_processed,
      week: result.last_week,
      season: result.last_season,
      status: result.status,
      error: result.error_message || null,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
      status: result.status === "success" ? 200 : 500,
    });
  } catch (error) {
    console.error("Edge function error:", error);

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
      status: 500,
    });
  }
});
