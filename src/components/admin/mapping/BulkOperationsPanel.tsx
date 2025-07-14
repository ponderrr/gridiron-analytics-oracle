import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  Play,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Database,
  BarChart3,
} from "lucide-react";
import { OperationProgressCard } from "./OperationProgressCard";
import { useBulkOperations } from "@/hooks/useBulkOperations";
import { cn } from "@/lib/utils";

export default function BulkOperationsPanel() {
  const { operations, startOperation, systemHealth } = useBulkOperations();
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([
    15, 16, 17, 18,
  ]);

  const handleBulkMapping = async () => {
    await startOperation({
      type: "bulk-mapping",
      endpoint: "bulk-player-mapping",
      payload: { action: "run" },
    });
  };

  const handleStatsSync = async (weeks: number[]) => {
    for (const week of weeks) {
      await startOperation({
        type: "stats-sync",
        endpoint: "sync-weekly-stats",
        payload: { week, season: 2024 },
      });
    }
  };

  const handleSystemHealthCheck = async () => {
    await startOperation({
      type: "system-health",
      endpoint: "system-health-check",
      payload: { action: "check" },
    });
  };

  const getSystemHealthStatus = () => {
    if (!systemHealth) return { status: "unknown", color: "gray" };

    switch (systemHealth.overall) {
      case "healthy":
        return { status: "Healthy", color: "green", icon: CheckCircle };
      case "degraded":
        return { status: "Degraded", color: "yellow", icon: AlertTriangle };
      case "down":
        return { status: "Critical", color: "red", icon: AlertTriangle };
      default:
        return { status: "Unknown", color: "gray", icon: AlertTriangle };
    }
  };

  const healthStatus = getSystemHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bulk Operations</h2>
        <Button onClick={handleSystemHealthCheck} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Check System Health
        </Button>
      </div>

      {/* System Health Overview */}
      <Card
        className={cn(
          "border-l-4",
          healthStatus.color === "green"
            ? "border-green-500"
            : healthStatus.color === "yellow"
              ? "border-yellow-500"
              : healthStatus.color === "red"
                ? "border-red-500"
                : "border-gray-500"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              {HealthIcon && (
                <HealthIcon
                  className={cn(
                    "h-5 w-5",
                    healthStatus.color === "green"
                      ? "text-green-600"
                      : healthStatus.color === "yellow"
                        ? "text-yellow-600"
                        : healthStatus.color === "red"
                          ? "text-red-600"
                          : "text-gray-600"
                  )}
                />
              )}
              <span>System Health</span>
            </CardTitle>
            <Badge
              variant={
                healthStatus.color === "green" ? "default" : "destructive"
              }
            >
              {healthStatus.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {systemHealth && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Database</div>
                <Badge
                  variant={
                    systemHealth.database.status === "healthy"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemHealth.database.status}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Functions</div>
                <Badge
                  variant={
                    systemHealth.edgeFunctions.status === "healthy"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemHealth.edgeFunctions.status}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">NFLVerse</div>
                <Badge
                  variant={
                    systemHealth.nflverseApi.status === "healthy"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemHealth.nflverseApi.status}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Cache</div>
                <Badge
                  variant={
                    systemHealth.sleeperCache.status === "healthy"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemHealth.sleeperCache.status}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Player Mapping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Bulk Player Mapping</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Run the complete player mapping process to match NFLverse players
              with Sleeper players using fuzzy matching algorithms.
            </p>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This operation will process all unmapped players and may take
                10-15 minutes.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleBulkMapping}
              disabled={operations.some(
                (op) => op.type === "bulk-mapping" && op.status === "running"
              )}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Bulk Mapping
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Stats Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Quick Stats Sync</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sync specific weeks of 2024 season stats to test the mapping
              system.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 18].map((week) => (
                <Button
                  key={week}
                  variant={selectedWeeks.includes(week) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedWeeks((prev) =>
                      prev.includes(week)
                        ? prev.filter((w) => w !== week)
                        : [...prev, week]
                    );
                  }}
                >
                  Week {week}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => handleStatsSync(selectedWeeks)}
              disabled={
                selectedWeeks.length === 0 ||
                operations.some(
                  (op) => op.type === "stats-sync" && op.status === "running"
                )
              }
              className="w-full"
              variant="outline"
            >
              <Database className="h-4 w-4 mr-2" />
              Sync Selected Weeks
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Operations */}
      {operations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Operations</h3>
          <div className="space-y-4">
            {operations.map((operation) => (
              <OperationProgressCard key={operation.id} operation={operation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
