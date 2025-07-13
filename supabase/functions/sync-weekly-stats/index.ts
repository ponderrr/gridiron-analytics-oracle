// Replace your sync-weekly-stats function with this nflverse-based approach
// supabase/functions/sync-weekly-stats/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun } from "../_shared/etl-utils.ts";
import { NameNormalizer } from "../_shared/name-utils.ts";
import {
  FuzzyMatcher,
  type PlayerCandidate,
} from "../_shared/fuzzy-matcher.ts";

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

interface PlayerMapping {
  sleeper_id: string;
  nflverse_id: string;
  canonical_name: string;
  confidence_score: number;
}

class MappingBasedStatsSync extends ETLBase {
  private playerMappings: Map<string, PlayerMapping> = new Map();
  private sleeperPlayers: PlayerCandidate[] = [];

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
        `Starting mapping-based stats sync for week ${week}, season ${season}`
      );

      // Load player mappings into memory
      await this.loadPlayerMappings();
      console.log(`Loaded ${this.playerMappings.size} player mappings`);

      // Get stats from nflverse
      const stats = await this.getNFLVerseStats(season, week);
      console.log(`Got ${stats.length} player stat records from nflverse`);

      // Map to Sleeper IDs and upsert
      const mappingResult = await this.mapAndUpsertStats(season, week, stats);
      console.log(
        `Successfully processed stats for week ${week}:`,
        mappingResult
      );

      run.records_processed = mappingResult.successfully_mapped;
      return run;
    } catch (error) {
      console.error(`Error syncing week ${week} stats:`, error);
      run.status = "error";
      run.error_message =
        error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async loadPlayerMappings(): Promise<void> {
    // Load existing mappings
    const { data: mappings, error: mappingError } = await this.supabase
      .from("player_id_mapping")
      .select("sleeper_id, nflverse_id, canonical_name, confidence_score");

    if (mappingError) {
      console.error("Error loading player mappings:", mappingError);
      throw mappingError;
    }

    // Load Sleeper players for fallback matching
    const { data: sleeperData, error: sleeperError } = await this.supabase
      .from("sleeper_players_cache")
      .select("player_id, full_name, position, team");

    if (sleeperError) {
      console.error("Error loading Sleeper players:", sleeperError);
      throw sleeperError;
    }

    // Build mapping lookup
    this.playerMappings.clear();
    mappings.forEach((mapping) => {
      this.playerMappings.set(mapping.nflverse_id, mapping);
    });

    // Build Sleeper players array for fallback
    this.sleeperPlayers = sleeperData.map((p) => ({
      sleeper_id: p.player_id,
      full_name: p.full_name,
      position: p.position,
      team: p.team,
    }));

    console.log(
      `Loaded ${this.playerMappings.size} mappings and ${this.sleeperPlayers.length} Sleeper players`
    );
  }

  private async getNFLVerseStats(
    season: number,
    week: number
  ): Promise<NFLVersePlayerStats[]> {
    console.log(`Fetching nflverse stats for ${season} week ${week}`);

    const url = `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_${season}.csv`;
    console.log(`Calling nflverse: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `nflverse API error: ${response.status} ${response.statusText}`
      );
    }

    const csvText = await response.text();
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

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const stats: NFLVersePlayerStats[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length < headers.length) continue;

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      const week = parseInt(record.week);
      if (week === targetWeek) {
        stats.push({
          player_id: record.player_id,
          player_name: record.player_display_name || record.player_name,
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

  private async mapAndUpsertStats(
    season: number,
    week: number,
    stats: NFLVersePlayerStats[]
  ): Promise<{
    successfully_mapped: number;
    failed_mapping: number;
    new_mappings_created: number;
    unmapped_logged: number;
  }> {
    const result = {
      successfully_mapped: 0,
      failed_mapping: 0,
      new_mappings_created: 0,
      unmapped_logged: 0,
    };

    const mappedStats: any[] = [];
    const newMappings: any[] = [];
    const unmappedPlayers: any[] = [];

    for (const stat of stats) {
      // Validate required fields before processing
      if (!stat.player_id || !stat.player_name) {
        console.warn(`Skipping stat record with missing required fields:`, {
          player_id: stat.player_id,
          player_name: stat.player_name,
          season: stat.season,
          week: stat.week,
        });
        result.failed_mapping++;
        continue;
      }

      const nflverseId = stat.player_id;
      const playerName = stat.player_name;

      // Try to find existing mapping
      let sleeperId = this.findSleeperIdFromMapping(nflverseId);

      if (sleeperId) {
        // Found existing mapping
        mappedStats.push(this.createStatRecord(sleeperId, stat));
        result.successfully_mapped++;
        console.log(
          `✅ Mapped via existing mapping: ${playerName} -> ${sleeperId}`
        );
        continue;
      }

      // Try to create new mapping via fuzzy matching
      const inferredPosition = this.inferPositionFromStats(stat);
      const newMapping = await this.attemptNewMapping(
        nflverseId,
        playerName,
        inferredPosition
      );

      if (newMapping) {
        sleeperId = newMapping.sleeper_id;
        mappedStats.push(this.createStatRecord(sleeperId, stat));
        newMappings.push(newMapping);
        result.successfully_mapped++;
        result.new_mappings_created++;
        console.log(
          `🆕 Created new mapping: ${playerName} -> ${sleeperId} (score: ${newMapping.confidence_score})`
        );
        continue;
      }

      // Could not map - log for review
      unmappedPlayers.push({
        source: "nflverse",
        player_id: nflverseId,
        player_name: playerName,
        position: this.inferPositionFromStats(stat),
        team: stat.recent_team,
        notes: `Failed to map during week ${week} sync`,
      });
      result.failed_mapping++;
      result.unmapped_logged++;
      console.warn(`❌ Could not map: ${playerName} (${nflverseId})`);
    }

    // Batch operations
    await Promise.all([
      this.upsertMappedStats(mappedStats),
      this.insertNewMappings(newMappings),
      this.logUnmappedPlayers(unmappedPlayers),
    ]);

    return result;
  }

  private findSleeperIdFromMapping(nflverseId: string): string | null {
    const mapping = this.playerMappings.get(nflverseId);
    return mapping ? mapping.sleeper_id : null;
  }

  private async attemptNewMapping(
    nflverseId: string,
    playerName: string,
    position: string | null
  ): Promise<{
    sleeper_id: string;
    nflverse_id: string;
    canonical_name: string;
    confidence_score: number;
    match_method: string;
  } | null> {
    // Use fuzzy matching with high threshold for auto-mapping
    const fuzzyResult = FuzzyMatcher.findBestMatch(
      playerName,
      this.sleeperPlayers,
      position // Use inferred position for filtering
    );

    if (fuzzyResult && fuzzyResult.confidence === "high") {
      // Auto-create mapping for high confidence matches
      const newMapping = {
        sleeper_id: fuzzyResult.sleeperId,
        nflverse_id: nflverseId,
        canonical_name: playerName,
        confidence_score: fuzzyResult.score,
        match_method: "fuzzy_auto",
        verified: false,
      };

      return newMapping;
    }

    return null;
  }

  private createStatRecord(sleeperId: string, stat: NFLVersePlayerStats) {
    return {
      season: stat.season,
      week: stat.week,
      player_id: sleeperId,
      pts_ppr: stat.fantasy_points_ppr || this.calculatePPRPoints(stat),
      rec_yd: stat.receiving_yards || 0,
      rec_td: stat.receiving_tds || 0,
      rush_yd: stat.rushing_yards || 0,
      pass_yd: stat.passing_yards || 0,
      pass_td: stat.passing_tds || 0,
      // Additional stats for comprehensive tracking
      rec: stat.receptions || 0,
      targets: stat.targets || 0,
      carries: stat.carries || 0,
      int: stat.interceptions || 0,
    };
  }

  private calculatePPRPoints(stats: NFLVersePlayerStats): number {
    let points = 0;

    if (stats.fantasy_points_ppr) {
      return stats.fantasy_points_ppr;
    }

    // Calculate manually if not provided
    // Passing stats
    if (stats.passing_yards) points += stats.passing_yards / 25;
    if (stats.passing_tds) points += stats.passing_tds * 4;
    if (stats.interceptions) points -= stats.interceptions * 2;

    // Rushing stats
    if (stats.rushing_yards) points += stats.rushing_yards / 10;
    if (stats.rushing_tds) points += stats.rushing_tds * 6;

    // Receiving stats
    if (stats.receiving_yards) points += stats.receiving_yards / 10;
    if (stats.receiving_tds) points += stats.receiving_tds * 6;
    if (stats.receptions) points += stats.receptions;

    return Math.round(points * 100) / 100;
  }

  private inferPositionFromStats(stat: NFLVersePlayerStats): string | null {
    // Calculate total activity for each category to determine primary role
    const passingActivity =
      (stat.passing_yards || 0) +
      (stat.passing_tds || 0) * 25 +
      (stat.interceptions || 0) * 10;
    const rushingActivity =
      (stat.rushing_yards || 0) +
      (stat.rushing_tds || 0) * 10 +
      (stat.carries || 0);
    const receivingActivity =
      (stat.receiving_yards || 0) +
      (stat.receiving_tds || 0) * 10 +
      (stat.receptions || 0) +
      (stat.targets || 0);

    // Position inference with improved precedence logic for QB, RB, WR, TE
    // 1. Quarterbacks - check for significant passing activity first
    if (passingActivity > 50) {
      return "QB";
    }

    // 2. Running Backs - check for rushing activity
    if (rushingActivity > 0) {
      return "RB";
    }

    // 3. Receiving positions - distinguish between WR and TE
    if (receivingActivity > 0) {
      // Use targets vs receptions ratio to distinguish WR vs TE
      // TEs typically have lower targets/receptions ratios and fewer targets overall
      const targetReceptionRatio =
        stat.targets && stat.receptions ? stat.targets / stat.receptions : 0;
      const totalTargets = stat.targets || 0;

      // TE indicators: lower target/reception ratio, fewer total targets
      if (
        targetReceptionRatio < 1.5 &&
        totalTargets < 8 &&
        receivingActivity > 20
      ) {
        return "TE";
      }

      // Otherwise, classify as WR
      return "WR";
    }

    // 4. Special cases for versatile players
    // If a player has both rushing and receiving activity, prioritize based on volume
    if (rushingActivity > 0 && receivingActivity > 0) {
      if (rushingActivity > receivingActivity * 2) {
        return "RB";
      } else if (receivingActivity > rushingActivity * 2) {
        return "WR";
      } else {
        // Balanced player - default to RB for fantasy purposes
        return "RB";
      }
    }

    // 5. If no clear activity, try to infer from fantasy points pattern
    if (stat.fantasy_points && stat.fantasy_points > 0) {
      // This is a fallback - if we have fantasy points but no clear stats,
      // we can't reliably determine position
      return null;
    }

    return null;
  }

  private async upsertMappedStats(mappedStats: any[]): Promise<void> {
    if (mappedStats.length === 0) return;

    console.log(`Upserting ${mappedStats.length} stat records`);
    const { error } = await this.supabase
      .from("sleeper_stats")
      .upsert(mappedStats, { onConflict: "season,week,player_id" });

    if (error) {
      console.error("Database upsert error:", error);
      throw error;
    }
  }

  private async insertNewMappings(newMappings: any[]): Promise<void> {
    if (newMappings.length === 0) return;

    console.log(`Inserting ${newMappings.length} new mappings`);
    const { error } = await this.supabase
      .from("player_id_mapping")
      .insert(newMappings);

    if (error) {
      console.error("Error inserting new mappings:", error);
      throw error;
    }

    // Update local mapping cache
    newMappings.forEach((mapping) => {
      this.playerMappings.set(mapping.nflverse_id, mapping);
    });
  }

  private async logUnmappedPlayers(unmappedPlayers: any[]): Promise<void> {
    if (unmappedPlayers.length === 0) return;

    console.log(`Logging ${unmappedPlayers.length} unmapped players`);
    const { error } = await this.supabase
      .from("unmapped_players")
      .upsert(unmappedPlayers, {
        onConflict: "source,player_id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("Error logging unmapped players:", error);
      // Don't throw - this is non-critical
    }
  }
}

// Main handler
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

    const week = body?.week || 10;
    const season = body?.season || 2024;

    if (!week || week < 1 || week > 22) {
      throw new Error("Invalid week parameter. Must be between 1 and 22.");
    }

    if (!season || season < 2020 || season > 2030) {
      throw new Error(
        "Invalid season parameter. Must be between 2020 and 2030."
      );
    }

    const sync = new MappingBasedStatsSync(supabaseUrl, supabaseServiceKey);
    const result = await sync.syncWeeklyStats(week, season);
    await sync.logETLRun(result);

    return new Response(
      JSON.stringify({
        success: result.status === "success",
        message:
          result.status === "success"
            ? "Mapping-based stats sync completed successfully"
            : "Mapping-based stats sync completed with errors",
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
