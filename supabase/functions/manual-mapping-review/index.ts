import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase } from "../_shared/etl-utils.ts";
import {
  FuzzyMatcher,
  type PlayerCandidate,
} from "../_shared/fuzzy-matcher.ts";

interface UnmappedPlayerReview {
  id: string;
  player_id: string;
  player_name: string;
  position?: string;
  team?: string;
  suggested_matches: Array<{
    sleeper_id: string;
    full_name: string;
    score: number;
    confidence: string;
  }>;
}

class ManualMappingReview extends ETLBase {
  async getUnmappedPlayersForReview(
    limit = 50
  ): Promise<UnmappedPlayerReview[]> {
    // Get unmapped nflverse players
    const { data: unmapped, error } = await this.supabase
      .from("unmapped_players")
      .select("id, player_id, player_name, position, team")
      .eq("source", "nflverse")
      .order("attempts_count", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get all Sleeper players for matching
    const { data: sleeperPlayers, error: sleeperError } = await this.supabase
      .from("sleeper_players_cache")
      .select("player_id, full_name, position, team");

    if (sleeperError) throw sleeperError;

    const candidates: PlayerCandidate[] = sleeperPlayers.map((p) => ({
      sleeper_id: p.player_id,
      full_name: p.full_name,
      position: p.position,
      team: p.team,
    }));

    // Generate suggestions for each unmapped player
    const reviews: UnmappedPlayerReview[] = [];

    for (const player of unmapped) {
      const suggestions = FuzzyMatcher.findMultipleMatches(
        player.player_name,
        candidates,
        5 // Top 5 suggestions
      );

      reviews.push({
        id: player.id,
        player_id: player.player_id,
        player_name: player.player_name,
        position: player.position,
        team: player.team,
        suggested_matches: suggestions.map((s) => ({
          sleeper_id: s.sleeperId,
          full_name: s.candidateName,
          score: s.score,
          confidence: s.confidence,
        })),
      });
    }

    return reviews;
  }

  async createManualMapping(data: {
    nflverse_id: string;
    sleeper_id: string;
    canonical_name: string;
    notes?: string;
  }): Promise<void> {
    // Insert the mapping
    const { error: mappingError } = await this.supabase
      .from("player_id_mapping")
      .insert({
        sleeper_id: data.sleeper_id,
        nflverse_id: data.nflverse_id,
        canonical_name: data.canonical_name,
        confidence_score: 1.0,
        match_method: "manual",
        verified: true,
        notes: data.notes,
      });

    if (mappingError) throw mappingError;

    // Remove from unmapped players
    const { error: removeError } = await this.supabase
      .from("unmapped_players")
      .delete()
      .eq("player_id", data.nflverse_id)
      .eq("source", "nflverse");

    if (removeError) {
      console.warn("Failed to remove from unmapped players:", removeError);
    }
  }

  async rejectMapping(nflverseId: string, reason: string): Promise<void> {
    // Update unmapped player with rejection reason
    const { error } = await this.supabase
      .from("unmapped_players")
      .update({
        notes: `Rejected: ${reason}`,
        attempts_count: 999, // Move to bottom of review queue
      })
      .eq("player_id", nflverseId)
      .eq("source", "nflverse");

    if (error) throw error;
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

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    const reviewer = new ManualMappingReview(supabaseUrl, supabaseServiceKey);

    if (action === "list") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const reviews = await reviewer.getUnmappedPlayersForReview(limit);

      return new Response(
        JSON.stringify({
          success: true,
          data: reviews,
          count: reviews.length,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (action === "create" && req.method === "POST") {
      const body = await req.json();
      await reviewer.createManualMapping(body);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Manual mapping created successfully",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (action === "reject" && req.method === "POST") {
      const body = await req.json();
      await reviewer.rejectMapping(body.nflverse_id, body.reason);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Mapping rejected successfully",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid action",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
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
