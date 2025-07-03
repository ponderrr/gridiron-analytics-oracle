import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Required secrets: DEBUG, NODE_ENV
// TypeScript types for environment variables
interface Env {
  DEBUG?: string;
  NODE_ENV?: string;
}

const debug = Deno.env.get("DEBUG");
const nodeEnv = Deno.env.get("NODE_ENV");
if (!debug || !nodeEnv) {
  console.warn(
    `Warning: Missing environment variables: ${[!debug ? "DEBUG" : "", !nodeEnv ? "NODE_ENV" : ""].filter(Boolean).join(", ")}`
  );
}

// Enable debug logging if the environment variable DEBUG or NODE_ENV=development is set
const DEBUG =
  typeof Deno !== "undefined" &&
  Deno.env &&
  (Deno.env.get("DEBUG") === "true" ||
    Deno.env.get("NODE_ENV") === "development");

// List of trusted origins
const allowedOrigins = [
  "https://yourdomain.com",
  "https://www.yourdomain.com",
  // Add more trusted domains as needed
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  let allowOrigin = "";
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  }
  // If not allowed, do not set the header (or set to empty string)
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

interface WeeklyStatsInput {
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

interface ScoringSettings {
  format: "standard" | "ppr" | "half_ppr";
  passing_yards_per_point: number; // default 25
  rushing_receiving_yards_per_point: number; // default 10
  passing_td_points: number; // default 6
  rushing_receiving_td_points: number; // default 6
  reception_points: number; // 0 for standard, 1 for PPR, 0.5 for half-PPR
  interception_penalty: number; // default -2
  fumble_penalty: number; // default -2
}

interface FantasyPointsResult {
  total_points: number;
  breakdown: {
    passing_points: number;
    rushing_points: number;
    receiving_points: number;
    penalty_points: number;
  };
  scoring_format: string;
}

interface BatchCalculationRequest {
  players: Array<{
    player_id: string;
    stats: WeeklyStatsInput;
  }>;
  scoring_settings: ScoringSettings;
}

function getDefaultScoringSettings(
  format: "standard" | "ppr" | "half_ppr"
): ScoringSettings {
  const baseSettings = {
    format,
    passing_yards_per_point: 25,
    rushing_receiving_yards_per_point: 10,
    passing_td_points: 6,
    rushing_receiving_td_points: 6,
    interception_penalty: -2,
    fumble_penalty: -2,
  };

  switch (format) {
    case "ppr":
      return { ...baseSettings, reception_points: 1 };
    case "half_ppr":
      return { ...baseSettings, reception_points: 0.5 };
    default:
      return { ...baseSettings, reception_points: 0 };
  }
}

function validateWeeklyStats(stats: any): WeeklyStatsInput {
  const validatedStats = {
    passing_yards: Math.max(0, Number(stats.passing_yards) || 0),
    passing_tds: Math.max(0, Number(stats.passing_tds) || 0),
    passing_interceptions: Math.max(
      0,
      Number(stats.passing_interceptions) || 0
    ),
    rushing_yards: Math.max(0, Number(stats.rushing_yards) || 0),
    rushing_tds: Math.max(0, Number(stats.rushing_tds) || 0),
    receiving_yards: Math.max(0, Number(stats.receiving_yards) || 0),
    receiving_tds: Math.max(0, Number(stats.receiving_tds) || 0),
    receptions: Math.max(0, Number(stats.receptions) || 0),
    fumbles_lost: Math.max(0, Number(stats.fumbles_lost) || 0),
  };

  if (DEBUG) console.log("Validated stats:", validatedStats);
  return validatedStats;
}

function calculateFantasyPoints(
  stats: WeeklyStatsInput,
  settings: ScoringSettings
): FantasyPointsResult {
  if (DEBUG) console.log("Calculating points for stats:", stats);
  if (DEBUG) console.log("Using scoring settings:", settings);

  // Calculate passing points
  const passingYardPoints =
    stats.passing_yards / settings.passing_yards_per_point;
  const passingTdPoints = stats.passing_tds * settings.passing_td_points;
  const passing_points = passingYardPoints + passingTdPoints;

  // Calculate rushing points
  const rushingYardPoints =
    stats.rushing_yards / settings.rushing_receiving_yards_per_point;
  const rushingTdPoints =
    stats.rushing_tds * settings.rushing_receiving_td_points;
  const rushing_points = rushingYardPoints + rushingTdPoints;

  // Calculate receiving points
  const receivingYardPoints =
    stats.receiving_yards / settings.rushing_receiving_yards_per_point;
  const receivingTdPoints =
    stats.receiving_tds * settings.rushing_receiving_td_points;
  const receptionPoints = stats.receptions * settings.reception_points;
  const receiving_points =
    receivingYardPoints + receivingTdPoints + receptionPoints;

  // Calculate penalty points
  const interceptionPoints =
    stats.passing_interceptions * settings.interception_penalty;
  const fumblePoints = stats.fumbles_lost * settings.fumble_penalty;
  const penalty_points = interceptionPoints + fumblePoints;

  const total_points =
    passing_points + rushing_points + receiving_points + penalty_points;

  const result = {
    total_points: Math.round(total_points * 100) / 100, // Round to 2 decimal places
    breakdown: {
      passing_points: Math.round(passing_points * 100) / 100,
      rushing_points: Math.round(rushing_points * 100) / 100,
      receiving_points: Math.round(receiving_points * 100) / 100,
      penalty_points: Math.round(penalty_points * 100) / 100,
    },
    scoring_format: settings.format,
  };

  if (DEBUG) console.log("Calculated result:", result);
  return result;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { ...corsHeaders, Allow: "POST" },
      });
    }

    const body = await req.json();
    console.log("Received request:", body);

    // Handle batch calculations
    if (body.players && Array.isArray(body.players)) {
      const batchRequest = body as BatchCalculationRequest;
      const results = batchRequest.players.map((player) => {
        const validatedStats = validateWeeklyStats(player.stats);
        const calculation = calculateFantasyPoints(
          validatedStats,
          batchRequest.scoring_settings
        );
        return {
          player_id: player.player_id,
          ...calculation,
        };
      });

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle single calculation
    const { stats, scoring_settings } = body;

    if (!stats) {
      return new Response(JSON.stringify({ error: "Stats are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use provided scoring settings or default based on format
    let finalScoringSettings: ScoringSettings;
    if (scoring_settings) {
      finalScoringSettings = scoring_settings;
    } else {
      const format = body.format || "standard";
      finalScoringSettings = getDefaultScoringSettings(format);
    }

    const validatedStats = validateWeeklyStats(stats);
    const result = calculateFantasyPoints(validatedStats, finalScoringSettings);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in calculate-fantasy-points:", error);
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
