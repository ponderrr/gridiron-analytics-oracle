import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateSetBody {
  name: string;
  format: "dynasty" | "redraft";
  copyFromSetId?: string;
}

interface UpdateSetBody {
  name?: string;
  format?: "dynasty" | "redraft";
  is_active?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

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

    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const setId = pathSegments[pathSegments.length - 1];
    const isSetSpecific = setId && setId !== "rankings-management";

    switch (req.method) {
      case "GET":
        if (isSetSpecific) {
          // Get specific ranking set with players
          console.log(`Fetching ranking set: ${setId} for user: ${user.id}`);

          const { data: rankingSet, error: setError } = await supabaseClient
            .from("user_rankings_sets")
            .select("*")
            .eq("id", setId)
            .eq("user_id", user.id)
            .single();

          if (setError) {
            console.error("Error fetching ranking set:", setError);
            return new Response(
              JSON.stringify({ error: "Ranking set not found" }),
              {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          const { data: rankings, error: rankingsError } = await supabaseClient
            .from("user_rankings_players")
            .select(
              `
              *,
              players (
                id,
                name,
                position,
                team,
                active
              )
            `
            )
            .eq("ranking_set_id", setId)
            .order("overall_rank", { ascending: true });

          if (rankingsError) {
            console.error("Error fetching rankings:", rankingsError);
            return new Response(
              JSON.stringify({ error: "Failed to fetch rankings" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: {
                ...rankingSet,
                rankings: rankings || [],
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          // Get all ranking sets for user
          console.log(`Fetching all ranking sets for user: ${user.id}`);

          const { data: sets, error } = await supabaseClient
            .from("user_rankings_sets")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching ranking sets:", error);
            return new Response(
              JSON.stringify({ error: "Failed to fetch ranking sets" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: sets || [],
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

      case "POST":
        if (isSetSpecific) {
          return new Response(
            JSON.stringify({ error: "Method not allowed for specific set" }),
            {
              status: 405,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Create new ranking set
        const createBody: CreateSetBody = await req.json();
        console.log(`Creating ranking set for user: ${user.id}`, createBody);

        if (!createBody.name || !createBody.format) {
          return new Response(
            JSON.stringify({ error: "Name and format are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // If this is set to active, deactivate other sets of the same format
        const isActive = createBody.copyFromSetId ? false : true;

        if (isActive) {
          await supabaseClient
            .from("user_rankings_sets")
            .update({ is_active: false })
            .eq("user_id", user.id)
            .eq("format", createBody.format);
        }

        const { data: newSet, error: createError } = await supabaseClient
          .from("user_rankings_sets")
          .insert({
            user_id: user.id,
            name: createBody.name,
            format: createBody.format,
            is_active: isActive,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating ranking set:", createError);
          return new Response(
            JSON.stringify({ error: "Failed to create ranking set" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // If copying from existing set, copy the rankings
        if (createBody.copyFromSetId) {
          const { data: sourceRankings, error: copyError } =
            await supabaseClient
              .from("user_rankings_players")
              .select("player_id, overall_rank, tier, notes")
              .eq("ranking_set_id", createBody.copyFromSetId);

          if (!copyError && sourceRankings) {
            const rankingsToInsert = sourceRankings.map((ranking) => ({
              ranking_set_id: newSet.id,
              player_id: ranking.player_id,
              overall_rank: ranking.overall_rank,
              tier: ranking.tier,
              notes: ranking.notes,
            }));

            await supabaseClient
              .from("user_rankings_players")
              .insert(rankingsToInsert);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: newSet,
          }),
          {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );

      case "PUT":
        if (!isSetSpecific) {
          return new Response(
            JSON.stringify({ error: "Set ID required for updates" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Update ranking set
        const updateBody: UpdateSetBody = await req.json();
        console.log(
          `Updating ranking set: ${setId} for user: ${user.id}`,
          updateBody
        );

        // If setting to active, deactivate other sets of the same format
        if (updateBody.is_active) {
          // Get the current set's format
          const { data: currentSet } = await supabaseClient
            .from("user_rankings_sets")
            .select("format")
            .eq("id", setId)
            .eq("user_id", user.id)
            .single();

          if (currentSet) {
            await supabaseClient
              .from("user_rankings_sets")
              .update({ is_active: false })
              .eq("user_id", user.id)
              .eq("format", currentSet.format)
              .neq("id", setId);
          }
        }

        const { data: updatedSet, error: updateError } = await supabaseClient
          .from("user_rankings_sets")
          .update(updateBody)
          .eq("id", setId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating ranking set:", updateError);
          return new Response(
            JSON.stringify({ error: "Failed to update ranking set" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: updatedSet,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case "DELETE":
        if (!isSetSpecific) {
          return new Response(
            JSON.stringify({ error: "Set ID required for deletion" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Delete ranking set (cascade will handle player rankings)
        console.log(`Deleting ranking set: ${setId} for user: ${user.id}`);

        const { error: deleteError } = await supabaseClient
          .from("user_rankings_sets")
          .delete()
          .eq("id", setId)
          .eq("user_id", user.id);

        if (deleteError) {
          console.error("Error deleting ranking set:", deleteError);
          return new Response(
            JSON.stringify({ error: "Failed to delete ranking set" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Ranking set deleted successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error in rankings-management function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
