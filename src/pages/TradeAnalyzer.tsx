import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import {
  StatCard,
  FeatureCard,
  FantasyCard,
} from "../components/ui/cards/FantasyCard";
import {
  ArrowLeftRight,
  Plus,
  TrendingUp,
  BarChart3,
  Target,
  Brain,
  Activity,
  Users,
  Trophy,
  X,
} from "lucide-react";

const TradeAnalyzer: React.FC = () => {
  const [yourPlayers, setYourPlayers] = useState<string[]>([]);
  const [targetPlayers, setTargetPlayers] = useState<string[]>([]);
  const [tradeAnalysis, setTradeAnalysis] = useState<any>(null);

  const tradeStats = [
    {
      title: "Trades Analyzed",
      value: "1,247",
      subtitle: "This season",
      icon: ArrowLeftRight,
      trend: "up" as const,
      trendValue: "+8%",
      variant: "default" as const,
    },
    {
      title: "Win Rate Improvement",
      value: "12.3%",
      subtitle: "Average boost",
      icon: TrendingUp,
      trend: "up" as const,
      trendValue: "+2.1%",
      variant: "premium" as const,
    },
    {
      title: "Value Trades Found",
      value: "89",
      subtitle: "Positive impact",
      icon: Target,
      trend: "up" as const,
      trendValue: "+15",
      variant: "elite" as const,
    },
    {
      title: "Analysis Accuracy",
      value: "91.2%",
      subtitle: "Prediction rate",
      icon: Brain,
      trend: "up" as const,
      trendValue: "+3.2%",
      variant: "champion" as const,
    },
  ];

  const availablePlayers = [
    { name: "Josh Allen", position: "QB", team: "BUF", value: 95 },
    { name: "Christian McCaffrey", position: "RB", team: "SF", value: 92 },
    { name: "Cooper Kupp", position: "WR", team: "LAR", value: 88 },
    { name: "Travis Kelce", position: "TE", team: "KC", value: 85 },
    { name: "Stefon Diggs", position: "WR", team: "HOU", value: 82 },
    { name: "Derrick Henry", position: "RB", team: "BAL", value: 80 },
  ];

  const tradeFeatures = [
    {
      title: "AI Trade Evaluation",
      description:
        "Advanced algorithms analyze player values, team needs, and future projections to determine trade fairness.",
      icon: Brain,
      variant: "premium" as const,
    },
    {
      title: "Win Probability Analysis",
      description:
        "See how each trade affects your championship odds with detailed probability calculations.",
      icon: Trophy,
      variant: "elite" as const,
    },
    {
      title: "Market Intelligence",
      description:
        "Real-time player values and trade trends to ensure you're getting the best possible deals.",
      icon: BarChart3,
      variant: "champion" as const,
    },
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

    // Mock analysis result
    setTradeAnalysis({
      rating: "B+",
      fairness: 78,
      winProbabilityChange: "+4.2%",
      recommendation: "Favorable trade that improves your championship odds",
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
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <ArrowLeftRight className="h-8 w-8 mr-3 text-emerald-400" />
                Trade Analyzer
              </h1>
              <p className="text-slate-400 mt-1">
                AI-powered trade analysis and recommendations
              </p>
            </div>
            <button
              onClick={analyzeTrade}
              disabled={yourPlayers.length === 0 || targetPlayers.length === 0}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg px-6 py-3 text-white font-medium transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analyze Trade</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {tradeStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </motion.div>

        {/* Trade Builder */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Build Your Trade</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Your Team */}
            <FantasyCard variant="default" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-emerald-400" />
                Your Team
              </h3>

              <div className="space-y-3 mb-4">
                {yourPlayers.length === 0 ? (
                  <div className="bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
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
                <p className="text-sm font-medium text-slate-300">
                  Available Players:
                </p>
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
                <Target className="h-5 w-5 mr-2 text-blue-400" />
                Trade Target
              </h3>

              <div className="space-y-3 mb-4">
                {targetPlayers.length === 0 ? (
                  <div className="bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
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
                <p className="text-sm font-medium text-slate-300">
                  Available Players:
                </p>
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
        </motion.div>

        {/* Trade Analysis Results */}
        {tradeAnalysis && (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Trade Analysis</h2>
            <FantasyCard variant="elite" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {tradeAnalysis.rating}
                  </div>
                  <div className="text-sm text-slate-400">Trade Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    {tradeAnalysis.fairness}%
                  </div>
                  <div className="text-sm text-slate-400">Fairness Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {tradeAnalysis.winProbabilityChange}
                  </div>
                  <div className="text-sm text-slate-400">Win Probability</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-white">
                    {tradeAnalysis.recommendation}
                  </div>
                </div>
              </div>
            </FantasyCard>
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Advanced Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tradeFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <FeatureCard {...feature} comingSoon />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Unlock Advanced Trade Analysis
          </h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Get instant trade evaluations with win probability analysis, value
            assessment, and strategic recommendations to dominate your league.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Upgrade to Pro
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              View Sample Analysis
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default TradeAnalyzer;
