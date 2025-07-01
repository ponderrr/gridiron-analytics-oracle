import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  error: string | null;
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

  const syncPlayers = async () => {
    setPlayerSyncState({ isLoading: true, result: null, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('sync-nfl-data');
      
      if (error) {
        throw new Error(error.message || 'Failed to sync player data');
      }

      setPlayerSyncState({
        isLoading: false,
        result: data,
        error: null,
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPlayerSyncState({
        isLoading: false,
        result: null,
        error: errorMessage,
      });
      throw error;
    }
  };

  const syncWeeklyStats = async (week: number, season: number = 2024) => {
    setStatsSyncState({ isLoading: true, result: null, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('sync-weekly-stats', {
        body: { week, season }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to sync weekly stats');
      }

      setStatsSyncState({
        isLoading: false,
        result: data,
        error: null,
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatsSyncState({
        isLoading: false,
        result: null,
        error: errorMessage,
      });
      throw error;
    }
  };

  const clearPlayerSync = () => {
    setPlayerSyncState({ isLoading: false, result: null, error: null });
  };

  const clearStatsSync = () => {
    setStatsSyncState({ isLoading: false, result: null, error: null });
  };

  return {
    playerSync: playerSyncState,
    statsSync: statsSyncState,
    syncPlayers,
    syncWeeklyStats,
    clearPlayerSync,
    clearStatsSync,
  };
};