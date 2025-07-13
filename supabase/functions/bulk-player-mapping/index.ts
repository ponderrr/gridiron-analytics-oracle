import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun } from "../_shared/etl-utils.ts";
import { NameNormalizer } from "../_shared/name-utils.ts";
import {
  FuzzyMatcher,
  type PlayerCandidate,
  type FuzzyMatchResult,
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
  async performBulkMapping(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: "bulk-player-mapping",
      records_processed: 0,
      status: "success",
      last_season: 2024,
      last_week: null,
    };

    try {
      console.log("Starting bulk player mapping process");

      // Step 1: Get all players from both sources
      const [sleeperPlayers, nflversePlayers] = await Promise.all([
        this.getSleeperPlayers(),
        this.getNFLVersePlayers(),
      ]);

      console.log(
        `Loaded ${sleeperPlayers.length} Sleeper players and ${nflversePlayers.length} nflverse players`
      );

      // Step 2: Create lookup indexes for Sleeper players
      const sleeperIndexes = this.createSleeperIndexes(sleeperPlayers);

      // Step 3: Process mappings
      const result = await this.processMappings(
        nflversePlayers,
        sleeperIndexes
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

  private async processMappings(
    nflversePlayers: NFLVersePlayer[],
    sleeperIndexes: SleeperIndexes
  ): Promise<MappingResult> {
    const result: MappingResult = {
      exact_matches: 0,
      fuzzy_matches: 0,
      manual_review_needed: 0,
      unmapped: 0,
      total_processed: nflversePlayers.length,
    };

    const mappingsToInsert: any[] = [];
    const unmappedToInsert: any[] = [];

    for (const nflversePlayer of nflversePlayers) {
      const matchResult = await this.findMatch(nflversePlayer, sleeperIndexes);

      if (matchResult.type === "exact") {
        result.exact_matches++;
        mappingsToInsert.push({
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
          mappingsToInsert.push({
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
          unmappedToInsert.push({
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
        unmappedToInsert.push({
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

    // Batch insert mappings
    if (mappingsToInsert.length > 0) {
      console.log(`Inserting ${mappingsToInsert.length} mappings`);
      const { error } = await this.supabase
        .from("player_id_mapping")
        .insert(mappingsToInsert);

      if (error) {
        console.error("Error inserting mappings:", error);
        throw error;
      }
    }

    // Batch insert unmapped players
    if (unmappedToInsert.length > 0) {
      console.log(`Inserting ${unmappedToInsert.length} unmapped players`);
      const { error } = await this.supabase
        .from("unmapped_players")
        .insert(unmappedToInsert);

      if (error) {
        console.error("Error inserting unmapped players:", error);
        throw error;
      }
    }

    return result;
  }

  private async findMatch(
    nflversePlayer: NFLVersePlayer,
    sleeperIndexes: SleeperIndexes
  ): Promise<{
    type: "exact" | "fuzzy" | "none";
    sleeperId?: string;
    fuzzyResult?: FuzzyMatchResult;
  }> {
    const name =
      nflversePlayer.player_display_name || nflversePlayer.player_name;
    const variations = NameNormalizer.createNameVariations(name);

    // Try exact match first
    for (const variation of variations.variations) {
      const exactMatch = sleeperIndexes.exactMatch.get(variation);
      if (exactMatch) {
        return { type: "exact", sleeperId: exactMatch.sleeper_id };
      }
    }

    // Try fuzzy matching on reduced candidate set
    const lastName = NameNormalizer.extractLastName(name);
    const candidates = sleeperIndexes.lastNameIndex.get(lastName) || [];

    if (candidates.length > 0) {
      const fuzzyResult = FuzzyMatcher.findBestMatch(
        name,
        candidates,
        true, // use position filter
        nflversePlayer.position
      );

      if (fuzzyResult) {
        return { type: "fuzzy", fuzzyResult };
      }
    }

    // Last resort: try against all players (expensive)
    if (candidates.length === 0) {
      const allCandidates = sleeperIndexes.allPlayers.slice(
        0,
        MAX_FALLBACK_CANDIDATES
      ); // Limit for performance
      const fuzzyResult = FuzzyMatcher.findBestMatch(name, allCandidates);

      if (fuzzyResult) {
        return { type: "fuzzy", fuzzyResult };
      }
    }

    return { type: "none" };
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
