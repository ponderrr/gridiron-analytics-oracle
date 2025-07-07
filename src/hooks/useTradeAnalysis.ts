import { useState, useCallback, useMemo } from "react";
import { useRankings } from "@/components/PlayerRankings";
import {
  Player,
  RankedPlayer,
} from "@/components/PlayerRankings/RankingsProvider";

export interface TradePlayer extends Player {
  rank?: number;
  tradeValue: number;
}

export interface TradeAnalysis {
  yourSideValue: number;
  targetSideValue: number;
  valueDifference: number;
  fairness: string;
  recommendation: string;
  winnerSide: "your" | "target" | "neutral";
}

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

export interface UseTradeAnalysisOptions {
  scaling?: PlayerValueScaling;
}

export function useTradeAnalysis(
  options: UseTradeAnalysisOptions = {}
): UseTradeAnalysisResult {
  const { state } = useRankings();
  const [yourPlayers, setYourPlayers] = useState<TradePlayer[]>([]);
  const [targetPlayers, setTargetPlayers] = useState<TradePlayer[]>([]);

  const scaling = options.scaling || "quadratic";

  const maxRank = useMemo(() => {
    return Math.max(state.rankedPlayers.length, 200); // Default to 200 if no rankings
  }, [state.rankedPlayers]);

  const calculatePlayerValue = useCallback(
    (player: Player): number => {
      const rankedPlayer = state.rankedPlayers.find(
        (rp) => rp.player_id === player.id
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
          baseValue = Math.pow(
            maxRank - effectiveRank,
            (scaling as any).factor
          );
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
    [state.rankedPlayers, maxRank, scaling]
  );

  const getTradePlayer = useCallback(
    (player: Player): TradePlayer => {
      const rankedPlayer = state.rankedPlayers.find(
        (rp) => rp.player_id === player.id
      );
      return {
        ...player,
        rank: rankedPlayer?.overall_rank,
        tradeValue: calculatePlayerValue(player),
      };
    },
    [state.rankedPlayers, calculatePlayerValue]
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
