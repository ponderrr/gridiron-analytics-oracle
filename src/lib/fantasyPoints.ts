import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_SCORING_SETTINGS,
  ScoringSettings,
} from "./fantasyPoints.constants";

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

/**
 * Validates that all stats are non-negative numbers.
 * @param stats WeeklyStatsInput
 * @throws FantasyPointsValidationError if any stat is negative or not a number
 */
export function validateStatsInput(stats: WeeklyStatsInput): void {
  for (const [key, value] of Object.entries(stats)) {
    if (typeof value !== "number" || value < 0) {
      throw new Error(`Invalid stat '${key}': must be a non-negative number.`);
    }
  }
}

/**
 * Validates scoring settings object.
 * @param settings ScoringSettings
 * @throws FantasyPointsValidationError if settings are malformed
 */
export function validateScoringSettings(settings: ScoringSettings): void {
  if (!settings || typeof settings !== "object") {
    throw new Error("Scoring settings must be a valid object.");
  }
  if (!["standard", "ppr", "half_ppr"].includes(settings.format)) {
    throw new Error("Invalid scoring format.");
  }

  const numericKeys: (keyof ScoringSettings)[] = [
    "passing_yards_per_point",
    "rushing_receiving_yards_per_point",
    "passing_td_points",
    "rushing_receiving_td_points",
    "reception_points",
    "interception_penalty",
    "fumble_penalty",
  ];

  numericKeys.forEach((key) => {
    if (typeof settings[key] !== "number") {
      throw new Error(`Scoring setting '${key}' must be a number.`);
    }
  });
}

/**
 * Calculates fantasy points for a single player's weekly stats.
 * @param stats WeeklyStatsInput
 * @param scoringSettings Optional custom scoring settings
 * @returns FantasyPointsResult
 */
export async function calculateFantasyPoints(
  stats: WeeklyStatsInput,
  scoringSettings?: ScoringSettings
): Promise<FantasyPointsResult> {
  validateStatsInput(stats);
  const settings = scoringSettings || DEFAULT_SCORING_SETTINGS.standard;
  validateScoringSettings(settings);

  const { data, error } = await supabase.functions.invoke(
    "calculate-fantasy-points",
    {
      body: { stats, scoring_settings: settings },
    }
  );

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error calculating fantasy points:", error);
    }
    throw new Error(`Failed to calculate fantasy points: ${error.message}`);
  }

  return data;
}

/**
 * Calculates fantasy points for a batch of players.
 * @param players Array of player_id and stats
 * @param scoringSettings ScoringSettings
 * @returns Array of results with player_id
 */
export async function calculateBatchFantasyPoints(
  players: Array<{ player_id: string; stats: WeeklyStatsInput }>,
  scoringSettings: ScoringSettings
): Promise<Array<{ player_id: string } & FantasyPointsResult>> {
  players.forEach((p) => validateStatsInput(p.stats));
  validateScoringSettings(scoringSettings);

  const { data, error } = await supabase.functions.invoke(
    "calculate-fantasy-points",
    {
      body: { players, scoring_settings: scoringSettings },
    }
  );

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error calculating batch fantasy points:", error);
    }
    throw new Error(
      `Failed to calculate batch fantasy points: ${error.message}`
    );
  }

  return data.results;
}

/**
 * Updates a player's weekly stats row with calculated fantasy points.
 * @param playerId string
 * @param season number
 * @param week number
 * @param scoringFormat 'standard' | 'ppr' | 'half_ppr'
 */
export async function updateWeeklyStatsWithFantasyPoints(
  playerId: string,
  season: number,
  week: number,
  scoringFormat: "standard" | "ppr" | "half_ppr" = "standard"
): Promise<void> {
  // Fetch the weekly stats
  const { data: weeklyStats, error: fetchError } = await supabase
    .from("weekly_stats")
    .select("*")
    .eq("player_id", playerId)
    .eq("season", season)
    .eq("week", week)
    .single();

  if (fetchError || !weeklyStats) {
    throw new Error(`Failed to fetch weekly stats: ${fetchError?.message}`);
  }

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
  validateStatsInput(stats);

  const result = await calculateFantasyPoints(
    stats,
    DEFAULT_SCORING_SETTINGS[scoringFormat]
  );

  // Update the database with calculated points
  const { error: updateError } = await supabase
    .from("weekly_stats")
    .update({ fantasy_points: result.total_points })
    .eq("player_id", playerId)
    .eq("season", season)
    .eq("week", week);

  if (updateError) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `Failed to update fantasy points for ${playerId}:`,
        updateError
      );
    }
    throw new Error(`Failed to update fantasy points: ${updateError.message}`);
  }
}

/**
 * Recalculates fantasy points for all weekly stats rows.
 * @param scoringFormat 'standard' | 'ppr' | 'half_ppr'
 */
export async function recalculateAllFantasyPoints(
  scoringFormat: "standard" | "ppr" | "half_ppr" = "standard"
): Promise<void> {
  // Fetch all weekly stats
  const { data: allStats, error: fetchError } = await supabase
    .from("weekly_stats")
    .select("*");

  if (fetchError) {
    throw new Error(`Failed to fetch all weekly stats: ${fetchError.message}`);
  }

  if (!allStats || allStats.length === 0) {
    return;
  }

  // Prepare batch calculation
  const players = allStats.map((stat) => {
    const stats: WeeklyStatsInput = {
      passing_yards: stat.passing_yards || 0,
      passing_tds: stat.passing_tds || 0,
      passing_interceptions: stat.passing_interceptions || 0,
      rushing_yards: stat.rushing_yards || 0,
      rushing_tds: stat.rushing_tds || 0,
      receiving_yards: stat.receiving_yards || 0,
      receiving_tds: stat.receiving_tds || 0,
      receptions: stat.receptions || 0,
      fumbles_lost: stat.fumbles_lost || 0,
    };
    validateStatsInput(stats);
    return {
      player_id: stat.id,
      stats,
    };
  });

  // Calculate all fantasy points
  const results = await calculateBatchFantasyPoints(
    players,
    DEFAULT_SCORING_SETTINGS[scoringFormat]
  );

  // Update database with all calculated points
  const updates = results.map((result, index) => ({
    id: allStats[index].id,
    fantasy_points: result.total_points,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("weekly_stats")
      .update({ fantasy_points: update.fantasy_points })
      .eq("id", update.id);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `Failed to update fantasy points for ${update.id}:`,
          error
        );
      }
    }
  }
}
