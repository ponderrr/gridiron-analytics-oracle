import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SleeperStats {
  [playerId: string]: {
    gp?: number;
    pts_ppr?: number;
    pts_std?: number;
    pts_half_ppr?: number;
    pass_yd?: number;
    pass_td?: number;
    pass_int?: number;
    rush_yd?: number;
    rush_td?: number;
    rec?: number;
    rec_yd?: number;
    rec_td?: number;
    fum_lost?: number;
    [key: string]: any;
  };
}

interface SyncStatsResult {
  success: boolean;
  players_processed: number;
  stats_updated: number;
  week: number;
  season: number;
  errors: string[];
}

// Validate environment variables
const requiredEnvVars = {
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
    const { week, season = 2024 } = await req.json().catch(() => ({}));
    
    if (!week || week < 1 || week > 18) {
      throw new Error("Valid week parameter (1-18) is required");
    }

    console.log(`Starting player stats sync for week ${week}, season ${season}...`);

    // Initialize Supabase client
    const supabase = createClient(
      requiredEnvVars.SUPABASE_URL,
      requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY
    );

    let playersProcessed = 0;
    let statsUpdated = 0;
    const errors: string[] = [];

    // Get active players from our database
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, player_id, name, position, metadata")
      .eq("active", true);

    if (playersError) {
      throw new Error(`Failed to fetch players: ${playersError.message}`);
    }

    console.log(`Found ${players?.length || 0} active players to process`);

    // Fetch stats from Sleeper API
    console.log(`Fetching stats from Sleeper API for week ${week}...`);
    const statsResponse = await fetch(
      `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`
    );

    if (!statsResponse.ok) {
      throw new Error(
        `Sleeper stats API error: ${statsResponse.status} ${statsResponse.statusText}`
      );
    }

    const statsData: SleeperStats = await statsResponse.json();
    console.log(`Received stats for ${Object.keys(statsData).length} players from Sleeper`);

    // Process stats for each player
    const statsToUpsert: any[] = [];

    for (const player of players || []) {
      try {
        playersProcessed++;

        // Extract Sleeper ID from metadata or player_id
        let sleeperId: string | null = null;
        
        if (player.metadata?.sleeper_id) {
          sleeperId = player.metadata.sleeper_id;
        } else if (player.player_id.startsWith("sleeper_")) {
          sleeperId = player.player_id.replace("sleeper_", "");
        }

        if (!sleeperId) {
          continue; // Skip players without Sleeper ID
        }

        const playerStats = statsData[sleeperId];
        if (!playerStats) {
          continue; // Skip players without stats data
        }

        // Calculate fantasy points (using PPR scoring)
        let fantasyPoints = 0;

        // Passing stats (1 point per 25 yards, 4 points per TD, -2 per INT)
        if (playerStats.pass_yd) {
          fantasyPoints += (playerStats.pass_yd / 25);
        }
        if (playerStats.pass_td) {
          fantasyPoints += (playerStats.pass_td * 4);
        }
        if (playerStats.pass_int) {
          fantasyPoints -= (playerStats.pass_int * 2);
        }

        // Rushing stats (1 point per 10 yards, 6 points per TD)
        if (playerStats.rush_yd) {
          fantasyPoints += (playerStats.rush_yd / 10);
        }
        if (playerStats.rush_td) {
          fantasyPoints += (playerStats.rush_td * 6);
        }

        // Receiving stats (1 point per reception, 1 point per 10 yards, 6 points per TD)
        if (playerStats.rec) {
          fantasyPoints += playerStats.rec; // PPR scoring
        }
        if (playerStats.rec_yd) {
          fantasyPoints += (playerStats.rec_yd / 10);
        }
        if (playerStats.rec_td) {
          fantasyPoints += (playerStats.rec_td * 6);
        }

        // Fumbles lost (-2 points)
        if (playerStats.fum_lost) {
          fantasyPoints -= (playerStats.fum_lost * 2);
        }

        const statsRecord = {
          player_id: player.id,
          season: season,
          week: week,
          passing_yards: playerStats.pass_yd || 0,
          passing_tds: playerStats.pass_td || 0,
          passing_interceptions: playerStats.pass_int || 0,
          rushing_yards: playerStats.rush_yd || 0,
          rushing_tds: playerStats.rush_td || 0,
          receiving_yards: playerStats.rec_yd || 0,
          receiving_tds: playerStats.rec_td || 0,
          receptions: playerStats.rec || 0,
          fumbles_lost: playerStats.fum_lost || 0,
          fantasy_points: Math.round(fantasyPoints * 100) / 100, // Round to 2 decimal places
        };

        statsToUpsert.push(statsRecord);

      } catch (error) {
        errors.push(`Error processing player ${player.name}: ${error.message}`);
        console.error("Player stats processing error:", error);
      }
    }

    console.log(`Prepared ${statsToUpsert.length} stats records for upsert`);

    // Upsert stats to database in batches
    if (statsToUpsert.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < statsToUpsert.length; i += batchSize) {
        const batch = statsToUpsert.slice(i, i + batchSize);

        try {
          const { error } = await supabase
            .from("weekly_stats")
            .upsert(batch, {
              onConflict: "player_id,season,week",
              count: "exact",
            });

          if (error) {
            throw error;
          }

          statsUpdated += batch.length;
          console.log(`Successfully upserted batch of ${batch.length} stats records`);
        } catch (error) {
          errors.push(`Database batch error: ${error.message}`);
          console.error("Database batch error:", error);
        }
      }
    }

    const result: SyncStatsResult = {
      success: errors.length < playersProcessed / 2, // Consider success if less than 50% errors
      players_processed: playersProcessed,
      stats_updated: statsUpdated,
      week: week,
      season: season,
      errors: errors.slice(0, 10), // Limit error details
    };

    console.log("Stats sync completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Stats sync function error:", error);

    const errorResult: SyncStatsResult = {
      success: false,
      players_processed: 0,
      stats_updated: 0,
      week: 0,
      season: 0,
      errors: [error.message],
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});