import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SleeperPlayer {
  player_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  position?: string;
  team?: string;
  status?: string;
  active?: boolean;
  years_exp?: number;
  depth_chart_order?: number;
  birth_date?: string;
  height?: string;
  weight?: string;
}

interface SyncResult {
  success: boolean;
  players_added: number;
  players_updated: number;
  total_processed: number;
  errors: string[];
}

// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// TypeScript types for environment variables
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Validate environment variables
const requiredEnvVars: Env = {
  SUPABASE_URL: Deno.env.get("SUPABASE_URL")!,
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
};
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);
if (missingVars.length > 0) {
  throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting NFL data sync...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push("SUPABASE_URL");
      if (!supabaseKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
      const errorMsg = `Missing required environment variable(s): ${missingVars.join(
        ", "
      )}`;
      console.error(errorMsg);
      const errorResult: SyncResult = {
        success: false,
        players_added: 0,
        players_updated: 0,
        total_processed: 0,
        errors: [errorMsg],
      };
      return new Response(JSON.stringify(errorResult), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    let playersAdded = 0;
    let playersUpdated = 0;
    let totalProcessed = 0;
    const errors: string[] = [];

    // Map team abbreviations to bye weeks (hardcoded for 2024 season)
    const teamByeWeeks = new Map<string, number>([
      ["ARI", 11], ["ATL", 12], ["BAL", 14], ["BUF", 12], ["CAR", 11], ["CHI", 7],
      ["CIN", 12], ["CLE", 10], ["DAL", 7], ["DEN", 14], ["DET", 5], ["GB", 10],
      ["HOU", 14], ["IND", 14], ["JAX", 12], ["KC", 10], ["LV", 10], ["LAC", 5],
      ["LAR", 6], ["MIA", 6], ["MIN", 6], ["NE", 14], ["NO", 12], ["NYG", 11],
      ["NYJ", 12], ["PHI", 5], ["PIT", 9], ["SF", 9], ["SEA", 10], ["TB", 11],
      ["TEN", 5], ["WAS", 14]
    ]);

    // Fetch players data from Sleeper API
    console.log("Fetching players data from Sleeper API...");
    const playersResponse = await fetch(
      "https://api.sleeper.app/v1/players/nfl"
    );

    if (!playersResponse.ok) {
      throw new Error(
        `Sleeper API error: ${playersResponse.status} ${playersResponse.statusText}`
      );
    }

    const playersData = await playersResponse.json();
    console.log(`Received data for ${Object.keys(playersData).length} players from Sleeper API`);

    // Process players data
    const players: any[] = [];

    for (const [sleeperId, sleeperPlayer] of Object.entries(playersData)) {
      try {
        totalProcessed++;
        
        const player = sleeperPlayer as SleeperPlayer;
        
        // Extract player data
        const name = player.full_name || 
                    (player.first_name && player.last_name ? 
                     `${player.first_name} ${player.last_name}` : 
                     player.first_name || player.last_name);
        const position = player.position;
        const team = player.team;
        const active = player.status !== "Inactive" && player.active !== false;

        if (!name || !position || !sleeperId) {
          errors.push(
            `Missing required data for player: ${JSON.stringify(player)}`
          );
          continue;
        }

        // Validate position - only include fantasy-relevant positions
        const validPositions = ["QB", "RB", "WR", "TE", "DEF", "K"];
        const normalizedPosition = position.toUpperCase();
        
        // Map DEF to D/ST for consistency
        const finalPosition = normalizedPosition === "DEF" ? "D/ST" : normalizedPosition;
        
        if (!validPositions.includes(normalizedPosition)) {
          // Skip non-fantasy positions
          continue;
        }

        const playerData = {
          player_id: `sleeper_${sleeperId}`,
          name: name,
          position: finalPosition,
          team: team || "FA", // Free agent if no team
          active: active,
          bye_week: team ? teamByeWeeks.get(team) || null : null,
          metadata: {
            sleeper_id: sleeperId,
            height: player.height || null,
            weight: player.weight || null,
            years_exp: player.years_exp || null,
            birth_date: player.birth_date || null,
            depth_chart_order: player.depth_chart_order || null,
            status: player.status || null,
            first_name: player.first_name || null,
            last_name: player.last_name || null
          }
        };

        players.push(playerData);
      } catch (error) {
        errors.push(`Error processing player ${sleeperId}: ${error.message}`);
        console.error("Player processing error:", error);
      }
    }

    console.log(`Prepared ${players.length} players for database upsert`);

    // Upsert players to database
    if (players.length > 0) {
      // Process in batches to avoid payload limits
      const batchSize = 100;
      for (let i = 0; i < players.length; i += batchSize) {
        const batch = players.slice(i, i + batchSize);

        try {
          // Fetch existing player_ids for this batch
          const playerIds = batch.map((p) => p.player_id);
          const { data: existing, error: fetchError } = await supabase
            .from("players")
            .select("player_id")
            .in("player_id", playerIds);

          if (fetchError) {
            throw fetchError;
          }

          const existingIds = new Set(
            (existing || []).map((row) => row.player_id)
          );

          const { data, error } = await supabase.from("players").upsert(batch, {
            onConflict: "player_id",
            count: "exact",
          });

          if (error) {
            throw error;
          }

          // Count new inserts and updates
          let added = 0;
          let updated = 0;
          for (const p of batch) {
            if (existingIds.has(p.player_id)) {
              updated++;
            } else {
              added++;
            }
          }
          playersAdded += added;
          playersUpdated += updated;

          console.log(
            `Successfully upserted batch of ${batch.length} players: ${added} added, ${updated} updated`
          );
        } catch (error) {
          errors.push(`Database batch error: ${error.message}`);
          console.error("Database batch error:", error);
        }
      }
    }

    const result: SyncResult = {
      success: errors.length < totalProcessed / 2, // Consider success if less than 50% errors
      players_added: playersAdded,
      players_updated: playersUpdated,
      total_processed: totalProcessed,
      errors: errors.slice(0, 10), // Limit error details
    };

    console.log("Sync completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync function error:", error);

    const errorResult: SyncResult = {
      success: false,
      players_added: 0,
      players_updated: 0,
      total_processed: 0,
      errors: [error.message],
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
