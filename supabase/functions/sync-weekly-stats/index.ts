import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun } from "../_shared/etl-utils.ts";

// Updated interface for actual Sleeper stats (not rankings)
interface SleeperPlayerStats {
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  pass_att?: number;
  pass_cmp?: number;
  rush_yd?: number;
  rush_td?: number;
  rush_att?: number;
  rec?: number;
  rec_yd?: number;
  rec_td?: number;
  rec_tgt?: number;
  fum_lost?: number;
  fum?: number;
  // Add other stats as needed
}

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

      // Get actual game stats from the correct API endpoint
      const stats = await this.getWeeklyGameStats(season, week);
      console.log(`Got ${Object.keys(stats).length} player stats from API`);

      // Log a sample to see what we got
      const samplePlayer = Object.entries(stats)[0];
      if (samplePlayer) {
        console.log(
          `Sample player data:`,
          JSON.stringify(samplePlayer, null, 2)
        );
      }

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

  // NEW: Get actual game stats instead of rankings
  private async getWeeklyGameStats(
    season: number,
    week: number
  ): Promise<Record<string, SleeperPlayerStats>> {
    console.log(`Fetching game stats for ${season} week ${week}`);

    // Try the regular season stats endpoint first
    let url = `https://api.sleeper.app/v1/stats/nfl/${season}/${week}`;

    console.log(`Calling Sleeper API: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      // If regular season fails, maybe it's playoffs - try different endpoint
      if (week > 18) {
        url = `https://api.sleeper.app/v1/stats/nfl/${season}/${week}?season_type=playoff`;
        console.log(`Trying playoff endpoint: ${url}`);

        const playoffResponse = await fetch(url);
        if (!playoffResponse.ok) {
          throw new Error(
            `Sleeper API error: ${response.status} ${response.statusText}`
          );
        }
        return playoffResponse.json();
      }
      throw new Error(
        `Sleeper API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Log the structure of what we got
    const keys = Object.keys(data);
    console.log(`Response has ${keys.length} players`);

    if (keys.length > 0) {
      const firstPlayerStats = data[keys[0]];
      console.log(
        `First player stats structure:`,
        Object.keys(firstPlayerStats || {})
      );
    }

    return data;
  }

  private async upsertStats(
    season: number,
    week: number,
    stats: Record<string, SleeperPlayerStats>
  ): Promise<void> {
    const statsData = Object.entries(stats).map(([playerId, stat]) => ({
      season,
      week,
      player_id: playerId,
      // Use the actual PPR points if available, otherwise calculate
      pts_ppr: stat.pts_ppr || this.calculatePPRPoints(stat),
      rec_yd: stat.rec_yd || 0,
      rec_td: stat.rec_td || 0,
      rush_yd: stat.rush_yd || 0,
      pass_yd: stat.pass_yd || 0,
      pass_td: stat.pass_td || 0,
    }));

    // Filter out players with no meaningful stats
    const meaningfulStats = statsData.filter(
      (player) =>
        player.pts_ppr !== null &&
        player.pts_ppr !== undefined &&
        (player.pts_ppr > 0 ||
          player.rec_yd > 0 ||
          player.rush_yd > 0 ||
          player.pass_yd > 0)
    );

    if (meaningfulStats.length === 0) {
      console.log("No meaningful stats data to upsert");
      return;
    }

    console.log(
      `Upserting ${meaningfulStats.length} meaningful stat records (filtered from ${statsData.length} total)`
    );

    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_stats")
      .upsert(meaningfulStats, { onConflict: "season,week,player_id" });
    const end = Date.now();
    const execution_time_ms = end - start;

    // Try to log performance, but don't fail if it doesn't work
    try {
      await this.logQueryPerformance({
        query_type: "upsert_sleeper_stats",
        execution_time_ms,
        rows_affected: meaningfulStats.length,
        query_hash: undefined,
      });
    } catch (perfError) {
      console.warn("Performance logging failed (non-critical):", perfError);
    }

    if (error) {
      console.error("Database upsert error:", error);
      throw error;
    }

    console.log(`Successfully upserted ${meaningfulStats.length} stat records`);
  }

  // Calculate PPR fantasy points if not provided
  private calculatePPRPoints(stats: SleeperPlayerStats): number {
    let points = 0;

    // Passing (1 pt per 25 yards, 4 pts per TD, -2 per INT)
    if (stats.pass_yd) points += stats.pass_yd / 25;
    if (stats.pass_td) points += stats.pass_td * 4;
    if (stats.pass_int) points -= stats.pass_int * 2;

    // Rushing (1 pt per 10 yards, 6 pts per TD)
    if (stats.rush_yd) points += stats.rush_yd / 10;
    if (stats.rush_td) points += stats.rush_td * 6;

    // Receiving (1 pt per 10 yards, 6 pts per TD, 1 pt per reception)
    if (stats.rec_yd) points += stats.rec_yd / 10;
    if (stats.rec_td) points += stats.rec_td * 6;
    if (stats.rec) points += stats.rec; // PPR bonus

    // Fumbles (-2 pts per lost fumble)
    if (stats.fum_lost) points -= stats.fum_lost * 2;

    return Math.round(points * 100) / 100; // Round to 2 decimals
  }
}

// Rest of the handler stays the same
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
    }

    // Extract parameters with defaults
    const week = body?.week || 18; // Default to week 18 (end of season)
    const season = body?.season || 2024;

    console.log(`Parsed parameters: week=${week}, season=${season}`);

    // Validate inputs
    if (!week || week < 1 || week > 22) {
      throw new Error("Invalid week parameter. Must be between 1 and 22.");
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
