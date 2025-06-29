
import { supabase } from "@/integrations/supabase/client";

export interface WeeklyStatsInput {
  passing_yards: number;
  passing_tds: number;
  passing_interceptions: number;
  rushing_yards: number;
  rushing_tds: number;
  receiving_yards: number;
  receiving_tds: number;
  receptions: number;
  fumbles_lost: number;
}

export interface ScoringSettings {
  format: 'standard' | 'ppr' | 'half_ppr';
  passing_yards_per_point: number;
  rushing_receiving_yards_per_point: number;
  passing_td_points: number;
  rushing_receiving_td_points: number;
  reception_points: number;
  interception_penalty: number;
  fumble_penalty: number;
}

export interface FantasyPointsResult {
  total_points: number;
  breakdown: {
    passing_points: number;
    rushing_points: number;
    receiving_points: number;
    penalty_points: number;
  };
  scoring_format: string;
}

export const DEFAULT_SCORING_SETTINGS: Record<string, ScoringSettings> = {
  standard: {
    format: 'standard',
    passing_yards_per_point: 25,
    rushing_receiving_yards_per_point: 10,
    passing_td_points: 6,
    rushing_receiving_td_points: 6,
    reception_points: 0,
    interception_penalty: -2,
    fumble_penalty: -2,
  },
  ppr: {
    format: 'ppr',
    passing_yards_per_point: 25,
    rushing_receiving_yards_per_point: 10,
    passing_td_points: 6,
    rushing_receiving_td_points: 6,
    reception_points: 1,
    interception_penalty: -2,
    fumble_penalty: -2,
  },
  half_ppr: {
    format: 'half_ppr',
    passing_yards_per_point: 25,
    rushing_receiving_yards_per_point: 10,
    passing_td_points: 6,
    rushing_receiving_td_points: 6,
    reception_points: 0.5,
    interception_penalty: -2,
    fumble_penalty: -2,
  },
};

export async function calculateFantasyPoints(
  stats: WeeklyStatsInput,
  scoringSettings?: ScoringSettings
): Promise<FantasyPointsResult> {
  const settings = scoringSettings || DEFAULT_SCORING_SETTINGS.standard;
  
  const { data, error } = await supabase.functions.invoke('calculate-fantasy-points', {
    body: { stats, scoring_settings: settings },
  });

  if (error) {
    console.error('Error calculating fantasy points:', error);
    throw new Error(`Failed to calculate fantasy points: ${error.message}`);
  }

  return data;
}

export async function calculateBatchFantasyPoints(
  players: Array<{ player_id: string; stats: WeeklyStatsInput }>,
  scoringSettings: ScoringSettings
): Promise<Array<{ player_id: string } & FantasyPointsResult>> {
  const { data, error } = await supabase.functions.invoke('calculate-fantasy-points', {
    body: { players, scoring_settings: scoringSettings },
  });

  if (error) {
    console.error('Error calculating batch fantasy points:', error);
    throw new Error(`Failed to calculate batch fantasy points: ${error.message}`);
  }

  return data.results;
}

export async function updateWeeklyStatsWithFantasyPoints(
  playerId: string,
  season: number,
  week: number,
  scoringFormat: 'standard' | 'ppr' | 'half_ppr' = 'standard'
): Promise<void> {
  // Fetch the weekly stats
  const { data: weeklyStats, error: fetchError } = await supabase
    .from('weekly_stats')
    .select('*')
    .eq('player_id', playerId)
    .eq('season', season)
    .eq('week', week)
    .single();

  if (fetchError || !weeklyStats) {
    throw new Error(`Failed to fetch weekly stats: ${fetchError?.message}`);
  }

  // Calculate fantasy points
  const stats: WeeklyStatsInput = {
    passing_yards: weeklyStats.passing_yards || 0,
    passing_tds: weeklyStats.passing_tds || 0,
    passing_interceptions: weeklyStats.passing_interceptions || 0,
    rushing_yards: weeklyStats.rushing_yards || 0,
    rushing_tds: weeklyStats.rushing_tds || 0,
    receiving_yards: weeklyStats.receiving_yards || 0,
    receiving_tds: weeklyStats.receiving_tds || 0,
    receptions: weeklyStats.receptions || 0,
    fumbles_lost: weeklyStats.fumbles_lost || 0,
  };

  const result = await calculateFantasyPoints(stats, DEFAULT_SCORING_SETTINGS[scoringFormat]);

  // Update the database with calculated points
  const { error: updateError } = await supabase
    .from('weekly_stats')
    .update({ fantasy_points: result.total_points })
    .eq('player_id', playerId)
    .eq('season', season)
    .eq('week', week);

  if (updateError) {
    throw new Error(`Failed to update fantasy points: ${updateError.message}`);
  }
}

export async function recalculateAllFantasyPoints(
  scoringFormat: 'standard' | 'ppr' | 'half_ppr' = 'standard'
): Promise<void> {
  // Fetch all weekly stats
  const { data: allStats, error: fetchError } = await supabase
    .from('weekly_stats')
    .select('*');

  if (fetchError) {
    throw new Error(`Failed to fetch all weekly stats: ${fetchError.message}`);
  }

  if (!allStats || allStats.length === 0) {
    return;
  }

  // Prepare batch calculation
  const players = allStats.map((stat) => ({
    player_id: stat.id,
    stats: {
      passing_yards: stat.passing_yards || 0,
      passing_tds: stat.passing_tds || 0,
      passing_interceptions: stat.passing_interceptions || 0,
      rushing_yards: stat.rushing_yards || 0,
      rushing_tds: stat.rushing_tds || 0,
      receiving_yards: stat.receiving_yards || 0,
      receiving_tds: stat.receiving_tds || 0,
      receptions: stat.receptions || 0,
      fumbles_lost: stat.fumbles_lost || 0,
    },
  }));

  // Calculate all fantasy points
  const results = await calculateBatchFantasyPoints(players, DEFAULT_SCORING_SETTINGS[scoringFormat]);

  // Update database with all calculated points
  const updates = results.map((result, index) => ({
    id: allStats[index].id,
    fantasy_points: result.total_points,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('weekly_stats')
      .update({ fantasy_points: update.fantasy_points })
      .eq('id', update.id);

    if (error) {
      console.error(`Failed to update fantasy points for ${update.id}:`, error);
    }
  }
}
