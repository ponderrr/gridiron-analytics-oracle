import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface HealthCheckResult {
  service: string;
  status: "healthy" | "degraded" | "down";
  responseTime?: number;
  error?: string;
  details?: any;
}

interface SystemHealth {
  database: HealthCheckResult;
  edgeFunctions: HealthCheckResult;
  nflverseApi: HealthCheckResult;
  sleeperCache: HealthCheckResult;
  overall: "healthy" | "degraded" | "down";
  timestamp: string;
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const healthChecks: HealthCheckResult[] = [];

    // Check Database
    const dbStart = Date.now();
    try {
      const { data, error } = await supabase
        .from("player_mappings")
        .select("count")
        .limit(1);
      
      const dbResponseTime = Date.now() - dbStart;
      
      if (error) {
        healthChecks.push({
          service: "database",
          status: "down",
          responseTime: dbResponseTime,
          error: error.message,
        });
      } else {
        healthChecks.push({
          service: "database",
          status: "healthy",
          responseTime: dbResponseTime,
          details: { recordCount: data?.length || 0 },
        });
      }
    } catch (error) {
      healthChecks.push({
        service: "database",
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Check Edge Functions (self-check)
    const efStart = Date.now();
    try {
      // Test a simple edge function call - we'll just check if the function exists
      // by making a minimal request to test-sleeper-api
      const { data, error } = await supabase.functions.invoke(
        "test-sleeper-api",
        { body: { test: "ping" } }
      );
      
      const efResponseTime = Date.now() - efStart;
      
      if (error) {
        healthChecks.push({
          service: "edgeFunctions",
          status: "degraded",
          responseTime: efResponseTime,
          error: error.message,
        });
      } else {
        healthChecks.push({
          service: "edgeFunctions",
          status: "healthy",
          responseTime: efResponseTime,
        });
      }
    } catch (error) {
      healthChecks.push({
        service: "edgeFunctions",
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Check NFLVerse API
    const nflStart = Date.now();
    try {
      const response = await fetch(
        "https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_2024.csv",
        { method: "HEAD" }
      );
      
      const nflResponseTime = Date.now() - nflStart;
      
      if (!response.ok) {
        healthChecks.push({
          service: "nflverseApi",
          status: "down",
          responseTime: nflResponseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        });
      } else {
        healthChecks.push({
          service: "nflverseApi",
          status: "healthy",
          responseTime: nflResponseTime,
        });
      }
    } catch (error) {
      healthChecks.push({
        service: "nflverseApi",
        status: "down",
        error: error instanceof Error ? error.message : "Network error",
      });
    }

    // Check Sleeper Cache
    const sleeperStart = Date.now();
    try {
      const { data, error } = await supabase
        .from("sleeper_players_cache")
        .select("player_id")
        .limit(1);
      
      const sleeperResponseTime = Date.now() - sleeperStart;
      
      if (error) {
        healthChecks.push({
          service: "sleeperCache",
          status: "down",
          responseTime: sleeperResponseTime,
          error: error.message,
        });
      } else {
        // Check if cache has recent data (within last 24 hours)
        const { data: recentData } = await supabase
          .from("sleeper_players_cache")
          .select("updated_at")
          .order("updated_at", { ascending: false })
          .limit(1);
        
        const isRecent = recentData?.[0]?.updated_at && 
          new Date(recentData[0].updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        healthChecks.push({
          service: "sleeperCache",
          status: isRecent ? "healthy" : "degraded",
          responseTime: sleeperResponseTime,
          details: { 
            hasData: data?.length > 0,
            isRecent,
            lastUpdate: recentData?.[0]?.updated_at 
          },
        });
      }
    } catch (error) {
      healthChecks.push({
        service: "sleeperCache",
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Determine overall status
    const downServices = healthChecks.filter(h => h.status === "down").length;
    const degradedServices = healthChecks.filter(h => h.status === "degraded").length;
    
    let overall: "healthy" | "degraded" | "down" = "healthy";
    if (downServices > 0) {
      overall = "down";
    } else if (degradedServices > 0) {
      overall = "degraded";
    }

    const systemHealth: SystemHealth = {
      database: healthChecks.find(h => h.service === "database")!,
      edgeFunctions: healthChecks.find(h => h.service === "edgeFunctions")!,
      nflverseApi: healthChecks.find(h => h.service === "nflverseApi")!,
      sleeperCache: healthChecks.find(h => h.service === "sleeperCache")!,
      overall,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: systemHealth,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}); 