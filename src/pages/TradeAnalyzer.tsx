import React from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeftRight,
  Plus,
  X,
  TrendingUp,
  ArrowRight,
  Crown,
  Target,
} from "lucide-react";
import { RankingsProvider, useRankings } from "@/components/PlayerRankings";
import { useTradeAnalysis } from "@/hooks/useTradeAnalysis";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const { ICON_SIZES, TEXT_SIZES, PADDING, GAP } = {
  ICON_SIZES: {
    XL: "h-8 w-8",
    MD: "h-6 w-6",
    SM: "h-5 w-5",
  },
  TEXT_SIZES: {
    FOUR_XL: "text-4xl",
  },
  PADDING: {
    XL: "px-6 py-4",
    LG: "px-4 py-3",
    MD: "px-3 py-2",
    SM: "px-2 py-1",
  },
  GAP: {
    MD: "gap-3",
  },
};

function TradeAnalyzerContent() {
  const { state, selectSet } = useRankings();
  const { effectiveTheme } = useTheme();
  const {
    yourPlayers,
    targetPlayers,
    tradeAnalysis,
    addPlayerToTrade,
    removePlayerFromTrade,
    clearTrade,
    availablePlayers,
    currentSet,
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

  // Add player to trade
  const handleAddPlayer = (player: any, side: "your" | "target") => {
    addPlayerToTrade(player, side);
    toast.success(
      `${player.name} added to ${side === "your" ? "your" : "target"} side.`
    );
  };
  const handleRemovePlayer = (playerId: string, side: "your" | "target") => {
    removePlayerFromTrade(playerId, side);
    toast.success(
      `Player removed from ${side === "your" ? "your" : "target"} side.`
    );
  };
  const handleClearTrade = () => {
    clearTrade();
    toast.info("Trade cleared.");
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xl)",
        }}
      >
        {/* Header with Rankings Selector */}
        <motion.div variants={itemVariants}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "var(--spacing-lg)" }}
          >
            <div>
              <h1
                className={`${TEXT_SIZES.FOUR_XL} font-bold text-primary flex items-center`}
              >
                <ArrowLeftRight
                  className={`${ICON_SIZES.XL} mr-3 text-emerald-400`}
                />
                Trade Analyzer
              </h1>
              <p
                className="text-tertiary"
                style={{ marginTop: "var(--spacing-xs)" }}
              >
                Analyze trades using your personal rankings
              </p>
            </div>

            {/* Rankings Set Selector */}
            <div className="min-w-[200px]">
              <Select
                value={currentSet?.id || ""}
                onValueChange={(value) => selectSet(value)}
              >
                <SelectTrigger className="bg-secondary border border-border">
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
            <div
              className="bg-card border border-border rounded-lg"
              style={{ padding: "var(--spacing-lg)" }}
            >
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-tertiary">Using:</span>
                <span className="font-medium text-primary">
                  {currentSet.name}
                </span>
                <span className="text-tertiary">•</span>
                <span className="text-emerald-400">{currentSet.format}</span>
                <span className="text-tertiary">•</span>
                <span className="text-tertiary">
                  {state.rankedItems.length} ranked players
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Trade Builder */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-xl)",
          }}
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-2"
            style={{ gap: "var(--spacing-xl)" }}
          >
            {/* Your Team */}
            <div
              className="rounded-2xl border border-border bg-card"
              style={{ padding: "var(--spacing-xl)" }}
            >
              <h3
                className="text-lg font-semibold text-primary flex items-center justify-between"
                style={{ marginBottom: "var(--spacing-lg)" }}
              >
                <div className="flex items-center">
                  <TrendingUp
                    className={`${ICON_SIZES.MD} mr-2 text-emerald-400`}
                  />
                  Your Players
                </div>
                {yourPlayers.length > 0 && (
                  <div className="text-sm text-emerald-400 font-medium">
                    Value:{" "}
                    {yourPlayers
                      .reduce((sum, p) => sum + p.tradeValue, 0)
                      .toFixed(0)}
                  </div>
                )}
              </h3>

              <div
                className="space-y-3"
                style={{
                  marginBottom: "var(--spacing-lg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-md)",
                }}
              >
                {yourPlayers.length === 0 ? (
                  <div
                    className="bg-secondary border-2 border-dashed border-border rounded-lg text-center"
                    style={{ padding: "var(--spacing-2xl)" }}
                  >
                    <Plus
                      className={`${ICON_SIZES.XL} text-muted-foreground mx-auto`}
                      style={{ marginBottom: "var(--spacing-sm)" }}
                    />
                    <p className="text-muted-foreground">
                      Select players to trade away
                    </p>
                  </div>
                ) : (
                  yourPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-secondary rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-primary">
                            {player.name}
                          </span>
                          {player.rank && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                              #{player.rank}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-tertiary">
                          {player.position} - {player.team} • Value:{" "}
                          {player.tradeValue.toFixed(0)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.id, "your")}
                        className="text-tertiary hover:text-red-400 transition-colors"
                      >
                        <X className={ICON_SIZES.SM} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-secondary">
                  Available Players
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {availablePlayers.slice(0, 20).map((player) => {
                    const rankedPlayer = state.rankedItems.find(
                      (rp: any) => rp.player_id === player.id
                    );
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleAddPlayer(player, "your")}
                        className="flex items-center justify-between bg-tertiary bg-hover rounded p-2 text-left transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-primary">
                              {player.name}
                            </span>
                            {rankedPlayer && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">
                                #{rankedPlayer.overall_rank}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-tertiary">
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
            <div
              className="rounded-2xl border border-border bg-card"
              style={{ padding: "var(--spacing-xl)" }}
            >
              <h3
                className="text-lg font-semibold text-primary flex items-center justify-between"
                style={{ marginBottom: "var(--spacing-lg)" }}
              >
                <div className="flex items-center">
                  <ArrowRight
                    className={`${ICON_SIZES.MD} mr-2 text-blue-400`}
                  />
                  Players to Receive
                </div>
                {targetPlayers.length > 0 && (
                  <div className="text-sm text-blue-400 font-medium">
                    Value:{" "}
                    {targetPlayers
                      .reduce((sum, p) => sum + p.tradeValue, 0)
                      .toFixed(0)}
                  </div>
                )}
              </h3>

              <div
                className="space-y-3"
                style={{
                  marginBottom: "var(--spacing-lg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-md)",
                }}
              >
                {targetPlayers.length === 0 ? (
                  <div
                    className="bg-secondary border-2 border-dashed border-border rounded-lg text-center"
                    style={{ padding: "var(--spacing-2xl)" }}
                  >
                    <Plus
                      className={`${ICON_SIZES.XL} text-muted-foreground mx-auto`}
                      style={{ marginBottom: "var(--spacing-sm)" }}
                    />
                    <p className="text-muted-foreground">
                      Select players to acquire
                    </p>
                  </div>
                ) : (
                  targetPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-secondary rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-primary">
                            {player.name}
                          </span>
                          {player.rank && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              #{player.rank}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-tertiary">
                          {player.position} - {player.team} • Value:{" "}
                          {player.tradeValue.toFixed(0)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.id, "target")}
                        className="text-tertiary hover:text-red-400 transition-colors"
                      >
                        <X className={ICON_SIZES.SM} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-secondary">
                  Available Players
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {availablePlayers.slice(0, 20).map((player) => {
                    const rankedPlayer = state.rankedItems.find(
                      (rp: any) => rp.player_id === player.id
                    );
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleAddPlayer(player, "target")}
                        className="flex items-center justify-between bg-tertiary bg-hover rounded p-2 text-left transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-primary">
                              {player.name}
                            </span>
                            {rankedPlayer && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">
                                #{rankedPlayer.overall_rank}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-tertiary">
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
                onClick={handleClearTrade}
                variant="outline"
                className="border border-border text-tertiary hover:text-primary"
              >
                Clear Trade
              </Button>
            </div>
          )}
        </motion.div>

        {/* Trade Analysis Results */}
        {tradeAnalysis && (
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-border p-6 bg-card">
              <div className="space-y-6">
                <div className="text-center text-primary rounded-xl">
                  <div className="text-3xl font-bold mb-2 text-emerald-400">
                    {tradeAnalysis.fairness}
                  </div>
                  <div className="text-xl text-primary mb-4">
                    {tradeAnalysis.recommendation}
                  </div>
                  <div className="text-sm text-tertiary">
                    Value difference:{" "}
                    {Math.abs(tradeAnalysis.valueDifference).toFixed(0)} points
                  </div>
                </div>

                <div className={`grid grid-cols-2 ${GAP.MD}`}>
                  <div className="bg-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-tertiary">Your Side Value</span>
                      <span className="font-medium text-emerald-400">
                        {tradeAnalysis.yourSideValue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-tertiary">Their Side Value</span>
                      <span className="font-medium text-secondary">
                        {tradeAnalysis.targetSideValue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {tradeAnalysis.winnerSide !== "neutral" && (
                  <div className="rounded-lg border-2 text-emerald-400/30">
                    <div className="flex items-center space-x-2">
                      {tradeAnalysis.winnerSide === "your" ? (
                        <Crown className="text-emerald-400" size={20} />
                      ) : (
                        <Target className="text-red-400" size={20} />
                      )}
                      <span className="font-medium text-emerald-400">
                        {tradeAnalysis.winnerSide === "your"
                          ? "You win this trade!"
                          : "They win this trade!"}
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
