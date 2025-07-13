import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Zap,
  Activity,
  Shield,
  TrendingUp,
  Target,
  MapPin,
  BarChart,
  Cog,
  Monitor,
  Server,
  Globe,
  HardDrive
} from "lucide-react";
import Layout from "@/components/Layout";
import MappingAnalytics from "@/components/admin/MappingAnalytics";
import MappingReview from "@/components/admin/MappingReview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("analytics");
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

  const getHealthIcon = (status: "healthy" | "degraded" | "down") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">PLAYER MAPPING</h1>
            <p className="text-lg text-muted-foreground text-center">Manage player identity resolution between NFLverse and Sleeper</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full bg-[var(--color-bg-card)]/80 backdrop-blur-md border border-[var(--color-border-primary)] rounded-2xl shadow-xl p-8"
          >
            {/* Centered tab navigation with animated indicator */}
            <div className="relative flex justify-center w-full mb-8 border-b border-slate-200 dark:border-slate-200/10">
              <button
                className={cn(
                  "text-lg font-semibold pb-3 px-6 transition-colors border-b-2 flex-1 text-center flex items-center justify-center gap-2",
                  activeTab === "analytics"
                    ? "text-primary border-primary"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                )}
                onClick={() => handleTabChange("analytics")}
                type="button"
                style={{ zIndex: 1 }}
              >
                <BarChart3 className="h-5 w-5" />
                Analytics
              </button>
              <button
                className={cn(
                  "text-lg font-semibold pb-3 px-6 transition-colors border-b-2 flex-1 text-center flex items-center justify-center gap-2",
                  activeTab === "review"
                    ? "text-primary border-primary"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                )}
                onClick={() => handleTabChange("review")}
                type="button"
                style={{ zIndex: 1 }}
              >
                <Users className="h-5 w-5" />
                Manual Review
              </button>
              <button
                className={cn(
                  "text-lg font-semibold pb-3 px-6 transition-colors border-b-2 flex-1 text-center flex items-center justify-center gap-2",
                  activeTab === "bulk"
                    ? "text-primary border-primary"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                )}
                onClick={() => handleTabChange("bulk")}
                type="button"
                style={{ zIndex: 1 }}
              >
                <Zap className="h-5 w-5" />
                Bulk Operations
              </button>
              <button
                className={cn(
                  "text-lg font-semibold pb-3 px-6 transition-colors border-b-2 flex-1 text-center flex items-center justify-center gap-2",
                  activeTab === "settings"
                    ? "text-primary border-primary"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                )}
                onClick={() => handleTabChange("settings")}
                type="button"
                style={{ zIndex: 1 }}
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
              {/* Animated underline indicator */}
              <motion.span
                layout
                className="absolute bottom-0 left-0 h-0.5 bg-primary rounded"
                initial={false}
                animate={{
                  x: activeTab === "analytics" ? 0 : activeTab === "review" ? "100%" : activeTab === "bulk" ? "200%" : "300%",
                  width: "25%"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ width: "25%" }}
              />
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                {activeTab === "analytics" && (
                  <MappingAnalytics />
                )}

                {activeTab === "review" && (
                  <MappingReview />
                )}

                {activeTab === "bulk" && (
                  <div className="space-y-6">
                    {/* Bulk Mapping Card */}
                    <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Bulk Player Mapping
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          Run the initial mapping process to link NFLverse players
                          with Sleeper players. This should be run once to establish
                          the baseline mapping.
                        </p>

                        {isRunning && (
                          <div className="space-y-2">
                            <Progress value={progress} className="w-full h-2" />
                            <p className="text-sm text-muted-foreground">
                              Processing player mappings... {progress}%
                            </p>
                          </div>
                        )}

                        {results && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                              <Badge variant="default" className="text-lg px-3 py-1">{results.exact_matches}</Badge>
                              <p className="text-xs mt-2 font-medium">Exact Matches</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <Badge variant="secondary" className="text-lg px-3 py-1">
                                {results.fuzzy_matches}
                              </Badge>
                              <p className="text-xs mt-2 font-medium">Fuzzy Matches</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                              <Badge variant="outline" className="text-lg px-3 py-1">
                                {results.manual_review_needed}
                              </Badge>
                              <p className="text-xs mt-2 font-medium">Need Review</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                              <Badge variant="destructive" className="text-lg px-3 py-1">{results.unmapped}</Badge>
                              <p className="text-xs mt-2 font-medium">Unmapped</p>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={runBulkMapping}
                          disabled={isRunning}
                          className="w-full h-12 text-lg font-semibold rounded-xl"
                        >
                          {isRunning ? (
                            <>
                              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5 mr-2" />
                              Run Bulk Mapping
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Quick Stats Sync Card */}
                    <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          Quick Stats Sync
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          Test the stats sync with specific weeks to verify the
                          mapping system is working.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {QUICK_STATS_WEEKS.map((week) => (
                            <Button
                              key={week}
                              variant="outline"
                              onClick={() => runStatsSync(week)}
                              className="h-12 text-base font-medium rounded-xl"
                            >
                              Week {week}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* System Status Card */}
                    <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-primary" />
                            System Status
                          </div>
                          <div className="flex items-center gap-2">
                            {systemHealth && (
                              <Badge
                                variant={getHealthBadgeVariant(systemHealth.overall)}
                                className="text-xs px-3 py-1"
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
                              className="rounded-xl"
                            >
                              {isLoadingHealth ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Refreshing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Refresh
                                </>
                              )}
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingHealth ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4 animate-spin" />
                                Loading system status...
                              </span>
                              <Badge variant="outline">Checking</Badge>
                            </div>
                          </div>
                        ) : systemHealth ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <span className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Mapping Database
                              </span>
                              <div className="flex items-center gap-2">
                                {getHealthIcon(systemHealth.database.status)}
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
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <span className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Edge Functions
                              </span>
                              <div className="flex items-center gap-2">
                                {getHealthIcon(systemHealth.edgeFunctions.status)}
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
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <span className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                NFLVerse API
                              </span>
                              <div className="flex items-center gap-2">
                                {getHealthIcon(systemHealth.nflverseApi.status)}
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
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <span className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                Sleeper Cache
                              </span>
                              <div className="flex items-center gap-2">
                                {getHealthIcon(systemHealth.sleeperCache.status)}
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
                              <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                Last updated:{" "}
                                {new Date(systemHealth.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                              <span className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                System status unavailable
                              </span>
                              <Badge variant="outline">Unknown</Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "settings" && (
                  <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cog className="h-5 w-5 text-primary" />
                        Mapping Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">
                        Configuration options for the player mapping system.
                      </p>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="font-medium">Fuzzy Match Threshold</span>
                          <Badge variant="outline" className="px-3 py-1">0.8 (80%)</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="font-medium">Auto-create Mappings</span>
                          <Badge variant="default" className="px-3 py-1">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="font-medium">Manual Review Required</span>
                          <Badge variant="secondary" className="px-3 py-1">Low Confidence</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
