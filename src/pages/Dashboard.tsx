import { motion } from "framer-motion";
import { MOCK_TOP_PLAYERS } from "../lib/mock";
import { getThemeClasses } from "@/lib/constants";
import Layout from "@/components/Layout";
import PlayerCard from "../components/ui/cards/PlayerCard";
import { StatGrid } from "../components/ui/common";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Activity, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  const dashboardStats = useMemo(
    () => [
      {
        title: "Weekly Points",
        value: "124.7",
        subtitle: "Last week's score",
        icon: Activity,
        trend: "up" as const,
        trendValue: "+12.3",
        variant: "default" as const,
      },
      {
        title: "Win Rate",
        value: "73%",
        subtitle: "Above average",
        icon: TrendingUp,
        trend: "up" as const,
        trendValue: "+8%",
        variant: "default" as const,
      },
    ],
    []
  );

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
          <h1
            className={`text-4xl font-bold ${themeClasses.TEXT_PRIMARY} mb-2`}
          >
            Welcome back, {user?.email?.split("@")[0] || "Coach"}
          </h1>
          <p className={`text-xl ${themeClasses.TEXT_TERTIARY}`}>
            Ready to dominate your fantasy leagues with data-driven insights?
          </p>
        </motion.div>

        {/* Quick Stats Grid */}
        <StatGrid stats={dashboardStats} />

        {/* Top Players Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-3xl font-bold ${themeClasses.TEXT_PRIMARY}`}>
              Your Top Performers
            </h2>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              View All Players
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPlayers.map((player) => {
              const { tier, ...rest } = player;
              return (
                <PlayerCard
                  key={player.name}
                  player={{ ...rest, id: player.name }}
                  tier={
                    tier === "Elite"
                      ? 1
                      : tier === "RB1" || tier === "WR1"
                        ? 2
                        : 3
                  }
                />
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
