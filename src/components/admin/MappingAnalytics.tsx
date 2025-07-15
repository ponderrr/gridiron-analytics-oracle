import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

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
}

interface LowConfidenceMapping {
  canonical_name: string;
  confidence_score: number;
  match_method: string;
  verified: boolean;
  notes?: string;
}

interface MappingAnalyticsError extends Error {
  code?: string;
  status?: number;
}

export default function MappingAnalytics() {
  const [analytics, setAnalytics] = useState<MappingAnalytics | null>(null);
  const [lowConfidence, setLowConfidence] = useState<LowConfidenceMapping[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [lowConfidenceError, setLowConfidenceError] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadAnalytics();
    loadLowConfidenceMappings();
  }, []);

  const loadAnalytics = async () => {
    try {
      setAnalyticsError(null);
      const { data, error } = await supabase.functions.invoke(
        "mapping-analytics",
        {
          body: { report: "summary" },
        }
      );

      if (error) {
        console.error("Failed to load analytics:", error);
        setAnalyticsError(
          "Failed to load analytics data. Please try again later."
        );
        return;
      }

      if (data?.success) {
        setAnalytics(data.data);
      } else {
        setAnalyticsError(
          "Failed to load analytics data. Please try again later."
        );
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setAnalyticsError(
        "An unexpected error occurred while loading analytics data. Please try again later."
      );
    }
  };

  const loadLowConfidenceMappings = async () => {
    try {
      setLowConfidenceError(null);
      const { data, error } = await supabase.functions.invoke(
        "mapping-analytics",
        {
          body: { report: "low-confidence", limit: 10 },
        }
      );

      if (error) {
        console.error("Failed to load low confidence mappings:", error);
        setLowConfidenceError(
          "Failed to load low confidence mappings. Please try again later."
        );
        return;
      }

      if (data?.success) {
        setLowConfidence(data.data);
      } else {
        setLowConfidenceError(
          "Failed to load low confidence mappings. Please try again later."
        );
      }
    } catch (error) {
      console.error("Failed to load low confidence mappings:", error);
      setLowConfidenceError(
        "An unexpected error occurred while loading low confidence mappings. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setAnalyticsError(null);
    setLowConfidenceError(null);
    loadAnalytics();
    loadLowConfidenceMappings();
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" label="Loading analytics..." />
      </div>
    );
  }

  // Show error state if both analytics and low confidence data failed to load
  if (analyticsError && lowConfidenceError && !analytics) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Player Mapping Analytics</h1>
          <Button onClick={handleRefresh} variant="outline">
            Refresh
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {analyticsError} Please try refreshing the page or contact support
            if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Player Mapping Analytics</h1>
          <Button onClick={handleRefresh} variant="outline">
            Refresh
          </Button>
        </div>
        {analyticsError && (
          <Alert variant="destructive">
            <AlertDescription>
              {analyticsError} Please try refreshing the page or contact support
              if the issue persists.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  const mappingSuccessRate = (() => {
    const denominator =
      analytics.total_mappings + analytics.unmapped_players.nflverse;
    return denominator === 0
      ? 0
      : (analytics.total_mappings / denominator) * 100;
  })();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Player Mapping Analytics</h1>
        <Button onClick={handleRefresh} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Error Alerts */}
      {analyticsError && (
        <Alert variant="destructive">
          <AlertDescription>
            {analyticsError} Some data may be incomplete.
          </AlertDescription>
        </Alert>
      )}

      {lowConfidenceError && (
        <Alert variant="destructive">
          <AlertDescription>
            {lowConfidenceError} The low confidence mappings section may not be
            available.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.total_mappings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(mappingSuccessRate)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unmapped Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.unmapped_players.nflverse}
            </div>
            <p className="text-xs text-muted-foreground">Need manual review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.recent_activity.last_7_days}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days ({analytics.recent_activity.last_30_days} in 30 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                analytics.total_mappings === 0
                  ? 0
                  : (analytics.verification_status.verified /
                      analytics.total_mappings) *
                      100
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.verification_status.verified} verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mapping Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.by_method).map(([method, count]) => {
              const percentage =
                analytics.total_mappings === 0
                  ? 0
                  : (count / analytics.total_mappings) * 100;
              return (
                <div key={method} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{method}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.by_confidence).map(([level, count]) => {
              const percentage =
                analytics.total_mappings === 0
                  ? 0
                  : (count / analytics.total_mappings) * 100;
              const variant =
                level === "high"
                  ? "default"
                  : level === "medium"
                    ? "secondary"
                    : "outline";
              return (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{level} Confidence</span>
                    <Badge variant={variant}>{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Low Confidence Mappings */}
      {lowConfidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Confidence Mappings (Need Review)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowConfidence.map((mapping, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{mapping.canonical_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mapping.match_method} •{" "}
                      {Math.round(mapping.confidence_score * 100)}% confidence
                    </p>
                    {mapping.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {mapping.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={mapping.verified ? "default" : "outline"}>
                      {mapping.verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(mapping.confidence_score * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show message when no low confidence mappings are available */}
      {!lowConfidenceError && lowConfidence.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Confidence Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No low confidence mappings found. All mappings appear to have high
              confidence scores.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Wrap export in ErrorBoundary
const MappingAnalyticsWithBoundary = () => (
  <ErrorBoundary>
    <MappingAnalytics />
  </ErrorBoundary>
);
export { MappingAnalyticsWithBoundary as MappingAnalytics };
