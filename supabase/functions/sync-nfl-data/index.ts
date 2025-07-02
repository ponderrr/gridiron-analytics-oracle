import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ESPNTeam {
  id: string;
  name: string;
  abbreviation: string;
  byeWeek?: number;
}

interface ESPNPlayer {
  id: string;
  displayName: string;
  position: {
    abbreviation: string;
  };
  team?: {
    id: string;
    abbreviation: string;
  };
  active: boolean;
}

interface SyncResult {
  success: boolean;
  players_added: number;
  players_updated: number;
  total_processed: number;
  errors: string[];
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

    // Fetch teams data first to get bye weeks
    console.log("Fetching NFL teams data...");
    const teamsResponse = await fetch(
      "https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/teams"
    );

    if (!teamsResponse.ok) {
      throw new Error(
        `Teams API error: ${teamsResponse.status} ${teamsResponse.statusText}`
      );
    }

    const teamsData = await teamsResponse.json();
    const teamsMap = new Map<
      string,
      { abbreviation: string; byeWeek?: number }
    >();

    // Process teams to create mapping
    if (teamsData.sports?.[0]?.leagues?.[0]?.teams) {
      for (const teamWrapper of teamsData.sports[0].leagues[0].teams) {
        const team = teamWrapper.team;
        if (team) {
          teamsMap.set(team.id, {
            abbreviation:
              team.abbreviation ||
              (typeof team.name === "string" && team.name.trim().length > 0
                ? team.name.trim().substring(0, 3).toUpperCase()
                : "UNK"),
            byeWeek: team.byeWeek,
          });
        }
      }
    }

    console.log(`Found ${teamsMap.size} teams`);

    // Fetch current season players data
    console.log("Fetching players data from ESPN...");
    const playersResponse = await fetch(
      "https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/athletes"
    );

    if (!playersResponse.ok) {
      throw new Error(
        `Players API error: ${playersResponse.status} ${playersResponse.statusText}`
      );
    }

    const playersData = await playersResponse.json();
    console.log(
      "Raw players data structure:",
      JSON.stringify(playersData, null, 2).substring(0, 500)
    );

    // Process players data
    const players: any[] = [];

    // Try different possible data structures
    let athletesArray: any[] = [];

    if (playersData.athletes) {
      athletesArray = playersData.athletes;
    } else if (playersData.items) {
      athletesArray = playersData.items;
    } else if (Array.isArray(playersData)) {
      athletesArray = playersData;
    }

    console.log(`Processing ${athletesArray.length} athletes...`);

    for (const athlete of athletesArray) {
      try {
        totalProcessed++;

        // Extract player data
        const playerId = athlete.id?.toString();
        const name = athlete.displayName || athlete.name || athlete.fullName;
        const position =
          athlete.position?.abbreviation || athlete.position?.name;
        const teamId = athlete.team?.id?.toString();
        const active = athlete.active !== false; // Default to true if not specified

        if (!playerId || !name || !position) {
          errors.push(
            `Missing required data for player: ${JSON.stringify(athlete)}`
          );
          continue;
        }

        // Get team info
        const teamInfo = teamsMap.get(teamId);
        const teamAbbr =
          teamInfo?.abbreviation || athlete.team?.abbreviation || "UNK";

        // Validate position
        const validPositions = ["QB", "RB", "WR", "TE", "D/ST", "K"];
        const normalizedPosition = position.toUpperCase();
        if (!validPositions.includes(normalizedPosition)) {
          // Skip non-fantasy positions
          continue;
        }

        const playerData = {
          player_id: `espn_${playerId}`,
          name: name,
          position: normalizedPosition,
          team: teamAbbr,
          active: active,
          bye_week: teamInfo?.byeWeek || null,
        };

        players.push(playerData);
      } catch (error) {
        errors.push(`Error processing player ${athlete.id}: ${error.message}`);
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
