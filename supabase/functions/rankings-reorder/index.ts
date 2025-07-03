import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReorderBody {
  setId: string;
  rankings: Array<{
    playerId: string;
    overallRank: number;
    tier?: number;
    notes?: string;
  }>;
}

// Required secrets: SUPABASE_URL, SUPABASE_ANON_KEY
// TypeScript types for environment variables
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// Validate environment variables
const requiredEnvVars: Env = {
  SUPABASE_URL: Deno.env.get("SUPABASE_URL")!,
  SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY")!,
};
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);
if (missingVars.length > 0) {
  throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Check for Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push("SUPABASE_URL");
      if (!supabaseAnonKey) missingVars.push("SUPABASE_ANON_KEY");
      const errorMsg = `Missing required environment variable(s): ${missingVars.join(", ")}`;
      console.error(errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
    }
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reorderBody: ReorderBody = await req.json();
    console.log(
      `Reordering rankings for set: ${reorderBody.setId}, user: ${user.id}`
    );

    if (
      !reorderBody.setId ||
      !reorderBody.rankings ||
      !Array.isArray(reorderBody.rankings)
    ) {
      return new Response(
        JSON.stringify({ error: "setId and rankings array are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the user owns this ranking set
    const { data: rankingSet, error: setError } = await supabaseClient
      .from("user_rankings_sets")
      .select("id")
      .eq("id", reorderBody.setId)
      .eq("user_id", user.id)
      .single();

    if (setError || !rankingSet) {
      console.error("Ranking set not found or access denied:", setError);
      return new Response(
        JSON.stringify({ error: "Ranking set not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate rankings data
    const validRankings = reorderBody.rankings.filter(
      (ranking) =>
        ranking.playerId &&
        typeof ranking.overallRank === "number" &&
        ranking.overallRank > 0
    );

    if (validRankings.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid rankings provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check for duplicate ranks
    const ranks = validRankings.map((r) => r.overallRank);
    const uniqueRanks = new Set(ranks);
    if (ranks.length !== uniqueRanks.size) {
      return new Response(
        JSON.stringify({ error: "Duplicate ranks detected" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process rankings in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < validRankings.length; i += batchSize) {
      const batch = validRankings.slice(i, i + batchSize);

      try {
        // Use upsert to handle both inserts and updates
        const { error: upsertError } = await supabaseClient
          .from("user_rankings_players")
          .upsert(
            batch.map((ranking) => ({
              ranking_set_id: reorderBody.setId,
              player_id: ranking.playerId,
              overall_rank: ranking.overallRank,
              tier: ranking.tier || null,
              notes: ranking.notes || null,
            })),
            {
              onConflict: "ranking_set_id,player_id",
              ignoreDuplicates: false,
            }
          );

        if (upsertError) {
          console.error(`Error in batch ${i / batchSize + 1}:`, upsertError);
          errorCount += batch.length;
          errors.push(`Batch ${i / batchSize + 1}: ${upsertError.message}`);
        } else {
          successCount += batch.length;
          console.log(
            `Successfully processed batch ${i / batchSize + 1} with ${
              batch.length
            } rankings`
          );
        }
      } catch (batchError) {
        console.error(
          `Unexpected error in batch ${i / batchSize + 1}:`,
          batchError
        );
        errorCount += batch.length;
        errors.push(`Batch ${i / batchSize + 1}: ${batchError}`);
      }
    }

    // Update the ranking set's updated_at timestamp
    await supabaseClient
      .from("user_rankings_sets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", reorderBody.setId);

    const response = {
      success: errorCount === 0,
      rankings_processed: validRankings.length,
      rankings_updated: successCount,
      errors: errorCount,
      error_details: errors.length > 0 ? errors : undefined,
    };

    console.log("Reorder operation completed:", response);

    return new Response(JSON.stringify(response), {
      status: 200, // Always return 200, indicate partial success in body
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in rankings-reorder function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
