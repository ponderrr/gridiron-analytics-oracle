// Replace your sync-weekly-stats function with this nflverse-based approach
// supabase/functions/sync-weekly-stats/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun } from "../_shared/etl-utils.ts";

interface NFLVersePlayerStats {
  player_id?: string;
  player_name?: string;
  recent_team?: string;
  season?: number;
  week?: number;
  season_type?: string;
  // Passing
  passing_yards?: number;
  passing_tds?: number;
  interceptions?: number;
  passing_air_yards?: number;
  passing_yards_after_catch?: number;
  passing_first_downs?: number;
  passing_epa?: number;
  // Rushing
  rushing_yards?: number;
  rushing_tds?: number;
  rushing_first_downs?: number;
  rushing_epa?: number;
  carries?: number;
  // Receiving
  receiving_yards?: number;
  receiving_tds?: number;
  receptions?: number;
  targets?: number;
  receiving_first_downs?: number;
  receiving_epa?: number;
  receiving_air_yards?: number;
  receiving_yards_after_catch?: number;
  // Fantasy
  fantasy_points?: number;
  fantasy_points_ppr?: number;
}

class NFLVerseStatsSync extends ETLBase {
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
        `Starting nflverse stats sync for week ${week}, season ${season}`
      );

      // Get stats from nflverse
      const stats = await this.getNFLVerseStats(season, week);
      console.log(`Got ${stats.length} player stat records from nflverse`);

      // Map to our player IDs and upsert
      await this.upsertStatsFromNFLVerse(season, week, stats);
      console.log(`Successfully processed stats for week ${week}`);

      run.records_processed = stats.length;
      return run;
    } catch (error) {
      console.error(`Error syncing week ${week} stats:`, error);
      run.status = "error";
      run.error_message =
        error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async getNFLVerseStats(
    season: number,
    week: number
  ): Promise<NFLVersePlayerStats[]> {
    console.log(`Fetching nflverse stats for ${season} week ${week}`);

    // nflverse provides data via CSV/JSON endpoints
    // For weekly player stats, we use their player_stats endpoint
    const url = `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_${season}.csv`;

    console.log(`Calling nflverse: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `nflverse API error: ${response.status} ${response.statusText}`
      );
    }

    const csvText = await response.text();

    // Parse CSV data
    const stats = this.parseCSVStats(csvText, week);

    console.log(`Parsed ${stats.length} records for week ${week}`);
    return stats;
  }

  private parseCSVStats(
    csvText: string,
    targetWeek: number
  ): NFLVersePlayerStats[] {
    const lines = csvText.split("\n");
    if (lines.length === 0) return [];

    // Get headers
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    console.log(`CSV headers: ${headers.slice(0, 10).join(", ")}...`);

    const stats: NFLVersePlayerStats[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length < headers.length) continue;

      // Create object from headers and values
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // Filter for the target week
      const week = parseInt(record.week);
      if (week === targetWeek) {
        stats.push({
          player_id: record.player_id,
          player_name: record.player_name,
          recent_team: record.recent_team,
          season: parseInt(record.season),
          week: week,
          season_type: record.season_type,
          passing_yards: parseFloat(record.passing_yards) || 0,
          passing_tds: parseInt(record.passing_tds) || 0,
          interceptions: parseInt(record.interceptions) || 0,
          rushing_yards: parseFloat(record.rushing_yards) || 0,
          rushing_tds: parseInt(record.rushing_tds) || 0,
          carries: parseInt(record.carries) || 0,
          receiving_yards: parseFloat(record.receiving_yards) || 0,
          receiving_tds: parseInt(record.receiving_tds) || 0,
          receptions: parseInt(record.receptions) || 0,
          targets: parseInt(record.targets) || 0,
          fantasy_points: parseFloat(record.fantasy_points) || 0,
          fantasy_points_ppr: parseFloat(record.fantasy_points_ppr) || 0,
        });
      }
    }

    return stats;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private async upsertStatsFromNFLVerse(
    season: number,
    week: number,
    stats: NFLVersePlayerStats[]
  ): Promise<void> {
    // First, get our player ID mapping from Sleeper
    const { data: playerMapping, error: mappingError } = await this.supabase
      .from("sleeper_players_cache")
      .select("player_id, full_name");

    if (mappingError) {
      console.error("Error getting player mapping:", mappingError);
      throw mappingError;
    }

    console.log(`Got ${playerMapping?.length || 0} players from mapping`);

    // Create name-based lookup since nflverse uses different IDs
    const nameToSleeperIdMap = new Map<string, string>();
    playerMapping?.forEach((player) => {
      const normalizedName = this.normalizeName(player.full_name);
      nameToSleeperIdMap.set(normalizedName, player.player_id);
    });

    // Transform nflverse stats to our format
    const mappedStats = stats
      .map((stat) => {
        const normalizedName = this.normalizeName(stat.player_name || "");
        const sleeperId = nameToSleeperIdMap.get(normalizedName);

        if (!sleeperId) {
          console.warn(`Could not map player: ${stat.player_name}`);
          return null;
        }

        return {
          season,
          week,
          player_id: sleeperId,
          pts_ppr: stat.fantasy_points_ppr || this.calculatePPRPoints(stat),
          rec_yd: stat.receiving_yards || 0,
          rec_td: stat.receiving_tds || 0,
          rush_yd: stat.rushing_yards || 0,
          pass_yd: stat.passing_yards || 0,
          pass_td: stat.passing_tds || 0,
        };
      })
      .filter((stat) => stat !== null);

    console.log(
      `Mapped ${mappedStats.length} stats out of ${stats.length} total`
    );

    if (mappedStats.length === 0) {
      console.log("No stats could be mapped to Sleeper players");
      return;
    }

    // Upsert to database
    const { error } = await this.supabase
      .from("sleeper_stats")
      .upsert(mappedStats, { onConflict: "season,week,player_id" });

    if (error) {
      console.error("Database upsert error:", error);
      throw error;
    }

    console.log(`Successfully upserted ${mappedStats.length} stat records`);
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  private calculatePPRPoints(stats: NFLVersePlayerStats): number {
    let points = 0;

    // Use nflverse fantasy points if available
    if (stats.fantasy_points_ppr) {
      return stats.fantasy_points_ppr;
    }

    // Otherwise calculate manually
    // Passing (1 pt per 25 yards, 4 pts per TD, -2 per INT)
    if (stats.passing_yards) points += stats.passing_yards / 25;
    if (stats.passing_tds) points += stats.passing_tds * 4;
    if (stats.interceptions) points -= stats.interceptions * 2;

    // Rushing (1 pt per 10 yards, 6 pts per TD)
    if (stats.rushing_yards) points += stats.rushing_yards / 10;
    if (stats.rushing_tds) points += stats.rushing_tds * 6;

    // Receiving (1 pt per 10 yards, 6 pts per TD, 1 pt per reception)
    if (stats.receiving_yards) points += stats.receiving_yards / 10;
    if (stats.receiving_tds) points += stats.receiving_tds * 6;
    if (stats.receptions) points += stats.receptions; // PPR bonus

    return Math.round(points * 100) / 100;
  }
}

// Main handler (same structure as before)
serve(async (req) => {
  try {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    let body: any = {};
    try {
      const requestText = await req.text();
      if (requestText && requestText.trim() !== "") {
        body = JSON.parse(requestText);
      }
    } catch (parseError) {
      console.warn("Could not parse request body, using defaults:", parseError);
    }

    const week = body?.week || 18;
    const season = body?.season || 2024;

    if (!week || week < 1 || week > 22) {
      throw new Error("Invalid week parameter. Must be between 1 and 22.");
    }

    if (!season || season < 2020 || season > 2030) {
      throw new Error(
        "Invalid season parameter. Must be between 2020 and 2030."
      );
    }

    const sync = new NFLVerseStatsSync(supabaseUrl, supabaseServiceKey);
    const result = await sync.syncWeeklyStats(week, season);
    await sync.logETLRun(result);

    return new Response(
      JSON.stringify({
        success: result.status === "success",
        message:
          result.status === "success"
            ? "NFLVerse stats sync completed successfully"
            : "NFLVerse stats sync completed with errors",
        stats_updated: result.records_processed,
        week: result.last_week,
        season: result.last_season,
        status: result.status,
        error: result.error_message || null,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
        status: result.status === "success" ? 200 : 500,
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
        status: 500,
      }
    );
  }
});
