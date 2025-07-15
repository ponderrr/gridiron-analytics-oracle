import { useState, useCallback, useMemo } from "react";
import { useRankings } from "@/components/PlayerRankings";
import { Player } from "@/components/PlayerRankings/RankingsProvider";
import type { RankedItem } from "@/components/PlayerRankings/RankingsProvider";

export interface TradePlayer extends Player {
  rank?: number;
  tradeValue: number;
}

/**
 * Represents the result of a trade analysis between two sides.
 * @typedef {object} TradeAnalysis
 * @property {number} yourSideValue - Total trade value of your side.
 * @property {number} targetSideValue - Total trade value of the target side.
 * @property {number} valueDifference - Difference in trade value (target - your).
 * @property {string} fairness - Qualitative fairness assessment (e.g., 'Very Fair').
 * @property {string} recommendation - Suggested action based on fairness.
 * @property {('your'|'target'|'neutral')} winnerSide - Which side is favored by the trade.
 */
export interface TradeAnalysis {
  yourSideValue: number;
  targetSideValue: number;
  valueDifference: number;
  fairness: string;
  recommendation: string;
  winnerSide: "your" | "target" | "neutral";
}

/**
 * The result object returned by useTradeAnalysis, containing state and trade manipulation methods.
 * @typedef {object} UseTradeAnalysisResult
 * @property {TradePlayer[]} yourPlayers - Players on your side of the trade.
 * @property {TradePlayer[]} targetPlayers - Players on the target side of the trade.
 * @property {TradeAnalysis | null} tradeAnalysis - The current trade analysis result, or null if incomplete.
 * @property {(player: Player, side: 'your' | 'target') => void} addPlayerToTrade - Add a player to a trade side.
 * @property {(playerId: string, side: 'your' | 'target') => void} removePlayerFromTrade - Remove a player from a trade side.
 * @property {() => void} clearTrade - Clear all players from both sides of the trade.
 * @property {Player[]} availablePlayers - All available players for trade.
 * @property {RankingSet | null} currentSet - The current ranking set in use.
 * @property {number} maxRank - The maximum rank value used for value calculations.
 */
export interface UseTradeAnalysisResult {
  yourPlayers: TradePlayer[];
  targetPlayers: TradePlayer[];
  tradeAnalysis: TradeAnalysis | null;
  addPlayerToTrade: (player: Player, side: "your" | "target") => void;
  removePlayerFromTrade: (playerId: string, side: "your" | "target") => void;
  clearTrade: () => void;
  availablePlayers: Player[];
  currentSet:
    | import("@/components/PlayerRankings/RankingsProvider").RankingSet
    | null;
  maxRank: number;
}

// Position scarcity multipliers
const POSITION_MULTIPLIERS = {
  QB: 1.0,
  RB: 1.3,
  WR: 1.1,
  TE: 1.2,
  K: 0.8,
  "D/ST": 0.9,
};

export const FAIRNESS_THRESHOLDS = {
  VERY_FAIR: 10, // percent
  FAIR: 25, // percent
};

export type PlayerValueScaling =
  | "quadratic"
  | "linear"
  | "logarithmic"
  | { type: "custom"; factor: number };

/**
 * Options for configuring the player value scaling in useTradeAnalysis.
 * @typedef {object} UseTradeAnalysisOptions
 * @property {PlayerValueScaling} [scaling] - The scaling method for player value calculation.
 */
export interface UseTradeAnalysisOptions {
  scaling?: PlayerValueScaling;
}

function isCustomScaling(
  scaling: PlayerValueScaling
): scaling is { type: "custom"; factor: number } {
  return (
    typeof scaling === "object" &&
    scaling.type === "custom" &&
    typeof scaling.factor === "number"
  );
}

/**
 * React hook for analyzing fantasy football trades between two sides using player rankings and value scaling.
 *
 * @param {UseTradeAnalysisOptions} [options] - Optional configuration for value scaling.
 * @returns {UseTradeAnalysisResult} Object containing trade state, analysis, and manipulation methods.
 *
 * @example
 * const {
 *   yourPlayers,
 *   targetPlayers,
 *   tradeAnalysis,
 *   addPlayerToTrade,
 *   removePlayerFromTrade,
 *   clearTrade,
 *   availablePlayers,
 *   currentSet,
 *   maxRank
 * } = useTradeAnalysis({ scaling: 'quadratic' });
 *
 * addPlayerToTrade(player, 'your');
 * addPlayerToTrade(targetPlayer, 'target');
 * // ...
 * if (tradeAnalysis) {
 *   console.log(tradeAnalysis.fairness, tradeAnalysis.recommendation);
 * }
 */
export function useTradeAnalysis(
  options: UseTradeAnalysisOptions = {}
): UseTradeAnalysisResult {
  const { state } = useRankings();
  const [yourPlayers, setYourPlayers] = useState<TradePlayer[]>([]);
  const [targetPlayers, setTargetPlayers] = useState<TradePlayer[]>([]);

  const scaling = options.scaling || "quadratic";

  const maxRank = useMemo(() => {
    return Math.max(state.rankedItems.length, 200); // Default to 200 if no rankings
  }, [state.rankedItems]);

  const calculatePlayerValue = useCallback(
    (player: Player): number => {
      const rankedPlayer = state.rankedItems.find(
        (rp: RankedItem) => rp.player_id === player.id
      );
      const rank = rankedPlayer?.overall_rank;

      let baseValue: number;
      let effectiveRank = rank ?? maxRank + 50;
      switch (typeof scaling === "string" ? scaling : scaling.type) {
        case "linear":
          baseValue = maxRank - effectiveRank;
          break;
        case "logarithmic":
          baseValue = Math.log2(Math.max(1, maxRank - effectiveRank + 1));
          break;
        case "custom":
          baseValue = isCustomScaling(scaling)
            ? Math.pow(maxRank - effectiveRank, scaling.factor)
            : maxRank - effectiveRank;
          break;
        case "quadratic":
        default:
          baseValue = Math.pow(maxRank - effectiveRank, 2);
          break;
      }
      const multiplier =
        POSITION_MULTIPLIERS[
          player.position as keyof typeof POSITION_MULTIPLIERS
        ] || 1.0;
      return Math.max(baseValue * multiplier, 1); // Minimum value of 1
    },
    [state.rankedItems, maxRank, scaling]
  );

  const getTradePlayer = useCallback(
    (player: Player): TradePlayer => {
      const rankedPlayer = state.rankedItems.find(
        (rp: RankedItem) => rp.player_id === player.id
      );
      return {
        ...player,
        rank: rankedPlayer?.overall_rank,
        tradeValue: calculatePlayerValue(player),
      };
    },
    [state.rankedItems, calculatePlayerValue]
  );

  const addPlayerToTrade = useCallback(
    (player: Player, side: "your" | "target") => {
      const tradePlayer = getTradePlayer(player);

      if (side === "your") {
        setYourPlayers((prev) => [...prev, tradePlayer]);
      } else {
        setTargetPlayers((prev) => [...prev, tradePlayer]);
      }
    },
    [getTradePlayer]
  );

  const removePlayerFromTrade = useCallback(
    (playerId: string, side: "your" | "target") => {
      if (side === "your") {
        setYourPlayers((prev) => prev.filter((p) => p.id !== playerId));
      } else {
        setTargetPlayers((prev) => prev.filter((p) => p.id !== playerId));
      }
    },
    []
  );

  const clearTrade = useCallback(() => {
    setYourPlayers([]);
    setTargetPlayers([]);
  }, []);

  const tradeAnalysis = useMemo((): TradeAnalysis | null => {
    if (yourPlayers.length === 0 || targetPlayers.length === 0) {
      return null;
    }

    const yourSideValue = yourPlayers.reduce(
      (sum, player) => sum + player.tradeValue,
      0
    );
    const targetSideValue = targetPlayers.reduce(
      (sum, player) => sum + player.tradeValue,
      0
    );
    const valueDifference = targetSideValue - yourSideValue;
    const percentageDiff =
      (Math.abs(valueDifference) / Math.max(yourSideValue, targetSideValue)) *
      100;

    let fairness: string;
    let recommendation: string;
    let winnerSide: "your" | "target" | "neutral";

    if (percentageDiff < FAIRNESS_THRESHOLDS.VERY_FAIR) {
      fairness = "Very Fair";
      recommendation = "Good Trade";
      winnerSide = "neutral";
    } else if (percentageDiff < FAIRNESS_THRESHOLDS.FAIR) {
      fairness = "Fair";
      if (valueDifference > 0) {
        recommendation = "Accept Trade";
        winnerSide = "your";
      } else {
        recommendation = "Consider Rejecting";
        winnerSide = "target";
      }
    } else {
      fairness =
        valueDifference > 0 ? "Heavily Favors You" : "Heavily Favors Them";
      recommendation =
        valueDifference > 0 ? "Accept Immediately" : "Reject Trade";
      winnerSide = valueDifference > 0 ? "your" : "target";
    }

    return {
      yourSideValue,
      targetSideValue,
      valueDifference,
      fairness,
      recommendation,
      winnerSide,
    };
  }, [yourPlayers, targetPlayers]);

  return {
    yourPlayers,
    targetPlayers,
    tradeAnalysis,
    addPlayerToTrade,
    removePlayerFromTrade,
    clearTrade,
    availablePlayers: state.availablePlayers,
    currentSet: state.currentSet,
    maxRank,
  };
}
