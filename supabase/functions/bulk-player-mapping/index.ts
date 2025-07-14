import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun } from "../_shared/etl-utils.ts";
import { NameNormalizer } from "../_shared/name-utils.ts";
import {
  FuzzyMatcher,
  type PlayerCandidate,
  type FuzzyMatchResult,
  OptimizedFuzzyMatcher,
} from "../_shared/fuzzy-matcher.ts";

// Performance and configuration constants
const MAX_FALLBACK_CANDIDATES = 1000; // Maximum number of candidates to consider in fallback fuzzy matching

interface MappingResult {
  exact_matches: number;
  fuzzy_matches: number;
  manual_review_needed: number;
  unmapped: number;
  total_processed: number;
}

interface NFLVersePlayer {
  player_id: string;
  player_name: string;
  player_display_name: string;
  position: string;
  recent_team: string;
}

interface SleeperIndexes {
  exactMatch: Map<string, PlayerCandidate>;
  lastNameIndex: Map<string, PlayerCandidate[]>;
  initialLastIndex: Map<string, PlayerCandidate[]>;
  allPlayers: PlayerCandidate[];
}

class BulkPlayerMapper extends ETLBase {
  private static readonly BATCH_SIZE = 100;

  async performBulkMapping(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: "bulk-player-mapping",
      records_processed: 0,
      status: "success",
      last_season: 2024,
      last_week: null,
    };

    try {
      console.log("Starting optimized bulk player mapping process");

      const [sleeperPlayers, nflversePlayers] = await Promise.all([
        this.getSleeperPlayers(),
        this.getNFLVersePlayers(),
      ]);

      console.log(
        `Loaded ${sleeperPlayers.length} Sleeper players and ${nflversePlayers.length} nflverse players`
      );

      // Build search index once
      OptimizedFuzzyMatcher.buildSearchIndex(sleeperPlayers);

      // Process in batches
      const result = await this.processMappingsBatch(
        nflversePlayers,
        sleeperPlayers
      );

      console.log("Bulk mapping results:", result);
      run.records_processed = result.total_processed;
      return run;
    } catch (error) {
      console.error("Error in bulk mapping:", error);
      run.status = "error";
      run.error_message =
        error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async getSleeperPlayers(): Promise<PlayerCandidate[]> {
    const { data, error } = await this.supabase
      .from("sleeper_players_cache")
      .select("player_id, full_name, position, team");

    if (error) throw error;

    return data.map((p) => ({
      sleeper_id: p.player_id,
      full_name: p.full_name,
      position: p.position,
      team: p.team,
    }));
  }

  private async getNFLVersePlayers(): Promise<NFLVersePlayer[]> {
    console.log("Fetching unique nflverse players from 2024 stats");

    try {
      // Fetch the full 2024 season stats from NFLVerse API
      const url = `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_2024.csv`;
      console.log(`Calling nflverse API: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `nflverse API error: ${response.status} ${response.statusText}`
        );
      }

      const csvText = await response.text();
      const uniquePlayers = this.parseUniquePlayersFromCSV(csvText);

      console.log(`Found ${uniquePlayers.length} unique NFLVerse players`);
      return uniquePlayers;
    } catch (error) {
      console.error("Error fetching NFLVerse players:", error);
      throw error;
    }
  }

  private parseUniquePlayersFromCSV(csvText: string): NFLVersePlayer[] {
    const lines = csvText.split("\n");
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const uniquePlayers = new Map<string, NFLVersePlayer>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length < headers.length) continue;

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      const playerId = record.player_id;
      if (!playerId) continue;

      // Only add if we haven't seen this player before
      if (!uniquePlayers.has(playerId)) {
        uniquePlayers.set(playerId, {
          player_id: playerId,
          player_name: record.player_name || "",
          player_display_name:
            record.player_display_name || record.player_name || "",
          position: record.position || "",
          recent_team: record.recent_team || "",
        });
      }
    }

    return Array.from(uniquePlayers.values());
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

  private createSleeperIndexes(players: PlayerCandidate[]): SleeperIndexes {
    const exactMatch = new Map<string, PlayerCandidate>();
    const lastNameIndex = new Map<string, PlayerCandidate[]>();
    const initialLastIndex = new Map<string, PlayerCandidate[]>();

    for (const player of players) {
      const variations = NameNormalizer.createNameVariations(player.full_name);

      // Exact match index
      exactMatch.set(variations.normalized, player);

      // Last name index
      const lastName = NameNormalizer.extractLastName(player.full_name);
      if (!lastNameIndex.has(lastName)) {
        lastNameIndex.set(lastName, []);
      }
      lastNameIndex.get(lastName)!.push(player);

      // First initial + last name index
      const firstInitialLast = variations.firstInitialLast;
      if (!initialLastIndex.has(firstInitialLast)) {
        initialLastIndex.set(firstInitialLast, []);
      }
      initialLastIndex.get(firstInitialLast)!.push(player);
    }

    return { exactMatch, lastNameIndex, initialLastIndex, allPlayers: players };
  }

  private async processMappingsBatch(
    nflversePlayers: NFLVersePlayer[],
    sleeperPlayers: PlayerCandidate[]
  ): Promise<MappingResult> {
    const result: MappingResult = {
      exact_matches: 0,
      fuzzy_matches: 0,
      manual_review_needed: 0,
      unmapped: 0,
      total_processed: nflversePlayers.length,
    };

    const batches = this.chunk(nflversePlayers, BulkPlayerMapper.BATCH_SIZE);
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `Processing batch ${i + 1}/${batches.length} (${batch.length} players)`
      );

      const batchMappings: any[] = [];
      const batchUnmapped: any[] = [];

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map((player) => this.findMatchOptimized(player))
      );

      // Collect results
      batch.forEach((player, index) => {
        const matchResult = batchResults[index];
        this.processBatchResult(
          matchResult,
          player,
          batchMappings,
          batchUnmapped,
          result
        );
      });

      // Batch database operations
      await Promise.all([
        this.batchInsertMappings(batchMappings),
        this.batchInsertUnmapped(batchUnmapped),
      ]);
    }

    return result;
  }

  private chunk<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  }

  private async findMatchOptimized(nflversePlayer: NFLVersePlayer): Promise<{
    type: "exact" | "fuzzy" | "none";
    sleeperId?: string;
    fuzzyResult?: FuzzyMatchResult;
  }> {
    const name =
      nflversePlayer.player_display_name || nflversePlayer.player_name;
    // Try optimized fuzzy matching
    const fuzzyResult = OptimizedFuzzyMatcher.findBestMatchOptimized(
      name,
      true, // use position filter
      nflversePlayer.position
    );
    if (fuzzyResult) {
      return { type: "fuzzy", fuzzyResult };
    }
    return { type: "none" };
  }

  private processBatchResult(
    matchResult: {
      type: "exact" | "fuzzy" | "none";
      sleeperId?: string;
      fuzzyResult?: FuzzyMatchResult;
    },
    nflversePlayer: NFLVersePlayer,
    batchMappings: any[],
    batchUnmapped: any[],
    result: MappingResult
  ) {
    if (matchResult.type === "exact") {
      result.exact_matches++;
      batchMappings.push({
        sleeper_id: matchResult.sleeperId,
        nflverse_id: nflversePlayer.player_id,
        canonical_name:
          nflversePlayer.player_display_name || nflversePlayer.player_name,
        confidence_score: 1.0,
        match_method: "exact",
        position: nflversePlayer.position,
        team: nflversePlayer.recent_team,
        verified: true,
      });
    } else if (matchResult.type === "fuzzy" && matchResult.fuzzyResult) {
      if (matchResult.fuzzyResult.confidence === "high") {
        result.fuzzy_matches++;
        batchMappings.push({
          sleeper_id: matchResult.fuzzyResult.sleeperId,
          nflverse_id: nflversePlayer.player_id,
          canonical_name:
            nflversePlayer.player_display_name || nflversePlayer.player_name,
          confidence_score: matchResult.fuzzyResult.score,
          match_method: "fuzzy",
          position: nflversePlayer.position,
          team: nflversePlayer.recent_team,
          verified: false,
          notes: `Fuzzy match: ${matchResult.fuzzyResult.candidateName}`,
        });
      } else {
        result.manual_review_needed++;
        batchUnmapped.push({
          source: "nflverse",
          player_id: nflversePlayer.player_id,
          player_name:
            nflversePlayer.player_display_name || nflversePlayer.player_name,
          position: nflversePlayer.position,
          team: nflversePlayer.recent_team,
          notes: `Low confidence fuzzy match: ${matchResult.fuzzyResult.candidateName} (${matchResult.fuzzyResult.score})`,
        });
      }
    } else {
      result.unmapped++;
      batchUnmapped.push({
        source: "nflverse",
        player_id: nflversePlayer.player_id,
        player_name:
          nflversePlayer.player_display_name || nflversePlayer.player_name,
        position: nflversePlayer.position,
        team: nflversePlayer.recent_team,
        notes: "No match found",
      });
    }
  }

  private async batchInsertMappings(mappings: any[]): Promise<void> {
    if (mappings.length === 0) return;
    console.log(`Inserting ${mappings.length} mappings`);
    const { error } = await this.supabase
      .from("player_id_mapping")
      .insert(mappings);
    if (error) {
      console.error("Error inserting mappings:", error);
      throw error;
    }
  }

  private async batchInsertUnmapped(unmapped: any[]): Promise<void> {
    if (unmapped.length === 0) return;
    console.log(`Inserting ${unmapped.length} unmapped players`);
    const { error } = await this.supabase
      .from("unmapped_players")
      .insert(unmapped);
    if (error) {
      console.error("Error inserting unmapped players:", error);
      throw error;
    }
  }
}

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

    const mapper = new BulkPlayerMapper(supabaseUrl, supabaseServiceKey);
    const result = await mapper.performBulkMapping();
    await mapper.logETLRun(result);

    return new Response(
      JSON.stringify({
        success: result.status === "success",
        message: "Bulk player mapping completed",
        records_processed: result.records_processed,
        status: result.status,
        error: result.error_message || null,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
        },
        status: 500,
      }
    );
  }
});
