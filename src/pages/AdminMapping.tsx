import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import MappingAnalytics from "@/components/admin/MappingAnalytics";
import MappingReview from "@/components/admin/MappingReview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkMappingResults {
  exact_matches: number;
  fuzzy_matches: number;
  manual_review_needed: number;
  unmapped: number;
  total_processed: number;
}

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

// Configurable week numbers for Quick Stats Sync
const QUICK_STATS_WEEKS = [5, 10, 15, 18];

export default function AdminMapping() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkMappingResults | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Fetch system health on component mount and every 30 seconds
  useEffect(() => {
    const fetchSystemHealth = async () => {
      setIsLoadingHealth(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "system-health-check",
          {
            body: { action: "check" },
          }
        );

        if (error) {
          throw error;
        }

        if (data?.success) {
          setSystemHealth(data.data);
        } else {
          throw new Error(data?.error || "Health check failed");
        }
      } catch (error: unknown) {
        console.error("Health check failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error("Health check failed: " + errorMessage);
      } finally {
        setIsLoadingHealth(false);
      }
    };

    // Initial fetch
    fetchSystemHealth();

    // Set up interval for periodic health checks
    const healthInterval = setInterval(fetchSystemHealth, 30000); // 30 seconds

    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  const runBulkMapping = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    try {
      // Simulate progress (you can make this real with websockets)
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke(
        "bulk-player-mapping",
        {
          body: { action: "run" },
        }
      );

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(100);

      if (error) {
        throw error;
      }

      if (data?.success) {
        setResults(data.data);
        toast.success("Bulk mapping completed successfully!");
      } else {
        throw new Error(data?.error || "Bulk mapping failed");
      }
    } catch (error: unknown) {
      console.error("Bulk mapping failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Bulk mapping failed: " + errorMessage);
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsRunning(false);
    }
  };

  const getHealthBadgeVariant = (status: "healthy" | "degraded" | "down") => {
    switch (status) {
      case "healthy":
        return "default";
      case "degraded":
        return "secondary";
      case "down":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getHealthStatusText = (status: "healthy" | "degraded" | "down") => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "degraded":
        return "Degraded";
      case "down":
        return "Down";
      default:
        return "Unknown";
    }
  };

  const runStatsSync = async (week: number) => {
    try {
      toast.info(`Syncing week ${week} stats...`);

      const { data, error } = await supabase.functions.invoke(
        "sync-weekly-stats",
        {
          body: { week, season: 2024 },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success(`Week ${week} stats synced successfully!`);
        console.log("Stats sync result:", data);
      } else {
        throw new Error(data?.error || "Stats sync failed");
      }
    } catch (error: unknown) {
      console.error("Stats sync failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Week ${week} sync failed: ` + errorMessage);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Player Mapping System</h1>
          <p className="text-muted-foreground">
            Manage player identity resolution between NFLverse and Sleeper
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="review">Manual Review</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <MappingAnalytics />
          </TabsContent>

          <TabsContent value="review">
            <MappingReview />
          </TabsContent>

          <TabsContent value="bulk">
            <div className="space-y-6">
              {/* Bulk Mapping Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Player Mapping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Run the initial mapping process to link NFLverse players
                    with Sleeper players. This should be run once to establish
                    the baseline mapping.
                  </p>

                  {isRunning && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Processing player mappings... {progress}%
                      </p>
                    </div>
                  )}

                  {results && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center">
                        <Badge variant="default">{results.exact_matches}</Badge>
                        <p className="text-xs">Exact Matches</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="secondary">
                          {results.fuzzy_matches}
                        </Badge>
                        <p className="text-xs">Fuzzy Matches</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline">
                          {results.manual_review_needed}
                        </Badge>
                        <p className="text-xs">Need Review</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="destructive">{results.unmapped}</Badge>
                        <p className="text-xs">Unmapped</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={runBulkMapping}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning ? "Processing..." : "Run Bulk Mapping"}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats Sync Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats Sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Test the stats sync with specific weeks to verify the
                    mapping system is working.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {QUICK_STATS_WEEKS.map((week) => (
                      <Button
                        key={week}
                        variant="outline"
                        onClick={() => runStatsSync(week)}
                        className="w-full"
                      >
                        Week {week}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    System Status
                    <div className="flex items-center gap-2">
                      {systemHealth && (
                        <Badge
                          variant={getHealthBadgeVariant(systemHealth.overall)}
                          className="text-xs"
                        >
                          {getHealthStatusText(systemHealth.overall)}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setIsLoadingHealth(true);
                          try {
                            const { data, error } =
                              await supabase.functions.invoke(
                                "system-health-check",
                                {
                                  body: { action: "check" },
                                }
                              );

                            if (error) {
                              throw error;
                            }

                            if (data?.success) {
                              setSystemHealth(data.data);
                              toast.success("System status refreshed");
                            } else {
                              throw new Error(
                                data?.error || "Health check failed"
                              );
                            }
                          } catch (error: unknown) {
                            console.error("Health check failed:", error);
                            const errorMessage =
                              error instanceof Error
                                ? error.message
                                : "Unknown error occurred";
                            toast.error("Health check failed: " + errorMessage);
                          } finally {
                            setIsLoadingHealth(false);
                          }
                        }}
                        disabled={isLoadingHealth}
                      >
                        {isLoadingHealth ? "Refreshing..." : "Refresh"}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingHealth ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Loading system status...</span>
                        <Badge variant="outline">Checking</Badge>
                      </div>
                    </div>
                  ) : systemHealth ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mapping Database:</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getHealthBadgeVariant(
                              systemHealth.database.status
                            )}
                          >
                            {getHealthStatusText(systemHealth.database.status)}
                          </Badge>
                          {systemHealth.database.responseTime && (
                            <span className="text-xs text-muted-foreground">
                              {systemHealth.database.responseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Edge Functions:</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getHealthBadgeVariant(
                              systemHealth.edgeFunctions.status
                            )}
                          >
                            {getHealthStatusText(
                              systemHealth.edgeFunctions.status
                            )}
                          </Badge>
                          {systemHealth.edgeFunctions.responseTime && (
                            <span className="text-xs text-muted-foreground">
                              {systemHealth.edgeFunctions.responseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>NFLVerse API:</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getHealthBadgeVariant(
                              systemHealth.nflverseApi.status
                            )}
                          >
                            {getHealthStatusText(
                              systemHealth.nflverseApi.status
                            )}
                          </Badge>
                          {systemHealth.nflverseApi.responseTime && (
                            <span className="text-xs text-muted-foreground">
                              {systemHealth.nflverseApi.responseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Sleeper Cache:</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getHealthBadgeVariant(
                              systemHealth.sleeperCache.status
                            )}
                          >
                            {getHealthStatusText(
                              systemHealth.sleeperCache.status
                            )}
                          </Badge>
                          {systemHealth.sleeperCache.responseTime && (
                            <span className="text-xs text-muted-foreground">
                              {systemHealth.sleeperCache.responseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                      {systemHealth.timestamp && (
                        <div className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                          Last updated:{" "}
                          {new Date(systemHealth.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>System status unavailable</span>
                        <Badge variant="outline">Unknown</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Mapping Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configuration options for the player mapping system will be
                  available here.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Fuzzy Match Threshold:</span>
                    <Badge variant="outline">0.8 (80%)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Auto-create Mappings:</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Manual Review Required:</span>
                    <Badge variant="secondary">Low Confidence</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
