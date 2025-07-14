import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkOperation {
  id: string;
  type: "bulk-mapping" | "stats-sync" | "system-health";
  status: "idle" | "running" | "completed" | "failed";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  results?: any;
  logs: Array<{
    timestamp: string;
    level: "info" | "warning" | "error";
    message: string;
  }>;
}

interface OperationProgressCardProps {
  operation: BulkOperation;
}

export function OperationProgressCard({
  operation,
}: OperationProgressCardProps) {
  const [showLogs, setShowLogs] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "running":
        return {
          icon: RotateCcw,
          color: "text-blue-600",
          variant: "default" as const,
          bgColor: "bg-blue-50",
        };
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          variant: "default" as const,
          bgColor: "bg-green-50",
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-600",
          variant: "destructive" as const,
          bgColor: "bg-red-50",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
          variant: "outline" as const,
          bgColor: "bg-gray-50",
        };
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "border-red-500 text-red-700 bg-red-50";
      case "warning":
        return "border-yellow-500 text-yellow-700 bg-yellow-50";
      case "info":
        return "border-blue-500 text-blue-700 bg-blue-50";
      default:
        return "border-gray-500 text-gray-700 bg-gray-50";
    }
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return "-";
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const statusConfig = getStatusConfig(operation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={cn("transition-all duration-200", statusConfig.bgColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2">
            <StatusIcon
              className={cn(
                "h-4 w-4",
                statusConfig.color,
                operation.status === "running" && "animate-spin"
              )}
            />
            <span className="capitalize font-medium">
              {operation.type.replace("-", " ")}
            </span>
            <Badge variant={statusConfig.variant} className="ml-2">
              {operation.status.toUpperCase()}
            </Badge>
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {formatDuration(operation.startTime, operation.endTime)} elapsed
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-4">
          <Progress value={operation.progress} className="flex-1 h-2" />
          <span className="text-xs font-mono w-12 text-right">
            {operation.progress.toFixed(0)}%
          </span>
        </div>
        {operation.results && (
          <div className="text-xs text-muted-foreground">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(operation.results, null, 2)}
            </pre>
          </div>
        )}
        <Collapsible open={showLogs} onOpenChange={setShowLogs}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-2">
              <ChevronDown
                className={cn(
                  "h-4 w-4 mr-2 transition-transform",
                  showLogs && "rotate-180"
                )}
              />
              {showLogs ? "Hide Logs" : "Show Logs"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-40 mt-2 rounded border bg-background">
              <div className="space-y-1 p-2">
                {operation.logs.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No logs yet
                  </div>
                ) : (
                  operation.logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded px-2 py-1 text-xs border flex items-center space-x-2",
                        getLogLevelColor(log.level)
                      )}
                    >
                      <Terminal className="h-3 w-3 opacity-60" />
                      <span className="font-mono">{log.timestamp}</span>
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
