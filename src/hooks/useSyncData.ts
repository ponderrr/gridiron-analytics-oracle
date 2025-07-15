import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  createAppError,
  AppError,
  withErrorHandling,
} from "@/lib/errorHandling";

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as Error).message;
  }
  return String(error);
};

/**
 * Represents the result of a sync operation (players or stats).
 * @interface SyncResult
 * @property {boolean} success - Whether the sync was successful.
 * @property {number} [players_added] - Number of players added (if applicable).
 * @property {number} [players_updated] - Number of players updated (if applicable).
 * @property {number} [total_processed] - Total number of items processed.
 * @property {number} [week] - The week number for the sync (if applicable).
 * @property {number} [season] - The season year for the sync (if applicable).
 * @property {number} [players_processed] - Number of players processed (if applicable).
 * @property {number} [stats_updated] - Number of stats updated (if applicable).
 * @property {number} [errors] - Number of errors encountered.
 * @property {string[]} [error_details] - Details of any errors encountered.
 */
export interface SyncResult {
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

/**
 * Represents the state of a sync operation, including loading, result, and error.
 * @interface SyncState
 * @property {boolean} isLoading - Whether the sync is currently loading.
 * @property {SyncResult | null} result - The result of the sync operation, or null if not run.
 * @property {AppError | null} error - Any error encountered during the sync.
 */
export interface SyncState {
  isLoading: boolean;
  result: SyncResult | null;
  error: AppError | null;
}

/**
 * Retry a function up to a specified number of times with delay.
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delayMs Delay between retries in ms
 */
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
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
          error as import("@/lib/errorHandling").AnyAppError
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
            error as import("@/lib/errorHandling").AnyAppError
          ),
        });
        throw error;
      }
    },
    "syncWeeklyStats"
  );

  const syncPlayerStats = withErrorHandling(
    async (week: number, season: number = 2024) => {
      setStatsSyncState({ isLoading: true, result: null, error: null });
      try {
        const { data, error } = await supabase.functions.invoke(
          "sync-player-stats",
          {
            body: { week, season },
          }
        );
        if (error) {
          throw createAppError(
            error.message || "Failed to sync player stats",
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
            "syncPlayerStats",
            error as import("@/lib/errorHandling").AnyAppError
          ),
        });
        throw error;
      }
    },
    "syncPlayerStats"
  );

  const clearPlayerSync = useCallback(() => {
    setPlayerSyncState({ isLoading: false, result: null, error: null });
  }, []);

  const clearStatsSync = useCallback(() => {
    setStatsSyncState({ isLoading: false, result: null, error: null });
  }, []);

  const retrySyncPlayers = useCallback(() => retry(syncPlayers), [syncPlayers]);
  const retrySyncWeeklyStats = useCallback(
    (week: number, season?: number) =>
      retry(() => syncWeeklyStats(week, season)),
    [syncWeeklyStats]
  );
  const retrySyncPlayerStats = useCallback(
    (week: number, season?: number) =>
      retry(() => syncPlayerStats(week, season)),
    [syncPlayerStats]
  );

  /**
   * React hook for syncing player and stats data with the backend via Supabase edge functions.
   *
   * @returns {object} Object containing sync state, sync methods, and clear methods for both players and stats.
   * @property {SyncState} playerSync - State for player sync operations.
   * @property {SyncState} statsSync - State for stats sync operations.
   * @property {() => Promise<SyncResult>} syncPlayers - Trigger a sync of all NFL player data.
   * @property {(week: number, season?: number) => Promise<SyncResult>} syncWeeklyStats - Trigger a sync of weekly stats for a given week and season.
   * @property {(week: number, season?: number) => Promise<SyncResult>} syncPlayerStats - Trigger a sync of player stats for a given week and season.
   * @property {() => void} clearPlayerSync - Clear the player sync state.
   * @property {() => void} clearStatsSync - Clear the stats sync state.
   *
   * @example
   * const {
   *   playerSync,
   *   statsSync,
   *   syncPlayers,
   *   syncWeeklyStats,
   *   syncPlayerStats,
   *   clearPlayerSync,
   *   clearStatsSync
   * } = useSyncData();
   *
   * // To sync players:
   * syncPlayers().then(result => console.log(result));
   *
   * // To sync weekly stats:
   * syncWeeklyStats(1, 2024).then(result => console.log(result));
   */
  return useMemo(
    () => ({
      playerSync: playerSyncState,
      statsSync: statsSyncState,
      syncPlayers,
      syncWeeklyStats,
      syncPlayerStats,
      clearPlayerSync,
      clearStatsSync,
      retrySyncPlayers,
      retrySyncWeeklyStats,
      retrySyncPlayerStats,
    }),
    [
      playerSyncState,
      statsSyncState,
      syncPlayers,
      syncWeeklyStats,
      syncPlayerStats,
      clearPlayerSync,
      clearStatsSync,
      retrySyncPlayers,
      retrySyncWeeklyStats,
      retrySyncPlayerStats,
    ]
  );
};
