import { useState, useCallback, useMemo } from "react";
import { useRankings } from "@/components/PlayerRankings";
import { Player, RankedPlayer } from "@/components/PlayerRankings/RankingsProvider";

interface TradePlayer extends Player {
  rank?: number;
  tradeValue: number;
}

interface TradeAnalysis {
  yourSideValue: number;
  targetSideValue: number;
  valueDifference: number;
  fairness: string;
  recommendation: string;
  winnerSide: "your" | "target" | "neutral";
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

export function useTradeAnalysis() {
  const { state } = useRankings();
  const [yourPlayers, setYourPlayers] = useState<TradePlayer[]>([]);
  const [targetPlayers, setTargetPlayers] = useState<TradePlayer[]>([]);

  const maxRank = useMemo(() => {
    return Math.max(state.rankedPlayers.length, 200); // Default to 200 if no rankings
  }, [state.rankedPlayers]);

  const calculatePlayerValue = useCallback((player: Player): number => {
    const rankedPlayer = state.rankedPlayers.find(rp => rp.player_id === player.id);
    const rank = rankedPlayer?.overall_rank;
    
    if (rank) {
      // Value = (MaxRank - PlayerRank)²
      const baseValue = Math.pow(maxRank - rank, 2);
      const multiplier = POSITION_MULTIPLIERS[player.position as keyof typeof POSITION_MULTIPLIERS] || 1.0;
      return baseValue * multiplier;
    } else {
      // Unranked players get default low value based on position
      const defaultRank = maxRank + 50;
      const baseValue = Math.pow(maxRank - defaultRank, 2);
      const multiplier = POSITION_MULTIPLIERS[player.position as keyof typeof POSITION_MULTIPLIERS] || 1.0;
      return Math.max(baseValue * multiplier, 1); // Minimum value of 1
    }
  }, [state.rankedPlayers, maxRank]);

  const getTradePlayer = useCallback((player: Player): TradePlayer => {
    const rankedPlayer = state.rankedPlayers.find(rp => rp.player_id === player.id);
    return {
      ...player,
      rank: rankedPlayer?.overall_rank,
      tradeValue: calculatePlayerValue(player)
    };
  }, [state.rankedPlayers, calculatePlayerValue]);

  const addPlayerToTrade = useCallback((player: Player, side: "your" | "target") => {
    const tradePlayer = getTradePlayer(player);
    
    if (side === "your") {
      setYourPlayers(prev => [...prev, tradePlayer]);
    } else {
      setTargetPlayers(prev => [...prev, tradePlayer]);
    }
  }, [getTradePlayer]);

  const removePlayerFromTrade = useCallback((playerId: string, side: "your" | "target") => {
    if (side === "your") {
      setYourPlayers(prev => prev.filter(p => p.id !== playerId));
    } else {
      setTargetPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  }, []);

  const clearTrade = useCallback(() => {
    setYourPlayers([]);
    setTargetPlayers([]);
  }, []);

  const tradeAnalysis = useMemo((): TradeAnalysis | null => {
    if (yourPlayers.length === 0 || targetPlayers.length === 0) {
      return null;
    }

    const yourSideValue = yourPlayers.reduce((sum, player) => sum + player.tradeValue, 0);
    const targetSideValue = targetPlayers.reduce((sum, player) => sum + player.tradeValue, 0);
    const valueDifference = targetSideValue - yourSideValue;
    const percentageDiff = Math.abs(valueDifference) / Math.max(yourSideValue, targetSideValue) * 100;

    let fairness: string;
    let recommendation: string;
    let winnerSide: "your" | "target" | "neutral";

    if (percentageDiff < 10) {
      fairness = "Very Fair";
      recommendation = "Good Trade";
      winnerSide = "neutral";
    } else if (percentageDiff < 25) {
      fairness = "Fair";
      if (valueDifference > 0) {
        recommendation = "Accept Trade";
        winnerSide = "your";
      } else {
        recommendation = "Consider Rejecting";
        winnerSide = "target";
      }
    } else {
      fairness = valueDifference > 0 ? "Heavily Favors You" : "Heavily Favors Them";
      recommendation = valueDifference > 0 ? "Accept Immediately" : "Reject Trade";
      winnerSide = valueDifference > 0 ? "your" : "target";
    }

    return {
      yourSideValue,
      targetSideValue,
      valueDifference,
      fairness,
      recommendation,
      winnerSide
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
    maxRank
  };
}