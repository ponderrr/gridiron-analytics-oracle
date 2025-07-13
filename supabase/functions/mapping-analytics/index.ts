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
      // Count by method
      stats.by_method[mapping.match_method as keyof typeof stats.by_method]++;

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
      stats[player.source as keyof typeof stats]++;
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
    const report = url.searchParams.get("report") || "summary";

    const analytics = new MappingAnalytics(supabaseUrl, supabaseServiceKey);

    let result;

    switch (report) {
      case "summary":
        result = await analytics.generateAnalytics();
        break;
      case "unmapped":
        result = await analytics.getTopUnmappedPlayers(
          parseInt(url.searchParams.get("limit") || "20")
        );
        break;
      case "low-confidence":
        result = await analytics.getLowConfidenceMappings(
          parseInt(url.searchParams.get("limit") || "20")
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
