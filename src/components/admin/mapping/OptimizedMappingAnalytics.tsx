import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DistributionChart } from "./charts/DistributionChart";

interface MappingAnalytics {
  total_mappings: number;
  by_method: {
    exact: number;
    fuzzy: number;
    manual: number;
    community: number;
  };
  by_confidence: {
    high: number;
    medium: number;
    low: number;
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
  quality_score?: number;
  system_health?: "healthy" | "warning" | "critical";
}

export default function OptimizedMappingAnalytics() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: analytics,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["mapping-analytics"],
    queryFn: async (): Promise<MappingAnalytics> => {
      const { data, error } = await supabase.functions.invoke(
        "mapping-analytics",
        {
          body: { report: "summary" },
        }
      );

      if (error) throw error;
      return data.data;
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 10000, // 10 seconds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getSystemHealthConfig = (health: string) => {
    switch (health) {
      case "healthy":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
        };
      case "warning":
        return {
          variant: "secondary" as const,
          icon: AlertTriangle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
        };
      case "critical":
        return {
          variant: "destructive" as const,
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
        };
      default:
        return {
          variant: "outline" as const,
          icon: AlertTriangle,
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
        };
    }
  };

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to load analytics</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!analytics) return null;

  const healthConfig = getSystemHealthConfig(
    analytics.system_health || "unknown"
  );
  const HealthIcon = healthConfig.icon;
  const mappingCoverage =
    analytics.total_mappings + analytics.unmapped_players.nflverse === 0
      ? 0
      : (analytics.total_mappings /
          (analytics.total_mappings + analytics.unmapped_players.nflverse)) *
        100;
  const highConfidenceRate =
    analytics.total_mappings === 0
      ? 0
      : (analytics.by_confidence.high / analytics.total_mappings) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mapping Analytics</h2>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* System Health */}
        <Card className={`border-l-4 ${healthConfig.bgColor}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <HealthIcon className={`h-5 w-5 ${healthConfig.color}`} />
              <CardTitle className="text-base">System Health</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={healthConfig.variant} className="text-sm">
                {analytics.system_health?.toUpperCase() || "UNKNOWN"}
              </Badge>
              {analytics.quality_score && (
                <div className="text-sm text-muted-foreground">
                  Quality Score: {analytics.quality_score}/100
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mapping Coverage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mapping Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {mappingCoverage.toFixed(1)}%
                </span>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={mappingCoverage} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {analytics.total_mappings} mapped /{" "}
                {analytics.unmapped_players.nflverse} unmapped
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Confidence Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">High Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {highConfidenceRate.toFixed(1)}%
                </span>
                <Badge
                  variant={highConfidenceRate > 80 ? "default" : "secondary"}
                >
                  {analytics.by_confidence.high} mappings
                </Badge>
              </div>
              <Progress value={highConfidenceRate} className="h-2" />
              <div className="text-sm text-muted-foreground">
                Target: &gt;80% high confidence
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Mapping Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionChart
              data={analytics.by_method}
              total={analytics.total_mappings}
              colors={{
                exact: "#10b981", // green
                fuzzy: "#3b82f6", // blue
                manual: "#f59e0b", // yellow
                community: "#8b5cf6", // purple
              }}
            />
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Confidence Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.by_confidence).map(([level, count]) => {
                const percentage =
                  analytics.total_mappings === 0
                    ? 0
                    : (count / analytics.total_mappings) * 100;
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">
                        {level} Confidence
                      </span>
                      <span>
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Verification Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.recent_activity.last_7_days}
                </div>
                <div className="text-sm text-blue-600">Last 7 Days</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.recent_activity.last_30_days}
                </div>
                <div className="text-sm text-green-600">Last 30 Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verified</span>
                <Badge variant="default">
                  {analytics.verification_status.verified}
                </Badge>
              </div>
              <Progress
                value={
                  analytics.total_mappings > 0
                    ? (analytics.verification_status.verified /
                        analytics.total_mappings) *
                      100
                    : 0
                }
                className="h-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unverified</span>
                <Badge variant="secondary">
                  {analytics.verification_status.unverified}
                </Badge>
              </div>
              <Progress
                value={
                  analytics.total_mappings > 0
                    ? (analytics.verification_status.unverified /
                        analytics.total_mappings) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
