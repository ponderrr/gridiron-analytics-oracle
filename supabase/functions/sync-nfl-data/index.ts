import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase, ETLRun, SleeperPlayer } from "../_shared/etl-utils.ts";

class NFLDataSync extends ETLBase {
  async syncPlayers(): Promise<ETLRun> {
    console.log("Starting syncPlayers method...");
    const run: ETLRun = {
      run_type: "nfl-data",
      records_processed: 0,
      status: "success",
    };

    try {
      console.log("Checking if should update players...");
      const shouldUpdate = await this.shouldUpdatePlayers();
      console.log("Should update result:", shouldUpdate);

      if (shouldUpdate) {
        console.log("Getting players from Sleeper API...");
        const players = await this.api.getPlayers();
        console.log(
          "Got players from API, count:",
          Object.keys(players).length
        );

        console.log("Upserting players to database...");
        await this.upsertPlayers(players);
        console.log("Upsert completed successfully");

        run.records_processed = Object.keys(players).length;
      }

      console.log("syncPlayers completed successfully");
      return run;
    } catch (error: unknown) {
      console.error("Error caught in syncPlayers:");
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Error details:", error);

      run.status = "error";
      if (error instanceof Error) {
        console.error("Standard Error message:", error.message);
        console.error("Standard Error stack:", error.stack);
        run.error_message = error.message;
      } else if (error && typeof error === "object") {
        console.error("Object error:", JSON.stringify(error, null, 2));
        run.error_message = JSON.stringify(error);
      } else {
        console.error("Other error type:", String(error));
        run.error_message = String(error);
      }

      return run; // Don't throw, just return failed run
    }
  }

  private async upsertPlayers(
    players: Record<string, SleeperPlayer>
  ): Promise<void> {
    // Filter out players with missing required data and clean the data
    const playersData = Object.entries(players)
      .filter(([playerId, player]) => {
        // Filter out players without required data
        return (
          playerId &&
          player &&
          player.full_name &&
          player.full_name.trim() !== "" &&
          player.full_name !== null &&
          player.full_name !== undefined
        );
      })
      .map(([playerId, player]) => ({
        player_id: playerId,
        full_name: player.full_name.trim(), // Clean whitespace
        position: player.position || "UNK", // Default position if missing
        team: player.team || "FA", // Default to Free Agent if missing
        bye_week: player.bye_week || null, // Allow null bye weeks
      }));

    if (playersData.length === 0) {
      console.log("No valid players to insert after filtering");
      return;
    }

    console.log(
      `Filtered to ${playersData.length} valid players out of ${Object.keys(players).length} total`
    );

    const start = Date.now();
    const { error } = await this.supabase
      .from("sleeper_players_cache")
      .upsert(playersData, { onConflict: "player_id" });
    const end = Date.now();
    const execution_time_ms = end - start;

    // Only log performance if table exists (avoid secondary errors)
    try {
      await this.logQueryPerformance({
        query_type: "upsert_sleeper_players_cache",
        execution_time_ms,
        rows_affected: playersData.length,
        query_hash: undefined,
      });
    } catch (perfError) {
      console.warn("Performance logging failed (non-critical):", perfError);
    }

    if (error) {
      console.error("Database upsert error:", error);
      throw error;
    }

    console.log(`Successfully upserted ${playersData.length} players`);
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
        success: result.status === "success",
        message:
          result.status === "success"
            ? "NFL data sync completed successfully"
            : "NFL data sync completed with errors",
        players_processed: result.records_processed,
        status: result.status,
        error: result.error_message || null,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
