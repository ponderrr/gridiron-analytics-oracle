import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ETLBase } from "../_shared/etl-utils.ts";

interface MappingAnalytics {
  total_mappings: number;
  by_method: {
    exact: number;
    fuzzy: number;
    manual: number;
    community: number;
  };
  by_confidence: {
    high: number; // > 0.9
    medium: number; // 0.8 - 0.9
    low: number; // < 0.8
  };
  verification_status: {
    verified: number;
    unverified: number;
  };
  unmapped_players: {
    nflverse: number;
    sleeper: number;
  };
  recent_activity: {
    last_7_days: number;
    last_30_days: number;
  };
}

class MappingAnalytics extends ETLBase {
  async generateAnalytics(): Promise<MappingAnalytics> {
    const [mappingStats, unmappedStats, recentActivity] = await Promise.all([
      this.getMappingStatistics(),
      this.getUnmappedStatistics(),
      this.getRecentActivity(),
    ]);

    return {
      ...mappingStats,
      unmapped_players: unmappedStats,
      recent_activity: recentActivity,
    };
  }

  private async getMappingStatistics() {
    const { data, error } = await this.supabase
      .from("player_id_mapping")
      .select("match_method, confidence_score, verified");

    if (error) throw error;

    const stats = {
      total_mappings: data.length,
      by_method: {
        exact: 0,
        fuzzy: 0,
        manual: 0,
        community: 0,
      },
      by_confidence: {
        high: 0,
        medium: 0,
        low: 0,
      },
      verification_status: {
        verified: 0,
        unverified: 0,
      },
    };

    data.forEach((mapping) => {
      // Count by method with runtime validation
      const matchMethod = mapping.match_method;
      if (
        matchMethod &&
        typeof matchMethod === "string" &&
        matchMethod in stats.by_method
      ) {
        stats.by_method[matchMethod as keyof typeof stats.by_method]++;
      } else {
        console.warn(`Invalid match_method encountered: ${matchMethod}`);
      }

      // Count by confidence
      if (mapping.confidence_score > 0.9) {
        stats.by_confidence.high++;
      } else if (mapping.confidence_score >= 0.8) {
        stats.by_confidence.medium++;
      } else {
        stats.by_confidence.low++;
      }

      // Count by verification
      if (mapping.verified) {
        stats.verification_status.verified++;
      } else {
        stats.verification_status.unverified++;
      }
    });

    return stats;
  }

  private async getUnmappedStatistics() {
    const { data, error } = await this.supabase
      .from("unmapped_players")
      .select("source");

    if (error) throw error;

    const stats = {
      nflverse: 0,
      sleeper: 0,
    };

    data.forEach((player) => {
      // Count by source with runtime validation
      const source = player.source;
      if (source && typeof source === "string" && source in stats) {
        stats[source as keyof typeof stats]++;
      } else {
        console.warn(`Invalid source encountered: ${source}`);
      }
    });

    return stats;
  }

  private async getRecentActivity() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [last7Days, last30Days] = await Promise.all([
      this.supabase
        .from("player_id_mapping")
        .select("id", { count: "exact" })
        .gte("created_at", sevenDaysAgo.toISOString()),
      this.supabase
        .from("player_id_mapping")
        .select("id", { count: "exact" })
        .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

    return {
      last_7_days: last7Days.count || 0,
      last_30_days: last30Days.count || 0,
    };
  }

  async getTopUnmappedPlayers(limit = 20) {
    const { data, error } = await this.supabase
      .from("unmapped_players")
      .select("player_name, position, team, attempts_count, last_attempt")
      .eq("source", "nflverse")
      .order("attempts_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getLowConfidenceMappings(limit = 20) {
    const { data, error } = await this.supabase
      .from("player_id_mapping")
      .select("canonical_name, confidence_score, match_method, verified, notes")
      .lt("confidence_score", 0.85)
      .eq("verified", false)
      .order("confidence_score", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

// Helper function to validate and sanitize limit parameter
function validateLimit(
  limitParam: string | null,
  defaultValue = 20,
  maxLimit = 100
): number {
  if (!limitParam) return defaultValue;

  const parsed = parseInt(limitParam, 10);

  // Check if parsing was successful and value is positive
  if (isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }

  // Ensure the value doesn't exceed maximum limit
  return Math.min(parsed, maxLimit);
}

// Whitelist of allowed report types
const ALLOWED_REPORT_TYPES = ["summary", "unmapped", "low-confidence"] as const;
type ReportType = (typeof ALLOWED_REPORT_TYPES)[number];

// Helper function to validate report parameter
function validateReport(
  reportParam: string | null,
  defaultValue: ReportType = "summary"
): ReportType {
  if (!reportParam) return defaultValue;

  // Check if the report parameter is in the whitelist
  if (ALLOWED_REPORT_TYPES.includes(reportParam as ReportType)) {
    return reportParam as ReportType;
  }

  // Log warning for invalid report type and return default
  console.warn(
    `Invalid report type encountered: ${reportParam}, defaulting to ${defaultValue}`
  );
  return defaultValue;
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const url = new URL(req.url);
    const report = validateReport(url.searchParams.get("report"));

    const analytics = new MappingAnalytics(supabaseUrl, supabaseServiceKey);

    let result;

    switch (report) {
      case "summary":
        result = await analytics.generateAnalytics();
        break;
      case "unmapped":
        result = await analytics.getTopUnmappedPlayers(
          validateLimit(url.searchParams.get("limit"))
        );
        break;
      case "low-confidence":
        result = await analytics.getLowConfidenceMappings(
          validateLimit(url.searchParams.get("limit"))
        );
        break;
      default:
        throw new Error("Invalid report type");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 500,
      }
    );
  }
});
