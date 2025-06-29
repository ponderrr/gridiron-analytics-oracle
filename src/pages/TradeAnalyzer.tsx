import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { FantasyCard } from "../components/ui/cards/FantasyCard";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Plus, X, TrendingUp, ArrowRight } from "lucide-react";

const TradeAnalyzer: React.FC = () => {
  const [yourPlayers, setYourPlayers] = useState<string[]>([]);
  const [targetPlayers, setTargetPlayers] = useState<string[]>([]);
  const [tradeAnalysis, setTradeAnalysis] = useState<any>(null);

  const availablePlayers = [
    { name: "Josh Allen", position: "QB", team: "BUF", value: 95 },
    { name: "Christian McCaffrey", position: "RB", team: "SF", value: 92 },
    { name: "Cooper Kupp", position: "WR", team: "LAR", value: 88 },
    { name: "Travis Kelce", position: "TE", team: "KC", value: 85 },
    { name: "Stefon Diggs", position: "WR", team: "HOU", value: 82 },
    { name: "Derrick Henry", position: "RB", team: "BAL", value: 80 },
  ];

  const addPlayerToTrade = (player: any, side: "your" | "target") => {
    if (side === "your") {
      setYourPlayers([...yourPlayers, `${player.name} (${player.position})`]);
    } else {
      setTargetPlayers([
        ...targetPlayers,
        `${player.name} (${player.position})`,
      ]);
    }
  };

  const removePlayer = (index: number, side: "your" | "target") => {
    if (side === "your") {
      setYourPlayers(yourPlayers.filter((_, i) => i !== index));
    } else {
      setTargetPlayers(targetPlayers.filter((_, i) => i !== index));
    }
  };

  const analyzeTrade = () => {
    if (yourPlayers.length === 0 || targetPlayers.length === 0) return;

    // Mock analysis result with realistic trade data
    setTradeAnalysis({
      fairness: "Fair Trade",
      riskLevel: "Medium",
      shortTermImpact: "+2.4 pts/game",
      longTermValue: "Positive",
      recommendation: "Accept Trade",
    });
  };

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
    <Layout isAuthenticated>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white flex items-center">
            <ArrowLeftRight className="h-8 w-8 mr-3 text-emerald-400" />
            Trade Analyzer
          </h1>
          <p className="text-slate-400 mt-1">
            Analyze potential trades with our smart evaluation system
          </p>
        </motion.div>

        {/* Trade Builder */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Your Team */}
            <FantasyCard variant="default" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                Your Players
              </h3>

              <div className="space-y-3 mb-4">
                {yourPlayers.length === 0 ? (
                  <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <Plus className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-500">
                      Select players to trade away
                    </p>
                  </div>
                ) : (
                  yourPlayers.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-800 rounded-lg p-3"
                    >
                      <span className="text-white">{player}</span>
                      <button
                        onClick={() => removePlayer(index, "your")}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {availablePlayers.map((player, index) => (
                    <button
                      key={index}
                      onClick={() => addPlayerToTrade(player, "your")}
                      className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 rounded p-2 text-left transition-colors"
                    >
                      <div>
                        <span className="text-white text-sm">
                          {player.name}
                        </span>
                        <span className="text-slate-400 text-xs ml-2">
                          {player.position} - {player.team}
                        </span>
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">
                        {player.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </FantasyCard>

            {/* Trade Target */}
            <FantasyCard variant="premium" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-blue-400" />
                Players to Receive
              </h3>

              <div className="space-y-3 mb-4">
                {targetPlayers.length === 0 ? (
                  <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <Plus className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-500">Select players to acquire</p>
                  </div>
                ) : (
                  targetPlayers.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-800 rounded-lg p-3"
                    >
                      <span className="text-white">{player}</span>
                      <button
                        onClick={() => removePlayer(index, "target")}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {availablePlayers.map((player, index) => (
                    <button
                      key={index}
                      onClick={() => addPlayerToTrade(player, "target")}
                      className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 rounded p-2 text-left transition-colors"
                    >
                      <div>
                        <span className="text-white text-sm">
                          {player.name}
                        </span>
                        <span className="text-slate-400 text-xs ml-2">
                          {player.position} - {player.team}
                        </span>
                      </div>
                      <span className="text-blue-400 text-sm font-medium">
                        {player.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </FantasyCard>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button
              onClick={analyzeTrade}
              disabled={yourPlayers.length === 0 || targetPlayers.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <ArrowLeftRight className="h-5 w-5" />
              <span>Analyze Trade</span>
            </Button>
          </div>
        </motion.div>

        {/* Trade Analysis Results */}
        {tradeAnalysis && (
          <motion.div variants={itemVariants}>
            <FantasyCard variant="elite" className="p-6">
              <div className="space-y-6">
                <div className="text-center p-6 bg-slate-800/50 rounded-xl">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">
                    {tradeAnalysis.fairness}
                  </div>
                  <div className="text-xl text-white">
                    {tradeAnalysis.recommendation}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Risk Level</span>
                      <span className="text-yellow-400 font-medium">
                        {tradeAnalysis.riskLevel}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Short-term Impact</span>
                      <span className="text-emerald-400 font-medium">
                        {tradeAnalysis.shortTermImpact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FantasyCard>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default TradeAnalyzer;
