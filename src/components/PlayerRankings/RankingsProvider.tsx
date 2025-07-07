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
import { Player as DatabasePlayer, DraftPick } from "@/lib/database";

// Re-export for compatibility
export type { Player } from "@/lib/database";
export type { DraftPick } from "@/lib/database";

// Legacy interface for backward compatibility
export interface RankedPlayer {
  player_id: string;
  overall_rank: number;
  tier?: number;
  notes?: string;
  player: DatabasePlayer;
}

export interface RankedItem {
  id: string;
  type: "player" | "pick";
  player_id?: string;
  pick_id?: string;
  overall_rank: number;
  tier?: number;
  notes?: string;
  player?: DatabasePlayer;
  pick?: DraftPick;
}

export interface RankingSet {
  id: string;
  name: string;
  format: "dynasty" | "redraft";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rankings?: RankedItem[];
}

interface RankingsState {
  sets: RankingSet[];
  currentSet: RankingSet | null;
  availablePlayers: DatabasePlayer[];
  availablePicks: DraftPick[];
  rankedItems: RankedItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  searchTerm: string;
  positionFilter: string;
  teamFilter: string;
  yearFilter: string;
  roundFilter: string;
  showOnlyUnranked: boolean;
  showPlayers: boolean;
  showPicks: boolean;
  undoStack: RankedItem[][];
  redoStack: RankedItem[][];
}

type RankingsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SETS"; payload: RankingSet[] }
  | { type: "SET_CURRENT_SET"; payload: RankingSet | null }
  | { type: "SET_AVAILABLE_PLAYERS"; payload: DatabasePlayer[] }
  | { type: "SET_AVAILABLE_PICKS"; payload: DraftPick[] }
  | { type: "SET_RANKED_ITEMS"; payload: RankedItem[] }
  | {
      type: "ADD_RANKED_ITEM";
      payload: {
        item: DatabasePlayer | DraftPick;
        type: "player" | "pick";
        rank: number;
      };
    }
  | { type: "REMOVE_RANKED_ITEM"; payload: string }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_POSITION_FILTER"; payload: string }
  | { type: "SET_TEAM_FILTER"; payload: string }
  | { type: "SET_YEAR_FILTER"; payload: string }
  | { type: "SET_ROUND_FILTER"; payload: string }
  | { type: "SET_SHOW_ONLY_UNRANKED"; payload: boolean }
  | { type: "SET_SHOW_PLAYERS"; payload: boolean }
  | { type: "SET_SHOW_PICKS"; payload: boolean }
  | { type: "PUSH_UNDO"; payload: RankedItem[] }
  | { type: "UNDO" }
  | { type: "REDO" };

const initialState: RankingsState = {
  sets: [],
  currentSet: null,
  availablePlayers: [],
  availablePicks: [],
  rankedItems: [],
  loading: false,
  saving: false,
  error: null,
  searchTerm: "",
  positionFilter: "all",
  teamFilter: "all",
  yearFilter: "all",
  roundFilter: "all",
  showOnlyUnranked: false,
  showPlayers: true,
  showPicks: true,
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
        rankedItems: previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [state.rankedItems, ...state.redoStack.slice(0, 9)],
      };
    }
    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[0];
      return {
        ...state,
        rankedItems: nextState,
        undoStack: [...state.undoStack, state.rankedItems],
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
    case "SET_YEAR_FILTER":
      return { ...state, yearFilter: action.payload };
    case "SET_ROUND_FILTER":
      return { ...state, roundFilter: action.payload };
    case "SET_SHOW_ONLY_UNRANKED":
      return { ...state, showOnlyUnranked: action.payload };
    case "SET_SHOW_PLAYERS":
      return { ...state, showPlayers: action.payload };
    case "SET_SHOW_PICKS":
      return { ...state, showPicks: action.payload };
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
    case "SET_AVAILABLE_PICKS":
      return { ...state, availablePicks: action.payload };
    case "SET_RANKED_ITEMS": {
      return { ...state, rankedItems: action.payload };
    }
    case "ADD_RANKED_ITEM": {
      const newRanked = [...state.rankedItems];
      const insertIndex = action.payload.rank - 1;
      newRanked.forEach((item) => {
        if (item.overall_rank >= action.payload.rank) {
          item.overall_rank += 1;
        }
      });

      const newItem: RankedItem = {
        id: action.payload.item.id,
        type: action.payload.type,
        overall_rank: action.payload.rank,
        ...(action.payload.type === "player"
          ? {
              player_id: action.payload.item.id,
              player: action.payload.item as DatabasePlayer,
            }
          : {
              pick_id: action.payload.item.id,
              pick: action.payload.item as DraftPick,
            }),
      };

      newRanked.splice(insertIndex, 0, newItem);
      const sortedItems = newRanked.sort(
        (a, b) => a.overall_rank - b.overall_rank
      );

      return { ...state, rankedItems: sortedItems };
    }
    case "REMOVE_RANKED_ITEM": {
      const filtered = state.rankedItems.filter(
        (item) => item.id !== action.payload
      );
      filtered.forEach((item, index) => {
        item.overall_rank = index + 1;
      });

      return { ...state, rankedItems: filtered };
    }
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

/**
 * Context type for rankings state and actions.
 * @typedef {object} RankingsContextType
 * @property {RankingsState} state - The current rankings state.
 * @property {React.Dispatch<RankingsAction>} dispatch - Dispatch function for rankings actions.
 * @property {() => Promise<void>} fetchSets - Fetch all ranking sets from the backend.
 * @property {(name: string, format: 'dynasty' | 'redraft', copyFromSetId?: string) => Promise<void>} createSet - Create a new ranking set.
 * @property {(setId: string) => Promise<void>} selectSet - Select a ranking set by ID.
 * @property {() => Promise<void>} saveRankings - Save the current rankings to the backend.
 * @property {() => Promise<void>} createDefaultRankings - Create default rankings for the current set.
 * @property {() => Promise<void>} fetchPlayers - Fetch all available players.
 * @property {() => Promise<void>} fetchPicks - Fetch all available draft picks.
 * @property {(DatabasePlayer | DraftPick)[]} filteredAvailableItems - Filtered list of available items (players and picks).
 * @property {() => (DatabasePlayer | DraftPick)[]} getFilteredAvailableItems - Get the filtered available items.
 * @property {DatabasePlayer[]} filteredAvailablePlayers - Filtered list of available players (legacy).
 * @property {() => DatabasePlayer[]} getFilteredAvailablePlayers - Get the filtered available players (legacy).
 */
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
  fetchPicks: () => Promise<void>;
  filteredAvailableItems: (DatabasePlayer | DraftPick)[];
  getFilteredAvailableItems: () => (DatabasePlayer | DraftPick)[];
  // Legacy methods for backward compatibility
  filteredAvailablePlayers: DatabasePlayer[];
  getFilteredAvailablePlayers: () => DatabasePlayer[];
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
        type: "SET_RANKED_ITEMS",
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
      const rankings = state.rankedItems.map((item) => ({
        playerId: item.type === "player" ? item.player_id : null,
        pickId: item.type === "pick" ? item.pick_id : null,
        overallRank: item.overall_rank,
        tier: item.tier,
        notes: item.notes,
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
  }, [state.currentSet, state.rankedItems]);

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
      dispatch({
        type: "SET_AVAILABLE_PLAYERS",
        payload: (data || []).map((player) => ({
          ...player,
          metadata:
            typeof player.metadata === "string"
              ? JSON.parse(player.metadata)
              : player.metadata,
        })),
      });
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to fetch players");
    }
  }, []);

  const fetchPicks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("draft_picks")
        .select("*")
        .order("year")
        .order("overall_pick");

      if (error) throw error;
      dispatch({ type: "SET_AVAILABLE_PICKS", payload: data || [] });
    } catch (error) {
      console.error("Error fetching draft picks:", error);
      toast.error("Failed to fetch draft picks");
    }
  }, []);

  const filteredAvailableItems = useMemo(() => {
    const rankedItemIds = new Set(state.rankedItems.map((item) => item.id));
    const items: (DatabasePlayer | DraftPick)[] = [];

    // Add players if enabled
    if (state.showPlayers) {
      const filteredPlayers = state.availablePlayers.filter((player) => {
        if (state.showOnlyUnranked && rankedItemIds.has(player.id))
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
      items.push(...filteredPlayers);
    }

    // Add picks if enabled
    if (state.showPicks) {
      const filteredPicks = state.availablePicks.filter((pick) => {
        if (state.showOnlyUnranked && rankedItemIds.has(pick.id)) return false;
        if (
          state.yearFilter !== "all" &&
          pick.year.toString() !== state.yearFilter
        )
          return false;
        if (
          state.roundFilter !== "all" &&
          pick.round.toString() !== state.roundFilter
        )
          return false;
        if (state.searchTerm) {
          const pickDisplay = `${pick.year} ${pick.round}.${pick.pick.toString().padStart(2, "0")}`;
          if (
            !pickDisplay.toLowerCase().includes(state.searchTerm.toLowerCase())
          )
            return false;
        }
        return true;
      });
      items.push(...filteredPicks);
    }

    return items;
  }, [
    state.availablePlayers,
    state.availablePicks,
    state.rankedItems,
    state.showOnlyUnranked,
    state.showPlayers,
    state.showPicks,
    state.positionFilter,
    state.teamFilter,
    state.yearFilter,
    state.roundFilter,
    state.searchTerm,
  ]);

  const getFilteredAvailableItems = useCallback(
    () => filteredAvailableItems,
    [filteredAvailableItems]
  );

  // Legacy compatibility - filtered players only
  const filteredAvailablePlayers = useMemo(() => {
    const rankedPlayerIds = new Set(
      state.rankedItems.map((item) => item.player_id)
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
    state.rankedItems,
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
    fetchPicks();
  }, [fetchSets, fetchPlayers, fetchPicks]);

  const contextValue: RankingsContextType = {
    state,
    dispatch,
    fetchSets,
    createSet,
    selectSet,
    saveRankings,
    createDefaultRankings,
    fetchPlayers,
    fetchPicks,
    filteredAvailableItems,
    getFilteredAvailableItems,
    filteredAvailablePlayers,
    getFilteredAvailablePlayers,
  };

  return (
    <RankingsContext.Provider value={contextValue}>
      {children}
    </RankingsContext.Provider>
  );
}

/**
 * React hook to access the rankings context, including state and all ranking-related actions.
 *
 * @returns {RankingsContextType} Rankings context value with state and actions.
 *
 * @throws {Error} If used outside of a RankingsProvider.
 *
 * @example
 * const {
 *   state,
 *   dispatch,
 *   fetchSets,
 *   createSet,
 *   selectSet,
 *   saveRankings,
 *   createDefaultRankings,
 *   fetchPlayers,
 *   fetchPicks,
 *   filteredAvailableItems,
 *   getFilteredAvailableItems,
 *   filteredAvailablePlayers,
 *   getFilteredAvailablePlayers
 * } = useRankings();
 */
export function useRankings() {
  const context = useContext(RankingsContext);
  if (!context) {
    throw new Error("useRankings must be used within a RankingsProvider");
  }
  return context;
}
