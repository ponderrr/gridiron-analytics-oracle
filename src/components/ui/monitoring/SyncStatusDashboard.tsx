import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SyncLog {
  id: string;
  sync_type: string;
  started_at: string;
  completed_at: string | null;
  success: boolean;
  total_records: number | null;
  processed_records: number | null;
  validation_errors: number | null;
  database_errors: number | null;
  api_errors: number | null;
  duration_ms: number | null;
  error_details: any;
  validation_stats: any;
  performance_metrics: any;
}

const fetchSyncLogs = async (): Promise<SyncLog[]> => {
  const { data, error } = await supabase
    .from("sync_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
};

const SyncStatusDashboard: React.FC = () => {
  const {
    data: syncLogs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["syncLogs"],
    queryFn: fetchSyncLogs,
    staleTime: 60_000, // 1 minute: sync logs update frequently
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (success: boolean, hasErrors: boolean) => {
    if (success) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (hasErrors) return <XCircle className="h-4 w-4 text-red-400" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  };

  const getStatusBadge = (success: boolean, hasErrors: boolean) => {
    if (success)
      return (
        <Badge variant="default" className="bg-green-500/20 text-green-400">
          Success
        </Badge>
      );
    if (hasErrors) return <Badge variant="destructive">Failed</Badge>;
    return (
      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
        Warning
      </Badge>
    );
  };

  const totalErrors = (log: SyncLog) =>
    (log.validation_errors || 0) +
    (log.database_errors || 0) +
    (log.api_errors || 0);

  const successRate =
    syncLogs.length > 0
      ? (syncLogs.filter((log) => log.success).length / syncLogs.length) * 100
      : 0;

  const avgDuration =
    syncLogs.length > 0
      ? syncLogs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) /
        syncLogs.length
      : 0;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-400">
          Error loading sync logs: {String(error)}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {successRate.toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Duration</p>
              <p className="text-2xl font-bold text-blue-400">
                {(avgDuration / 1000).toFixed(1)}s
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Recent Syncs</p>
              <p className="text-2xl font-bold text-slate-300">
                {syncLogs.length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-slate-400" />
          </div>
        </Card>
      </div>

      {/* Recent Sync Operations */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Sync Operations
        </h3>
        <div className="space-y-3">
          {syncLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(log.success, totalErrors(log) > 0)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {log.sync_type.replace("_", " ").toUpperCase()}
                    </span>
                    {getStatusBadge(log.success, totalErrors(log) > 0)}
                  </div>
                  <p className="text-sm text-slate-400">
                    {formatDistanceToNow(new Date(log.started_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-300">
                  {log.processed_records}/{log.total_records} processed
                </div>
                {totalErrors(log) > 0 && (
                  <div className="text-sm text-red-400">
                    {totalErrors(log)} errors
                  </div>
                )}
                {log.duration_ms && (
                  <div className="text-xs text-slate-500">
                    {(log.duration_ms / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            </div>
          ))}

          {syncLogs.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No sync operations recorded yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SyncStatusDashboard;
