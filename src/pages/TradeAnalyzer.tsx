import React from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Plus, X, TrendingUp, ArrowRight, Crown, Target } from "lucide-react";
import { THEME_CONSTANTS } from "@/lib/constants";
import { RankingsProvider, useRankings } from "@/components/PlayerRankings";
import { useTradeAnalysis } from "@/hooks/useTradeAnalysis";

const { ICON_SIZES, TEXT_SIZES, PADDING, GAP, SPACING } = THEME_CONSTANTS;

function TradeAnalyzerContent() {
  const { state, fetchSets, selectSet } = useRankings();
  const {
    yourPlayers,
    targetPlayers,
    tradeAnalysis,
    addPlayerToTrade,
    removePlayerFromTrade,
    clearTrade,
    availablePlayers,
    currentSet
  } = useTradeAnalysis();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`max-w-6xl mx-auto space-y-${SPACING.XL}`}
      >
        {/* Header with Rankings Selector */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`${TEXT_SIZES.FOUR_XL} font-bold text-white flex items-center`}>
                <ArrowLeftRight className={`${ICON_SIZES.XL} mr-3 text-emerald-400`} />
                Trade Analyzer
              </h1>
              <p className="text-slate-400 mt-1">
                Analyze trades using your personal rankings
              </p>
            </div>
            
            {/* Rankings Set Selector */}
            <div className="min-w-[200px]">
              <Select
                value={currentSet?.id || ""}
                onValueChange={(value) => selectSet(value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select Rankings" />
                </SelectTrigger>
                <SelectContent>
                  {state.sets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name} ({set.format})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentSet && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-slate-400">Using:</span>
                <span className="text-white font-medium">{currentSet.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-400">{currentSet.format}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{state.rankedPlayers.length} ranked players</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Trade Builder */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className={`grid grid-cols-1 lg:grid-cols-2 ${GAP.XL}`}>
            {/* Your Team */}
            <div className="rounded-2xl border border-slate-800/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className={`${ICON_SIZES.MD} mr-2 text-emerald-400`} />
                  Your Players
                </div>
                {yourPlayers.length > 0 && (
                  <div className="text-sm text-emerald-400 font-medium">
                    Value: {yourPlayers.reduce((sum, p) => sum + p.tradeValue, 0).toFixed(0)}
                  </div>
                )}
              </h3>

              <div className="space-y-3 mb-4">
                {yourPlayers.length === 0 ? (
                  <div className={`bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg ${PADDING.XXL} text-center`}>
                    <Plus className={`${ICON_SIZES.XL} text-slate-500 mx-auto mb-2`} />
                    <p className="text-slate-500">Select players to trade away</p>
                  </div>
                ) : (
                  yourPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-slate-800 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{player.name}</span>
                          {player.rank && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                              #{player.rank}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {player.position} - {player.team} • Value: {player.tradeValue.toFixed(0)}
                        </div>
                      </div>
                      <button
                        onClick={() => removePlayerFromTrade(player.id, "your")}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className={ICON_SIZES.SM} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Available Players</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {availablePlayers.slice(0, 20).map((player) => {
                    const rankedPlayer = state.rankedPlayers.find(rp => rp.player_id === player.id);
                    return (
                      <button
                        key={player.id}
                        onClick={() => addPlayerToTrade(player, "your")}
                        className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 rounded p-2 text-left transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-sm">{player.name}</span>
                            {rankedPlayer && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">
                                #{rankedPlayer.overall_rank}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-xs">
                            {player.position} - {player.team}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trade Target */}
            <div className="rounded-2xl border border-slate-800/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowRight className={`${ICON_SIZES.MD} mr-2 text-blue-400`} />
                  Players to Receive
                </div>
                {targetPlayers.length > 0 && (
                  <div className="text-sm text-blue-400 font-medium">
                    Value: {targetPlayers.reduce((sum, p) => sum + p.tradeValue, 0).toFixed(0)}
                  </div>
                )}
              </h3>

              <div className="space-y-3 mb-4">
                {targetPlayers.length === 0 ? (
                  <div className={`bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg ${PADDING.XXL} text-center`}>
                    <Plus className={`${ICON_SIZES.XL} text-slate-500 mx-auto mb-2`} />
                    <p className="text-slate-500">Select players to acquire</p>
                  </div>
                ) : (
                  targetPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-slate-800 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{player.name}</span>
                          {player.rank && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              #{player.rank}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {player.position} - {player.team} • Value: {player.tradeValue.toFixed(0)}
                        </div>
                      </div>
                      <button
                        onClick={() => removePlayerFromTrade(player.id, "target")}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className={ICON_SIZES.SM} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Available Players</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {availablePlayers.slice(0, 20).map((player) => {
                    const rankedPlayer = state.rankedPlayers.find(rp => rp.player_id === player.id);
                    return (
                      <button
                        key={player.id}
                        onClick={() => addPlayerToTrade(player, "target")}
                        className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 rounded p-2 text-left transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-sm">{player.name}</span>
                            {rankedPlayer && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">
                                #{rankedPlayer.overall_rank}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-xs">
                            {player.position} - {player.team}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Clear Trade Button */}
          {(yourPlayers.length > 0 || targetPlayers.length > 0) && (
            <div className="flex justify-center">
              <Button
                onClick={clearTrade}
                variant="outline"
                className="border-slate-600 text-slate-400 hover:text-white"
              >
                Clear Trade
              </Button>
            </div>
          )}
        </motion.div>

        {/* Trade Analysis Results */}
        {tradeAnalysis && (
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-slate-800/50 p-6">
              <div className="space-y-6">
                <div className={`text-center ${PADDING.XL} bg-slate-800/50 rounded-xl`}>
                  <div className={`text-3xl font-bold mb-2 ${
                    tradeAnalysis.winnerSide === "your" ? "text-emerald-400" :
                    tradeAnalysis.winnerSide === "target" ? "text-red-400" :
                    "text-yellow-400"
                  }`}>
                    {tradeAnalysis.fairness}
                  </div>
                  <div className="text-xl text-white mb-4">
                    {tradeAnalysis.recommendation}
                  </div>
                  <div className="text-sm text-slate-400">
                    Value difference: {Math.abs(tradeAnalysis.valueDifference).toFixed(0)} points
                  </div>
                </div>

                <div className={`grid grid-cols-2 ${GAP.MD}`}>
                  <div className={`bg-slate-800/50 ${PADDING.LG} rounded-lg`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Your Side Value</span>
                      <span className="text-emerald-400 font-medium">
                        {tradeAnalysis.yourSideValue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className={`bg-slate-800/50 ${PADDING.LG} rounded-lg`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Their Side Value</span>
                      <span className="text-blue-400 font-medium">
                        {tradeAnalysis.targetSideValue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {tradeAnalysis.winnerSide !== "neutral" && (
                  <div className={`${PADDING.LG} rounded-lg border-2 ${
                    tradeAnalysis.winnerSide === "your" 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-red-500/10 border-red-500/30"
                  }`}>
                    <div className="flex items-center space-x-2">
                      {tradeAnalysis.winnerSide === "your" ? (
                        <Crown className="text-emerald-400" size={20} />
                      ) : (
                        <Target className="text-red-400" size={20} />
                      )}
                      <span className={`font-medium ${
                        tradeAnalysis.winnerSide === "your" ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {tradeAnalysis.winnerSide === "your" ? "You win this trade!" : "They win this trade!"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}

const TradeAnalyzer: React.FC = () => {
  return (
    <RankingsProvider>
      <TradeAnalyzerContent />
    </RankingsProvider>
  );
};

export default TradeAnalyzer;