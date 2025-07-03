import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  player_id: string;
  active: boolean;
  bye_week?: number;
  fantasy_points?: number;
  season_stats?: {
    passing_yards?: number;
    rushing_yards?: number;
    receiving_yards?: number;
    touchdowns?: number;
  };
}

export interface RankedPlayer {
  player_id: string;
  overall_rank: number;
  tier?: number;
  notes?: string;
  player: Player;
}

export interface RankingSet {
  id: string;
  name: string;
  format: "dynasty" | "redraft";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rankings?: RankedPlayer[];
}

interface RankingsState {
  sets: RankingSet[];
  currentSet: RankingSet | null;
  availablePlayers: Player[];
  rankedPlayers: RankedPlayer[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  searchTerm: string;
  positionFilter: string;
  teamFilter: string;
  showOnlyUnranked: boolean;
  undoStack: RankedPlayer[][];
  redoStack: RankedPlayer[][];
}

type RankingsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SETS"; payload: RankingSet[] }
  | { type: "SET_CURRENT_SET"; payload: RankingSet | null }
  | { type: "SET_AVAILABLE_PLAYERS"; payload: Player[] }
  | { type: "SET_RANKED_PLAYERS"; payload: RankedPlayer[] }
  | { type: "ADD_RANKED_PLAYER"; payload: { player: Player; rank: number } }
  | { type: "REMOVE_RANKED_PLAYER"; payload: string }
  | { type: "REORDER_RANKINGS"; payload: RankedPlayer[] }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_POSITION_FILTER"; payload: string }
  | { type: "SET_TEAM_FILTER"; payload: string }
  | { type: "SET_SHOW_ONLY_UNRANKED"; payload: boolean }
  | { type: "PUSH_UNDO"; payload: RankedPlayer[] }
  | { type: "UNDO" }
  | { type: "REDO" };

const initialState: RankingsState = {
  sets: [],
  currentSet: null,
  availablePlayers: [],
  rankedPlayers: [],
  loading: false,
  saving: false,
  error: null,
  searchTerm: "",
  positionFilter: "all",
  teamFilter: "all",
  showOnlyUnranked: false,
  undoStack: [],
  redoStack: [],
};

function undoRedoReducer(
  state: RankingsState,
  action: RankingsAction
): RankingsState {
  switch (action.type) {
    case "PUSH_UNDO":
      return {
        ...state,
        undoStack: [...state.undoStack.slice(-9), action.payload],
        redoStack: [],
      };
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const previousState = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        rankedPlayers: previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [state.rankedPlayers, ...state.redoStack.slice(0, 9)],
      };
    }
    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[0];
      return {
        ...state,
        rankedPlayers: nextState,
        undoStack: [...state.undoStack, state.rankedPlayers],
        redoStack: state.redoStack.slice(1),
      };
    }
    default:
      return state;
  }
}

function filterReducer(
  state: RankingsState,
  action: RankingsAction
): RankingsState {
  switch (action.type) {
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_POSITION_FILTER":
      return { ...state, positionFilter: action.payload };
    case "SET_TEAM_FILTER":
      return { ...state, teamFilter: action.payload };
    case "SET_SHOW_ONLY_UNRANKED":
      return { ...state, showOnlyUnranked: action.payload };
    default:
      return state;
  }
}

function rankingsCoreReducer(
  state: RankingsState,
  action: RankingsAction
): RankingsState {
  switch (action.type) {
    case "SET_SETS":
      return { ...state, sets: action.payload };
    case "SET_CURRENT_SET":
      return { ...state, currentSet: action.payload };
    case "SET_AVAILABLE_PLAYERS":
      return { ...state, availablePlayers: action.payload };
    case "SET_RANKED_PLAYERS":
      return { ...state, rankedPlayers: action.payload };
    case "ADD_RANKED_PLAYER": {
      const newRanked = [...state.rankedPlayers];
      const insertIndex = action.payload.rank - 1;
      newRanked.forEach((p) => {
        if (p.overall_rank >= action.payload.rank) {
          p.overall_rank += 1;
        }
      });
      newRanked.splice(insertIndex, 0, {
        player_id: action.payload.player.id,
        overall_rank: action.payload.rank,
        player: action.payload.player,
      });
      return {
        ...state,
        rankedPlayers: newRanked.sort(
          (a, b) => a.overall_rank - b.overall_rank
        ),
      };
    }
    case "REMOVE_RANKED_PLAYER": {
      const filtered = state.rankedPlayers.filter(
        (p) => p.player_id !== action.payload
      );
      filtered.forEach((p, index) => {
        p.overall_rank = index + 1;
      });
      return { ...state, rankedPlayers: filtered };
    }
    case "REORDER_RANKINGS":
      return { ...state, rankedPlayers: action.payload };
    default:
      return state;
  }
}

function statusReducer(
  state: RankingsState,
  action: RankingsAction
): RankingsState {
  switch (action.type) {
    case "SET_LOADING":
      if (state.loading === action.payload) return state;
      return { ...state, loading: action.payload };
    case "SET_SAVING":
      if (state.saving === action.payload) return state;
      return { ...state, saving: action.payload };
    case "SET_ERROR":
      if (state.error === action.payload) return state;
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function rankingsReducer(
  state: RankingsState,
  action: RankingsAction
): RankingsState {
  let nextState = state;
  nextState = undoRedoReducer(nextState, action);
  nextState = filterReducer(nextState, action);
  nextState = rankingsCoreReducer(nextState, action);
  nextState = statusReducer(nextState, action);
  return nextState;
}

interface RankingsContextType {
  state: RankingsState;
  dispatch: React.Dispatch<RankingsAction>;
  fetchSets: () => Promise<void>;
  createSet: (
    name: string,
    format: "dynasty" | "redraft",
    copyFromSetId?: string
  ) => Promise<void>;
  selectSet: (setId: string) => Promise<void>;
  saveRankings: () => Promise<void>;
  createDefaultRankings: () => Promise<void>;
  fetchPlayers: () => Promise<void>;
  filteredAvailablePlayers: Player[];
  getFilteredAvailablePlayers: () => Player[];
}

const RankingsContext = createContext<RankingsContextType | null>(null);

export function RankingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rankingsReducer, initialState);

  const fetchSets = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data, error } = await supabase.functions.invoke(
        "rankings-management"
      );

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      dispatch({ type: "SET_SETS", payload: data.data });

      // Set active set as current
      const activeSet = data.data.find((set: RankingSet) => set.is_active);
      if (activeSet) {
        await selectSet(activeSet.id);
      }
    } catch (error) {
      console.error("Error fetching sets:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch ranking sets" });
      toast.error("Failed to fetch ranking sets");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const createSet = useCallback(
    async (
      name: string,
      format: "dynasty" | "redraft",
      copyFromSetId?: string
    ) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const { data, error } = await supabase.functions.invoke(
          "rankings-management",
          {
            body: { name, format, copyFromSetId },
          }
        );

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        await fetchSets();
        await selectSet(data.data.id);
        toast.success("Ranking set created successfully");
      } catch (error) {
        console.error("Error creating set:", error);
        toast.error("Failed to create ranking set");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [fetchSets]
  );

  const selectSet = useCallback(async (setId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data, error } = await supabase.functions.invoke(
        "rankings-management",
        {
          body: { setId },
        }
      );

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      dispatch({ type: "SET_CURRENT_SET", payload: data.data });
      dispatch({
        type: "SET_RANKED_PLAYERS",
        payload: data.data.rankings || [],
      });
    } catch (error) {
      console.error("Error selecting set:", error);
      toast.error("Failed to load ranking set");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const saveRankings = useCallback(async () => {
    if (!state.currentSet) return;

    try {
      dispatch({ type: "SET_SAVING", payload: true });
      const rankings = state.rankedPlayers.map((p) => ({
        playerId: p.player_id,
        overallRank: p.overall_rank,
        tier: p.tier,
        notes: p.notes,
      }));

      const { data, error } = await supabase.functions.invoke(
        "rankings-reorder",
        {
          body: { setId: state.currentSet.id, rankings },
        }
      );

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success("Rankings saved successfully");
    } catch (error) {
      console.error("Error saving rankings:", error);
      toast.error("Failed to save rankings");
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.currentSet, state.rankedPlayers]);

  const createDefaultRankings = useCallback(async () => {
    if (!state.currentSet) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { data, error } = await supabase.functions.invoke(
        "rankings-default",
        {
          body: { setId: state.currentSet.id, replaceExisting: true },
        }
      );

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await selectSet(state.currentSet.id);
      toast.success("Default rankings created");
    } catch (error) {
      console.error("Error creating default rankings:", error);
      toast.error("Failed to create default rankings");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.currentSet, selectSet]);

  const fetchPlayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      dispatch({ type: "SET_AVAILABLE_PLAYERS", payload: data || [] });
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to fetch players");
    }
  }, []);

  const filteredAvailablePlayers = useMemo(() => {
    const rankedPlayerIds = new Set(
      state.rankedPlayers.map((p) => p.player_id)
    );
    return state.availablePlayers.filter((player) => {
      if (state.showOnlyUnranked && rankedPlayerIds.has(player.id))
        return false;
      if (
        state.positionFilter !== "all" &&
        player.position !== state.positionFilter
      )
        return false;
      if (state.teamFilter !== "all" && player.team !== state.teamFilter)
        return false;
      if (
        state.searchTerm &&
        !player.name.toLowerCase().includes(state.searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    state.availablePlayers,
    state.rankedPlayers,
    state.showOnlyUnranked,
    state.positionFilter,
    state.teamFilter,
    state.searchTerm,
  ]);

  const getFilteredAvailablePlayers = useCallback(
    () => filteredAvailablePlayers,
    [filteredAvailablePlayers]
  );

  useEffect(() => {
    fetchSets();
    fetchPlayers();
  }, [fetchSets, fetchPlayers]);

  const contextValue: RankingsContextType = {
    state,
    dispatch,
    fetchSets,
    createSet,
    selectSet,
    saveRankings,
    createDefaultRankings,
    fetchPlayers,
    filteredAvailablePlayers,
    getFilteredAvailablePlayers,
  };

  return (
    <RankingsContext.Provider value={contextValue}>
      {children}
    </RankingsContext.Provider>
  );
}

export function useRankings() {
  const context = useContext(RankingsContext);
  if (!context) {
    throw new Error("useRankings must be used within a RankingsProvider");
  }
  return context;
}
