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

// Memoized/cached scoring settings (module-level cache)
const scoringSettingsCache: Record<string, ScoringSettings> = {};
function getCachedScoringSettings(format: string): ScoringSettings {
  if (!scoringSettingsCache[format]) {
    scoringSettingsCache[format] = DEFAULT_SCORING_SETTINGS[format];
  }
  return scoringSettingsCache[format];
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
 * Memoizes scoring settings and validates input before API call.
 * Error boundary included for robust error handling.
 */
export async function calculateFantasyPoints(
  stats: WeeklyStatsInput,
  scoringSettings?: ScoringSettings
): Promise<FantasyPointsResult> {
  try {
    validateStatsInput(stats);
    const settings = scoringSettings || getCachedScoringSettings("standard");
    validateScoringSettings(settings);

    const { data, error } = await supabase.functions.invoke(
      "calculate-fantasy-points",
      {
        body: { stats, scoring_settings: settings },
      }
    );

    if (error) {
      throw new Error(`Failed to calculate fantasy points: ${error.message}`);
    }

    return data;
  } catch (err) {
    // Error boundary for calculation
    if (process.env.NODE_ENV === "development") {
      console.error("Fantasy points calculation error:", err);
    }
    throw err;
  }
}

/**
 * Synchronous calculation of fantasy points for a single player's weekly stats.
 * Calculates fantasy points locally without API calls. Can be used in any synchronous scenario (e.g., UI previews, tests, or local calculations).
 * Validates input and scoring settings to ensure robust error handling.
 */
export function calculateFantasyPointsSync(
  stats: Partial<WeeklyStatsInput>,
  scoringSettings: ScoringSettings = DEFAULT_SCORING_SETTINGS.standard
): number {
  const defaultStats: WeeklyStatsInput = {
    passing_yards: 0,
    passing_tds: 0,
    passing_interceptions: 0,
    rushing_yards: 0,
    rushing_tds: 0,
    receiving_yards: 0,
    receiving_tds: 0,
    receptions: 0,
    fumbles_lost: 0,
  };

  const completeStats = { ...defaultStats, ...stats };

  // Input validation (mirrors async version)
  validateStatsInput(completeStats);
  validateScoringSettings(scoringSettings);

  let points = 0;

  // Passing points
  points +=
    completeStats.passing_yards / scoringSettings.passing_yards_per_point;
  points += completeStats.passing_tds * scoringSettings.passing_td_points;
  points +=
    completeStats.passing_interceptions * scoringSettings.interception_penalty;

  // Rushing points
  points +=
    completeStats.rushing_yards /
    scoringSettings.rushing_receiving_yards_per_point;
  points +=
    completeStats.rushing_tds * scoringSettings.rushing_receiving_td_points;

  // Receiving points
  points +=
    completeStats.receiving_yards /
    scoringSettings.rushing_receiving_yards_per_point;
  points +=
    completeStats.receiving_tds * scoringSettings.rushing_receiving_td_points;
  points += completeStats.receptions * scoringSettings.reception_points;

  // Penalty points
  points += completeStats.fumbles_lost * scoringSettings.fumble_penalty;

  return points;
}

/**
 * Sums up a specific stat across multiple stat objects.
 */
export function getPlayerStatTotal(
  stats: Array<Partial<WeeklyStatsInput>>,
  statKey: keyof WeeklyStatsInput
): number {
  return stats.reduce((total, stat) => {
    return total + (stat[statKey] || 0);
  }, 0);
}

/**
 * Calculates fantasy points for a batch of players.
 * Optimized: validates and filters only valid players before API call.
 * Error boundary included for robust error handling.
 */
export async function calculateBatchFantasyPoints(
  players: Array<{ player_id: string; stats: WeeklyStatsInput }>,
  scoringSettings: ScoringSettings
): Promise<Array<{ player_id: string } & FantasyPointsResult>> {
  try {
    // Validate and filter only valid players
    const validPlayers = players.filter((p) => {
      try {
        validateStatsInput(p.stats);
        return true;
      } catch {
        return false;
      }
    });
    if (validPlayers.length === 0) {
      throw new Error("No valid player stats provided for batch calculation.");
    }
    validateScoringSettings(scoringSettings);

    const { data, error } = await supabase.functions.invoke(
      "calculate-fantasy-points",
      {
        body: { players: validPlayers, scoring_settings: scoringSettings },
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
  } catch (err) {
    // Error boundary for batch calculation
    if (process.env.NODE_ENV === "development") {
      console.error("Batch fantasy points calculation error:", err);
    }
    throw err;
  }
}

/**
 * Updates a player's weekly stats row with calculated fantasy points.
 * Error boundary included for robust error handling.
 */
export async function updateWeeklyStatsWithFantasyPoints(
  playerId: string,
  season: number,
  week: number,
  scoringFormat: "standard" | "ppr" | "half_ppr" = "standard"
): Promise<void> {
  try {
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
      getCachedScoringSettings(scoringFormat)
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
      throw new Error(
        `Failed to update fantasy points for ${playerId}: ${updateError.message}`
      );
    }
  } catch (err) {
    // Error boundary for update
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating fantasy points:", err);
    }
    throw err;
  }
}
