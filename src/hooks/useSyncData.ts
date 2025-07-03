import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  createAppError,
  AppError,
  withErrorHandling,
} from "@/lib/errorHandling";

// Utility function to extract error message from unknown error input
const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as Error).message;
  }
  return String(error);
};

interface SyncResult {
  success: boolean;
  players_added?: number;
  players_updated?: number;
  total_processed?: number;
  week?: number;
  season?: number;
  players_processed?: number;
  stats_updated?: number;
  errors?: number;
  error_details?: string[];
}

interface SyncState {
  isLoading: boolean;
  result: SyncResult | null;
  error: AppError | null;
}

export const useSyncData = () => {
  const [playerSyncState, setPlayerSyncState] = useState<SyncState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const [statsSyncState, setStatsSyncState] = useState<SyncState>({
    isLoading: false,
    result: null,
    error: null,
  });

  const syncPlayers = withErrorHandling(async () => {
    setPlayerSyncState({ isLoading: true, result: null, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("sync-nfl-data");
      if (error) {
        throw createAppError(
          error.message || "Failed to sync player data",
          "data",
          error.status
        );
      }
      setPlayerSyncState({
        isLoading: false,
        result: data,
        error: null,
      });
      return data;
    } catch (error) {
      setPlayerSyncState({
        isLoading: false,
        result: null,
        error: createAppError(
          extractErrorMessage(error),
          "data",
          undefined,
          "syncPlayers",
          error
        ),
      });
      throw error;
    }
  }, "syncPlayers");

  const syncWeeklyStats = withErrorHandling(
    async (week: number, season: number = 2024) => {
      setStatsSyncState({ isLoading: true, result: null, error: null });
      try {
        const { data, error } = await supabase.functions.invoke(
          "sync-weekly-stats",
          {
            body: { week, season },
          }
        );
        if (error) {
          throw createAppError(
            error.message || "Failed to sync weekly stats",
            "data",
            error.status
          );
        }
        setStatsSyncState({
          isLoading: false,
          result: data,
          error: null,
        });
        return data;
      } catch (error) {
        setStatsSyncState({
          isLoading: false,
          result: null,
          error: createAppError(
            extractErrorMessage(error),
            "data",
            undefined,
            "syncWeeklyStats",
            error
          ),
        });
        throw error;
      }
    },
    "syncWeeklyStats"
  );

  const clearPlayerSync = useCallback(() => {
    setPlayerSyncState({ isLoading: false, result: null, error: null });
  }, []);

  const clearStatsSync = useCallback(() => {
    setStatsSyncState({ isLoading: false, result: null, error: null });
  }, []);

  return useMemo(
    () => ({
      playerSync: playerSyncState,
      statsSync: statsSyncState,
      syncPlayers,
      syncWeeklyStats,
      clearPlayerSync,
      clearStatsSync,
    }),
    [
      playerSyncState,
      statsSyncState,
      syncPlayers,
      syncWeeklyStats,
      clearPlayerSync,
      clearStatsSync,
    ]
  );
};
