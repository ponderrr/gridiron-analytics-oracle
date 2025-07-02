import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DefaultRankingsBody {
  setId: string;
  replaceExisting?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody: DefaultRankingsBody = await req.json();
    console.log(`Creating default rankings for set: ${requestBody.setId}, user: ${user.id}`);

    if (!requestBody.setId) {
      return new Response(
        JSON.stringify({ error: 'setId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user owns this ranking set
    const { data: rankingSet, error: setError } = await supabaseClient
      .from('user_rankings_sets')
      .select('*')
      .eq('id', requestBody.setId)
      .eq('user_id', user.id)
      .single();

    if (setError || !rankingSet) {
      console.error('Ranking set not found or access denied:', setError);
      return new Response(
        JSON.stringify({ error: 'Ranking set not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If replaceExisting is true, remove existing rankings
    if (requestBody.replaceExisting) {
      console.log('Removing existing rankings before creating defaults');
      const { error: deleteError } = await supabaseClient
        .from('user_rankings_players')
        .delete()
        .eq('ranking_set_id', requestBody.setId);

      if (deleteError) {
        console.error('Error removing existing rankings:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to remove existing rankings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get the latest trade values for reference
    const { data: latestWeek } = await supabaseClient
      .from('trade_values')
      .select('week, season')
      .order('season', { ascending: false })
      .order('week', { ascending: false })
      .limit(1);

    const currentWeek = latestWeek?.[0]?.week || 1;
    const currentSeason = latestWeek?.[0]?.season || 2024;

    console.log(`Using trade values from Week ${currentWeek}, Season ${currentSeason}`);

    // Fetch players with their latest trade values for consensus rankings
    const { data: playersData, error: playersError } = await supabaseClient
      .from('players')
      .select(`
        id,
        name,
        position,
        team,
        trade_values!inner (
          trade_value
        )
      `)
      .eq('active', true)
      .eq('trade_values.week', currentWeek)
      .eq('trade_values.season', currentSeason)
      .order('position')
      .order('trade_values.trade_value', { ascending: false })
      .limit(200);

    if (playersError) {
      console.error('Error fetching players for consensus rankings:', playersError);
      
      // Fallback: get players without trade values
      const { data: fallbackPlayers, error: fallbackError } = await supabaseClient
        .from('players')
        .select('id, name, position, team')
        .eq('active', true)
        .order('position')
        .order('name')
        .limit(200);

      if (fallbackError) {
        console.error('Error fetching fallback players:', fallbackError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch players for rankings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use fallback players with no trade values
      const fallbackRankings = fallbackPlayers?.map((player, index) => ({
        ranking_set_id: requestBody.setId,
        player_id: player.id,
        overall_rank: index + 1,
        tier: Math.ceil((index + 1) / 12), // Simple tier calculation
        notes: null
      })) || [];

      if (fallbackRankings.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('user_rankings_players')
          .insert(fallbackRankings);

        if (insertError) {
          console.error('Error inserting fallback rankings:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to create default rankings' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          players_ranked: fallbackRankings.length,
          message: 'Default rankings created using basic player order (no trade values available)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create consensus rankings based on position priority and trade values
    const positionOrder = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'K': 5, 'D/ST': 6 };
    
    const sortedPlayers = playersData?.sort((a, b) => {
      const posA = positionOrder[a.position as keyof typeof positionOrder] || 7;
      const posB = positionOrder[b.position as keyof typeof positionOrder] || 7;
      
      if (posA !== posB) {
        return posA - posB;
      }
      
      // Within the same position, sort by trade value (descending)
      const tradeValueA = a.trade_values?.[0]?.trade_value || 0;
      const tradeValueB = b.trade_values?.[0]?.trade_value || 0;
      return tradeValueB - tradeValueA;
    }) || [];

    // Create ranking entries with tier assignments
    const rankings = sortedPlayers.map((player, index) => {
      const rank = index + 1;
      let tier: number;
      
      // Tier assignments based on rank ranges
      if (rank <= 12) tier = 1;      // Elite tier
      else if (rank <= 24) tier = 2; // High-end tier
      else if (rank <= 36) tier = 3; // Mid-tier 1
      else if (rank <= 60) tier = 4; // Mid-tier 2
      else if (rank <= 84) tier = 5; // Depth tier
      else if (rank <= 120) tier = 6; // Late round tier
      else tier = 7; // Waiver wire tier

      return {
        ranking_set_id: requestBody.setId,
        player_id: player.id,
        overall_rank: rank,
        tier,
        notes: null
      };
    });

    if (rankings.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No players found for rankings' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert rankings in batches
    const batchSize = 50;
    let insertedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rankings.length; i += batchSize) {
      const batch = rankings.slice(i, i + batchSize);
      
      try {
        const { error: insertError } = await supabaseClient
          .from('user_rankings_players')
          .insert(batch);

        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
          errors.push(`Batch ${i / batchSize + 1}: ${insertError.message}`);
        } else {
          insertedCount += batch.length;
          console.log(`Successfully inserted batch ${i / batchSize + 1} with ${batch.length} rankings`);
        }
      } catch (batchError) {
        console.error(`Unexpected error in batch ${i / batchSize + 1}:`, batchError);
        errors.push(`Batch ${i / batchSize + 1}: ${batchError}`);
      }
    }

    // Update the ranking set's updated_at timestamp
    await supabaseClient
      .from('user_rankings_sets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', requestBody.setId);

    const response = {
      success: errors.length === 0,
      players_ranked: insertedCount,
      total_players: rankings.length,
      errors: errors.length,
      error_details: errors.length > 0 ? errors : undefined,
      ranking_set: rankingSet.name,
      format: rankingSet.format
    };

    console.log('Default rankings creation completed:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: errors.length === 0 ? 200 : 207,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in rankings-default function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});