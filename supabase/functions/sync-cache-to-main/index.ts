import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun } from "../_shared/etl-utils.ts";

interface SyncResult {
  players_synced: number;
  stats_synced: number;
  success: boolean;
  error?: string;
}

class CacheToMainSync extends ETLBase {
  async syncPlayersFromCache(): Promise<number> {
    console.log("Starting player sync from cache to main table...");

    // Get all players from cache
    const { data: cachedPlayers, error: cacheError } = await this.supabase
      .from("sleeper_players_cache")
      .select("*");

    if (cacheError) throw cacheError;
    if (!cachedPlayers || cachedPlayers.length === 0) {
      console.log("No cached players found");
      return 0;
    }

    console.log(`Found ${cachedPlayers.length} cached players`);

    // Transform and upsert to main players table
    const playersData = cachedPlayers.map((player) => ({
      player_id: player.player_id,
      name: player.full_name,
      position: player.position || "UNK",
      team: player.team || "FA",
      active: true, // Assume active if in cache
      bye_week: player.bye_week,
      metadata: {
        last_cache_update: player.last_updated,
        original_sleeper_data: player,
      },
    }));

    // Batch upsert to main players table
    const { error: playersError } = await this.supabase
      .from("players")
      .upsert(playersData, {
        onConflict: "player_id",
        ignoreDuplicates: false,
      });

    if (playersError) {
      console.error("Error upserting players:", playersError);
      throw playersError;
    }

    console.log(`Successfully synced ${playersData.length} players`);
    return playersData.length;
  }

  async syncStatsFromSleeper(season: number): Promise<number> {
    console.log(`Starting stats sync for ${season} season...`);

    // Get main players to create mapping
    const { data: players, error: playersError } = await this.supabase
      .from("players")
      .select("id, player_id");

    if (playersError) throw playersError;
    if (!players || players.length === 0) {
      console.log("No players found in main table. Run player sync first.");
      return 0;
    }

    // Create lookup map
    const playerIdMap = new Map(players.map((p) => [p.player_id, p.id]));

    console.log(`Created mapping for ${playerIdMap.size} players`);

    // Get Sleeper stats for the season
    const { data: sleeperStats, error: statsError } = await this.supabase
      .from("sleeper_stats")
      .select("*")
      .eq("season", season);

    if (statsError) throw statsError;
    if (!sleeperStats || sleeperStats.length === 0) {
      console.log(`No Sleeper stats found for ${season} season`);
      return 0;
    }

    console.log(`Found ${sleeperStats.length} stat records for ${season}`);

    // Transform to main weekly_stats format
    const weeklyStatsData = sleeperStats
      .filter((stat) => playerIdMap.has(stat.player_id))
      .map((stat) => ({
        player_id: playerIdMap.get(stat.player_id),
        season: stat.season,
        week: stat.week,
        fantasy_points: stat.pts_ppr,
        passing_yards: stat.pass_yd || 0,
        passing_tds: stat.pass_td || 0,
        passing_interceptions: 0, // Not in Sleeper basic stats
        rushing_yards: stat.rush_yd || 0,
        rushing_tds: 0, // Would need more detailed stats
        receiving_yards: stat.rec_yd || 0,
        receiving_tds: stat.rec_td || 0,
        receptions: 0, // Not in this format
        fumbles_lost: 0, // Not in basic Sleeper stats
      }));

    if (weeklyStatsData.length === 0) {
      console.log("No stats matched to players in main table");
      return 0;
    }

    console.log(
      `Mapped ${weeklyStatsData.length} stat records to main players`
    );

    // Batch upsert to weekly_stats
    const { error: weeklyStatsError } = await this.supabase
      .from("weekly_stats")
      .upsert(weeklyStatsData, {
        onConflict: "player_id,season,week",
      });

    if (weeklyStatsError) {
      console.error("Error upserting weekly stats:", weeklyStatsError);
      throw weeklyStatsError;
    }

    console.log(`Successfully synced ${weeklyStatsData.length} stat records`);
    return weeklyStatsData.length;
  }
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const season = body?.season || 2024;
    const syncPlayers = body?.sync_players !== false; // Default true
    const syncStats = body?.sync_stats !== false; // Default true

    const sync = new CacheToMainSync(supabaseUrl, supabaseServiceKey);

    let playersSynced = 0;
    let statsSynced = 0;

    // Sync players from cache to main table
    if (syncPlayers) {
      console.log("Syncing players from cache...");
      playersSynced = await sync.syncPlayersFromCache();
    }

    // Sync stats from Sleeper to main table
    if (syncStats) {
      console.log(`Syncing stats for ${season} season...`);
      statsSynced = await sync.syncStatsFromSleeper(season);
    }

    const result: SyncResult = {
      players_synced: playersSynced,
      stats_synced: statsSynced,
      success: true,
    };

    // Log ETL run
    const etlRun: ETLRun = {
      run_type: "cache-to-main-sync",
      records_processed: playersSynced + statsSynced,
      status: "success",
      last_season: season,
    };
    await sync.logETLRun(etlRun);

    return new Response(
      JSON.stringify({
        ...result,
        message: "Cache to main sync completed successfully",
        season: season,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Sync error:", error);

    const result: SyncResult = {
      players_synced: 0,
      stats_synced: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };

    return new Response(
      JSON.stringify({
        ...result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
