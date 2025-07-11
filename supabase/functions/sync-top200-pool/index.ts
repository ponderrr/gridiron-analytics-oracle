import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, SleeperAPI, SleeperPlayer } from "../_shared/etl-utils.ts";

interface Top200Player {
  player_id: string;
  name: string;
  position: string;
  team: string;
  active: boolean;
  metadata: Record<string, unknown>;
}

interface Top200ETLRun {
  run_type: string;
  records_processed: number;
  status: "success" | "error" | "partial";
  error_message?: string;
  last_created_timestamp?: number;
  last_season?: number;
  last_week?: number;
}

class Top200PoolSync extends ETLBase {
  private sleeperAPI: SleeperAPI;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super(supabaseUrl, supabaseKey);
    this.sleeperAPI = new SleeperAPI();
  }

  async syncTop200Pool(
    format: "dynasty" | "redraft",
    week: number,
    season: number
  ): Promise<Top200ETLRun> {
    const run: Top200ETLRun = {
      run_type: `top200-pool-${format}`,
      records_processed: 0,
      status: "success",
    };

    try {
      console.log(
        `Starting Top 200 pool sync for ${format} format, week ${week}, season ${season}`
      );

      // Get current NFL state to determine the week
      const nflState = await this.sleeperAPI.getNFLState();
      const currentWeek = week || nflState.week;
      const currentSeason = season || nflState.season;

      // Deactivate old pools for this format
      await this.deactivateOldPools(format);

      // Fetch Top 200 players from Sleeper API
      const top200Players = await this.fetchTop200Players(format);

      // Store in top_players_pool table
      await this.storeTop200Pool(
        top200Players,
        format,
        currentWeek,
        currentSeason
      );

      run.records_processed = top200Players.length;
      console.log(
        `Successfully synced ${top200Players.length} players for ${format} format`
      );

      return run;
    } catch (error) {
      console.error(`Error syncing Top 200 pool for ${format}:`, error);
      run.status = "error";
      if (error instanceof Error) {
        run.error_message = error.message;
      } else {
        run.error_message = String(error);
      }
      throw error;
    }
  }

  // Improved: Fetch Top 200 players using real fantasy performance data
  private async fetchTop200Players(
    format: "dynasty" | "redraft"
  ): Promise<Top200Player[]> {
    const players: Top200Player[] = [];

    try {
      console.log(
        `Fetching Top 200 players for ${format} format using 2024 performance data`
      );

      // Get players with their 2024 fantasy performance
      const { data: playerStats, error: statsError } = await this.supabase
        .from("players")
        .select(
          `
          id,
          player_id,
          name,
          position,
          team,
          active,
          bye_week,
          weekly_stats!inner(
            fantasy_points,
            season,
            week
          )
        `
        )
        .eq("weekly_stats.season", 2024)
        .eq("active", true)
        .not("position", "eq", "D/ST"); // Exclude defenses for now

      if (statsError) {
        console.error("Error fetching player stats:", statsError);
        // Fallback to Sleeper API method
        return await this.fetchTop200PlayersFromSleeper(format);
      }

      if (!playerStats || playerStats.length === 0) {
        console.log("No player stats found, falling back to Sleeper API");
        return await this.fetchTop200PlayersFromSleeper(format);
      }

      // Calculate season totals
      interface PlayerWithStats {
        id: string;
        player_id: string;
        name: string;
        position: string;
        team: string;
        active: boolean;
        bye_week: number | null;
        total_fantasy_points: number;
        games_played: number;
        avg_fantasy_points: number;
      }

      const playersWithTotals: PlayerWithStats[] = playerStats.map((player) => {
        const stats = player.weekly_stats || [];
        const validStats = stats.filter((s) => s.fantasy_points !== null);
        const totalPoints = validStats.reduce(
          (sum, s) => sum + (s.fantasy_points || 0),
          0
        );

        return {
          id: player.id,
          player_id: player.player_id,
          name: player.name,
          position: player.position,
          team: player.team || "FA",
          active: player.active,
          bye_week: player.bye_week,
          total_fantasy_points: totalPoints,
          games_played: validStats.length,
          avg_fantasy_points:
            validStats.length > 0 ? totalPoints / validStats.length : 0,
        };
      });

      // Sort by total fantasy points (for redraft) or adjust for dynasty
      let sortedPlayers: PlayerWithStats[];

      if (format === "dynasty") {
        // For dynasty, weight younger players and adjust for games played
        sortedPlayers = playersWithTotals.sort((a, b) => {
          // Primary sort by total points, but could add age/experience weighting here
          return b.total_fantasy_points - a.total_fantasy_points;
        });
      } else {
        // For redraft, straight total points
        sortedPlayers = playersWithTotals.sort(
          (a, b) => b.total_fantasy_points - a.total_fantasy_points
        );
      }

      // Take top 200 players
      const top200Players = sortedPlayers.slice(0, 200);

      // Transform to our format
      for (let i = 0; i < top200Players.length; i++) {
        const player = top200Players[i];
        players.push({
          player_id: player.player_id,
          name: player.name,
          position: player.position,
          team: player.team,
          active: player.active,
          metadata: {
            total_fantasy_points: player.total_fantasy_points,
            games_played: player.games_played,
            avg_fantasy_points: player.avg_fantasy_points,
            bye_week: player.bye_week,
            ranking_method: "fantasy_points_2024",
          },
        });
      }

      // Add draft picks for dynasty format
      if (format === "dynasty") {
        const draftPicks = await this.fetchDraftPicks();
        players.push(...draftPicks);
      }

      console.log(
        `Successfully generated ${players.length} top players for ${format}`
      );
      return players;
    } catch (error) {
      console.error("Error fetching Top 200 players:", error);
      // Fallback to original method
      return await this.fetchTop200PlayersFromSleeper(format);
    }
  }

  // Fallback: original method using Sleeper API
  private async fetchTop200PlayersFromSleeper(
    format: "dynasty" | "redraft"
  ): Promise<Top200Player[]> {
    const players: Top200Player[] = [];

    try {
      console.log(`Fallback: Using Sleeper API for ${format} format`);

      // Get all players from Sleeper API
      const allPlayers = await this.sleeperAPI.getPlayers();

      // Filter active players only
      const activePlayers = Object.values(allPlayers).filter(
        (player: SleeperPlayer) =>
          player && player.position && player.position !== "DEF"
      );

      // Simple sort by position (original logic)
      const sortedPlayers = activePlayers.sort(
        (a: SleeperPlayer, b: SleeperPlayer) => {
          const positionOrder: Record<string, number> = {
            QB: 1,
            RB: 2,
            WR: 3,
            TE: 4,
            K: 5,
          };
          const aPos = positionOrder[String(a.position)] ?? 6;
          const bPos = positionOrder[String(b.position)] ?? 6;

          if (aPos !== bPos) return aPos - bPos;
          return String(a.full_name).localeCompare(String(b.full_name));
        }
      );

      // Take top 200 players
      const top200 = sortedPlayers.slice(0, 200);

      // Transform to our format
      for (let i = 0; i < top200.length; i++) {
        const player = top200[i];
        players.push({
          player_id: player.player_id,
          name: player.full_name,
          position: player.position || "UNK",
          team: player.team || "FA",
          active: true,
          metadata: {
            bye_week: player.bye_week,
            ranking_method: "sleeper_fallback",
            ...player,
          },
        });
      }

      // Add draft picks for dynasty format
      if (format === "dynasty") {
        const draftPicks = await this.fetchDraftPicks();
        players.push(...draftPicks);
      }

      return players;
    } catch (error) {
      console.error("Error in fallback method:", error);
      throw error;
    }
  }

  private async fetchDraftPicks(): Promise<Top200Player[]> {
    const picks: Top200Player[] = [];

    try {
      // Get current year for draft picks
      const currentYear = new Date().getFullYear();

      // Fetch draft picks for current year and next 3 years
      const { data, error } = await this.supabase
        .from("draft_picks")
        .select("*")
        .in("year", [
          currentYear,
          currentYear + 1,
          currentYear + 2,
          currentYear + 3,
        ])
        .eq("is_active", true)
        .order("year")
        .order("pick_type");

      if (error) {
        console.error("Error fetching draft picks:", error);
        throw error;
      }

      // Transform draft picks to Top200Player format
      data?.forEach(
        (pick: {
          id: string;
          display_name: string;
          year: number;
          pick_type: string;
          description: string;
        }) => {
          picks.push({
            player_id: `draft_pick_${pick.id}`,
            name: pick.display_name,
            position: "PICK",
            team: "ROOKIE",
            active: true,
            metadata: {
              pick_id: pick.id,
              year: pick.year,
              pick_type: pick.pick_type,
              description: pick.description,
            },
          });
        }
      );

      return picks;
    } catch (error) {
      console.error("Error fetching draft picks:", error);
      return [];
    }
  }

  private async storeTop200Pool(
    players: Top200Player[],
    format: "dynasty" | "redraft",
    week: number,
    season: number
  ): Promise<void> {
    const poolData = players.map((player, index) => ({
      week,
      season,
      format,
      player_data: player,
      consensus_rank: index + 1,
      is_active: true,
    }));

    const { error } = await this.supabase
      .from("top_players_pool")
      .upsert(poolData, { onConflict: "week,season,format,consensus_rank" });

    if (error) {
      console.error("Error storing Top 200 pool:", error);
      throw error;
    }
  }

  private async deactivateOldPools(
    format: "dynasty" | "redraft"
  ): Promise<void> {
    const { error } = await this.supabase
      .from("top_players_pool")
      .update({ is_active: false })
      .eq("format", format)
      .eq("is_active", true);

    if (error) {
      console.error("Error deactivating old pools:", error);
      throw error;
    }
  }

  protected async logTop200ETLRun(run: Top200ETLRun): Promise<void> {
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

    // Parse request body
    const body = await req.json();
    const format = body?.format || "redraft";
    const week = body?.week || null;
    const season = body?.season || null;

    // Validate format
    if (!["dynasty", "redraft"].includes(format)) {
      throw new Error("Invalid format. Must be 'dynasty' or 'redraft'");
    }

    // Initialize and run sync
    const sync = new Top200PoolSync(supabaseUrl, supabaseServiceKey);
    const result = await sync.syncTop200Pool(
      format as "dynasty" | "redraft",
      week,
      season
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Top 200 pool sync completed successfully for ${format} format`,
        players_processed: result.records_processed,
        format,
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
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
