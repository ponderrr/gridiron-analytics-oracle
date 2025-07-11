import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun, SleeperPlayer } from "../_shared/etl-utils.ts";

class NFLDataSync extends ETLBase {
  async syncPlayers(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: "nfl-data",
      records_processed: 0,
      status: "success",
    };

    try {
      const shouldUpdate = await this.shouldUpdatePlayers();

      if (shouldUpdate) {
        const players = await this.api.getPlayers();
        await this.upsertPlayers(players);
        run.records_processed = Object.keys(players).length;
      }

      return run;
    } catch (error: unknown) {
      run.status = "error";
      if (error instanceof Error) {
        run.error_message = error.message;
        console.error("Error in nfl-data-sync:", error.message);
      } else {
        run.error_message = String(error);
        console.error("Error in nfl-data-sync:", String(error));
      }
      // Don't throw error, just return the failed run
      return run;
    }
  }

  private async upsertPlayers(
    players: Record<string, SleeperPlayer>
  ): Promise<void> {
    const playersData = Object.entries(players).map(([playerId, player]) => ({
      player_id: playerId,
      full_name: player.full_name,
      position: player.position,
      team: player.team,
      bye_week: player.bye_week,
    }));

    if (playersData.length === 0) return;

    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_players_cache")
      .upsert(playersData, { onConflict: "player_id" });
    const end = Date.now();
    const execution_time_ms = end - start;

    await this.logQueryPerformance({
      query_type: "upsert_sleeper_players_cache",
      execution_time_ms,
      rows_affected: playersData.length,
      query_hash: undefined,
    });

    if (error) throw error;
  }
}

serve(async () => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Initialize and run sync
    const sync = new NFLDataSync(supabaseUrl, supabaseServiceKey);
    const result = await sync.syncPlayers();
    await sync.logETLRun(result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "NFL data sync completed successfully",
        players_processed: result.records_processed,
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
