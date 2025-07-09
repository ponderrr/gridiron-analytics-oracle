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
import {
  THEME_CONSTANTS,
  getThemeClasses,
  SPACING_SCALE,
} from "@/lib/constants";
import { RankingsProvider, useRankings } from "@/components/PlayerRankings";
import { useTradeAnalysis } from "@/hooks/useTradeAnalysis";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const { ICON_SIZES, TEXT_SIZES, PADDING, GAP } = THEME_CONSTANTS;

function TradeAnalyzerContent() {
  const { state, selectSet } = useRankings();
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);
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
          gap: SPACING_SCALE.xl,
        }}
      >
        {/* Header with Rankings Selector */}
        <motion.div variants={itemVariants}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: SPACING_SCALE.lg }}
          >
            <div>
              <h1
                className={`${TEXT_SIZES.FOUR_XL} font-bold ${themeClasses.TEXT_PRIMARY} flex items-center`}
              >
                <ArrowLeftRight
                  className={`${ICON_SIZES.XL} mr-3 text-emerald-400`}
                />
                Trade Analyzer
              </h1>
              <p
                className={`${themeClasses.TEXT_TERTIARY}`}
                style={{ marginTop: SPACING_SCALE.xs }}
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
                <SelectTrigger
                  className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER}`}
                >
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
              className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} rounded-lg`}
              style={{ padding: SPACING_SCALE.lg }}
            >
              <div className="flex items-center space-x-4 text-sm">
                <span className={themeClasses.TEXT_TERTIARY}>Using:</span>
                <span className={`${themeClasses.TEXT_PRIMARY} font-medium`}>
                  {currentSet.name}
                </span>
                <span className={themeClasses.TEXT_TERTIARY}>•</span>
                <span className="text-emerald-400">{currentSet.format}</span>
                <span className={themeClasses.TEXT_TERTIARY}>•</span>
                <span className={themeClasses.TEXT_TERTIARY}>
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
            gap: SPACING_SCALE.xl,
          }}
        >
          <div
            className={`grid grid-cols-1 lg:grid-cols-2`}
            style={{ gap: SPACING_SCALE.xl }}
          >
            {/* Your Team */}
            <div
              className={`rounded-2xl border ${themeClasses.BORDER} ${themeClasses.BG_CARD}`}
              style={{ padding: SPACING_SCALE.xl }}
            >
              <h3
                className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY} flex items-center justify-between`}
                style={{ marginBottom: SPACING_SCALE.lg }}
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
                  marginBottom: SPACING_SCALE.lg,
                  display: "flex",
                  flexDirection: "column",
                  gap: SPACING_SCALE.md,
                }}
              >
                {yourPlayers.length === 0 ? (
                  <div
                    className={`${themeClasses.BG_SECONDARY} border-2 border-dashed ${themeClasses.BORDER} rounded-lg text-center`}
                    style={{ padding: SPACING_SCALE["2xl"] }}
                  >
                    <Plus
                      className={`${ICON_SIZES.XL} ${themeClasses.TEXT_MUTED} mx-auto`}
                      style={{ marginBottom: SPACING_SCALE.sm }}
                    />
                    <p className={themeClasses.TEXT_MUTED}>
                      Select players to trade away
                    </p>
                  </div>
                ) : (
                  yourPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between ${themeClasses.BG_SECONDARY} rounded-lg p-3`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`${themeClasses.TEXT_PRIMARY} font-medium`}
                          >
                            {player.name}
                          </span>
                          {player.rank && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                              #{player.rank}
                            </span>
                          )}
                        </div>
                        <div
                          className={`${themeClasses.TEXT_TERTIARY} text-xs`}
                        >
                          {player.position} - {player.team} • Value:{" "}
                          {player.tradeValue.toFixed(0)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.id, "your")}
                        className={`${themeClasses.TEXT_TERTIARY} hover:text-red-400 transition-colors`}
                      >
                        <X className={ICON_SIZES.SM} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h4
                  className={`text-sm font-medium ${themeClasses.TEXT_SECONDARY}`}
                >
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
                        className={`flex items-center justify-between ${themeClasses.BG_TERTIARY} ${themeClasses.BG_HOVER} rounded p-2 text-left transition-colors`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`${themeClasses.TEXT_PRIMARY} text-sm`}
                            >
                              {player.name}
                            </span>
                            {rankedPlayer && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">
                                #{rankedPlayer.overall_rank}
                              </span>
                            )}
                          </div>
                          <span
                            className={`${themeClasses.TEXT_TERTIARY} text-xs`}
                          >
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
              className={`rounded-2xl border ${themeClasses.BORDER} ${themeClasses.BG_CARD}`}
              style={{ padding: SPACING_SCALE.xl }}
            >
              <h3
                className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY} flex items-center justify-between`}
                style={{ marginBottom: SPACING_SCALE.lg }}
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
                  marginBottom: SPACING_SCALE.lg,
                  display: "flex",
                  flexDirection: "column",
                  gap: SPACING_SCALE.md,
                }}
              >
                {targetPlayers.length === 0 ? (
                  <div
                    className={`${themeClasses.BG_SECONDARY} border-2 border-dashed ${themeClasses.BORDER} rounded-lg text-center`}
                    style={{ padding: SPACING_SCALE["2xl"] }}
                  >
                    <Plus
                      className={`${ICON_SIZES.XL} ${themeClasses.TEXT_MUTED} mx-auto`}
                      style={{ marginBottom: SPACING_SCALE.sm }}
                    />
                    <p className={themeClasses.TEXT_MUTED}>
                      Select players to acquire
                    </p>
                  </div>
                ) : (
                  targetPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between ${themeClasses.BG_SECONDARY} rounded-lg p-3`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`${themeClasses.TEXT_PRIMARY} font-medium`}
                          >
                            {player.name}
                          </span>
                          {player.rank && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              #{player.rank}
                            </span>
                          )}
                        </div>
                        <div
                          className={`${themeClasses.TEXT_TERTIARY} text-xs`}
                        >
                          {player.position} - {player.team} • Value:{" "}
                          {player.tradeValue.toFixed(0)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.id, "target")}
                        className={`${themeClasses.TEXT_TERTIARY} hover:text-red-400 transition-colors`}
                      >
                        <X className={ICON_SIZES.SM} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h4
                  className={`text-sm font-medium ${themeClasses.TEXT_SECONDARY}`}
                >
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
                        className={`flex items-center justify-between ${themeClasses.BG_TERTIARY} ${themeClasses.BG_HOVER} rounded p-2 text-left transition-colors`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`${themeClasses.TEXT_PRIMARY} text-sm`}
                            >
                              {player.name}
                            </span>
                            {rankedPlayer && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">
                                #{rankedPlayer.overall_rank}
                              </span>
                            )}
                          </div>
                          <span
                            className={`${themeClasses.TEXT_TERTIARY} text-xs`}
                          >
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
                className={`border ${themeClasses.BORDER} ${themeClasses.TEXT_TERTIARY} hover:${themeClasses.TEXT_PRIMARY}`}
              >
                Clear Trade
              </Button>
            </div>
          )}
        </motion.div>

        {/* Trade Analysis Results */}
        {tradeAnalysis && (
          <motion.div variants={itemVariants}>
            <div
              className={`rounded-2xl border ${themeClasses.BORDER} p-6 ${themeClasses.BG_CARD}`}
            >
              <div className="space-y-6">
                <div
                  className={`text-center ${PADDING.XL} ${themeClasses.BG_SECONDARY} rounded-xl`}
                >
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      tradeAnalysis.winnerSide === "your"
                        ? THEME_CONSTANTS.THEME.COMMON.ACCENT_PRIMARY
                        : tradeAnalysis.winnerSide === "target"
                          ? THEME_CONSTANTS.THEME.COMMON.ACCENT_DANGER
                          : THEME_CONSTANTS.THEME.COMMON.ACCENT_WARNING
                    }`}
                  >
                    {tradeAnalysis.fairness}
                  </div>
                  <div className={`text-xl ${themeClasses.TEXT_PRIMARY} mb-4`}>
                    {tradeAnalysis.recommendation}
                  </div>
                  <div className={`text-sm ${themeClasses.TEXT_TERTIARY}`}>
                    Value difference:{" "}
                    {Math.abs(tradeAnalysis.valueDifference).toFixed(0)} points
                  </div>
                </div>

                <div className={`grid grid-cols-2 ${GAP.MD}`}>
                  <div
                    className={`${themeClasses.BG_SECONDARY} ${PADDING.LG} rounded-lg`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={themeClasses.TEXT_TERTIARY}>
                        Your Side Value
                      </span>
                      <span
                        className={`${THEME_CONSTANTS.THEME.COMMON.ACCENT_PRIMARY} font-medium`}
                      >
                        {tradeAnalysis.yourSideValue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`${themeClasses.BG_SECONDARY} ${PADDING.LG} rounded-lg`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={themeClasses.TEXT_TERTIARY}>
                        Their Side Value
                      </span>
                      <span
                        className={`${THEME_CONSTANTS.THEME.COMMON.ACCENT_SECONDARY} font-medium`}
                      >
                        {tradeAnalysis.targetSideValue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {tradeAnalysis.winnerSide !== "neutral" && (
                  <div
                    className={`${PADDING.LG} rounded-lg border-2 ${
                      tradeAnalysis.winnerSide === "your"
                        ? `${THEME_CONSTANTS.THEME.COMMON.BG_ACCENT_PRIMARY} border-emerald-400/30`
                        : `${THEME_CONSTANTS.THEME.COMMON.BG_ACCENT_DANGER} border-red-400/30`
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {tradeAnalysis.winnerSide === "your" ? (
                        <Crown
                          className={
                            THEME_CONSTANTS.THEME.COMMON.ACCENT_PRIMARY
                          }
                          size={20}
                        />
                      ) : (
                        <Target
                          className={THEME_CONSTANTS.THEME.COMMON.ACCENT_DANGER}
                          size={20}
                        />
                      )}
                      <span
                        className={`font-medium ${
                          tradeAnalysis.winnerSide === "your"
                            ? THEME_CONSTANTS.THEME.COMMON.ACCENT_PRIMARY
                            : THEME_CONSTANTS.THEME.COMMON.ACCENT_DANGER
                        }`}
                      >
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
