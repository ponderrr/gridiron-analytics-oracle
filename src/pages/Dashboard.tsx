import { motion } from "framer-motion";
import { MOCK_TOP_PLAYERS } from "../lib/mock";
import {
  THEME_CONSTANTS,
  UI_CONSTANTS,
  MESSAGE_CONSTANTS,
} from "@/lib/constants";
import Layout from "../components/Layout";
import PlayerCard from "../components/ui/cards/PlayerCard";
import FeatureCard from "../components/ui/cards/FeatureCard";
import { StatGrid } from "../components/ui/common";
import { useAuth } from "../contexts/AuthContext";
import {
  Activity,
  TrendingUp,
  Users,
  BarChart3,
  Brain,
  Target,
} from "lucide-react";
import React, { useMemo, useCallback } from "react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const dashboardStats = useMemo(
    () => [
      {
        title: "Active Leagues",
        value: "3",
        subtitle: "Championship bound",
        icon: Activity,
        trend: "up" as const,
        trendValue: "+1",
        variant: "default" as const,
      },
      {
        title: "Win Rate",
        value: "73%",
        subtitle: "Above average",
        icon: TrendingUp,
        trend: "up" as const,
        trendValue: "+8%",
        variant: "premium" as const,
      },
      {
        title: "Players Tracked",
        value: "247",
        subtitle: "In your watchlist",
        icon: Users,
        trend: "up" as const,
        trendValue: "+12",
        variant: "elite" as const,
      },
      {
        title: "Prediction Accuracy",
        value: "89%",
        subtitle: "This season",
        icon: BarChart3,
        trend: "up" as const,
        trendValue: "+4%",
        variant: "champion" as const,
      },
    ],
    []
  );

  const handleAnalyticsClick = useCallback(() => {
    console.log("Navigate to Analytics");
  }, []);

  const handleTradeAnalyzerClick = useCallback(() => {
    console.log("Navigate to Trade Analyzer");
  }, []);

  // No need for useMemo here: MOCK_TOP_PLAYERS is static. If this becomes dynamic or expensive, wrap in useMemo.
  const topPlayers = MOCK_TOP_PLAYERS;

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
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.email?.split("@")[0] || "Coach"}
          </h1>
          <p className="text-xl text-slate-400">
            Ready to dominate your fantasy leagues with data-driven insights?
          </p>
        </motion.div>

        {/* Quick Stats Grid */}
        <StatGrid stats={dashboardStats} />

        {/* Top Players Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">
              Your Top Performers
            </h2>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              View All Players
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPlayers.map((player, index) => {
              const { tier, ...rest } = player;
              return (
                <PlayerCard key={player.name} {...rest} tierLabel={tier} />
              );
            })}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Analytics & Tools</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FeatureCard
              title="Advanced Analytics"
              description="Get deep insights into player performance, matchup analysis, and predictive modeling to make the smartest lineup decisions."
              icon={Brain}
              variant="premium"
              onClick={handleAnalyticsClick}
            />

            <FeatureCard
              title="Trade Analyzer"
              description="Analyze potential trades with our AI-powered system that evaluates player values, team needs, and future projections."
              icon={Target}
              variant="elite"
              onClick={handleTradeAnalyzerClick}
            />
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Take Your Fantasy Game to the Next Level?
          </h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Our advanced analytics platform gives you the competitive edge you
            need. Get powerful insights that will transform how you play fantasy
            football.
          </p>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Explore Features
          </button>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
