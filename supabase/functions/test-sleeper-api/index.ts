// Create this as supabase/functions/test-sleeper-api/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    console.log("Testing Sleeper API for Week 5, 2024...");

    // Test the actual Sleeper API endpoint
    const response = await fetch(
      "https://api.sleeper.app/v1/stats/nfl/2024/5?season_type=regular"
    );

    if (!response.ok) {
      throw new Error(
        `Sleeper API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("API Response keys:", Object.keys(data).length);

    // Log a few sample players to see the data structure
    const playerIds = Object.keys(data).slice(0, 5);
    console.log("Sample player IDs:", playerIds);

    for (const playerId of playerIds) {
      console.log(
        `Player ${playerId}:`,
        JSON.stringify(data[playerId], null, 2)
      );
    }

    // Look for any player with actual stats
    let playerWithStats = null;
    for (const [playerId, stats] of Object.entries(data)) {
      if (stats && typeof stats === "object" && Object.keys(stats).length > 0) {
        const statValues = Object.values(stats);
        if (statValues.some((val) => val !== null && val !== 0)) {
          playerWithStats = { playerId, stats };
          break;
        }
      }
    }

    if (playerWithStats) {
      console.log(
        "Found player with stats:",
        JSON.stringify(playerWithStats, null, 2)
      );
    } else {
      console.log("No players found with non-zero stats");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Check the logs for API response details",
        totalPlayers: Object.keys(data).length,
        sampleData: playerWithStats,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Test error:", error);

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
