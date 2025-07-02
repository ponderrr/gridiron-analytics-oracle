import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { FantasyCard } from "../components/ui/cards/FantasyCard";
import { StatGrid } from "../components/ui/common";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  Award,
  Crown,
  Zap,
} from "lucide-react";

const League: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState("championship");

  const leagueStats = [
    {
      title: "Active Leagues",
      value: "3",
      subtitle: "Currently managing",
      icon: Trophy,
      trend: "up" as const,
      trendValue: "+1",
      variant: "default" as const,
    },
    {
      title: "Overall Record",
      value: "24-8",
      subtitle: "This season",
      icon: Activity,
      trend: "up" as const,
      trendValue: "75%",
      variant: "premium" as const,
    },
    {
      title: "Championships",
      value: "2",
      subtitle: "Last 3 years",
      icon: Crown,
      trend: "up" as const,
      trendValue: "+1",
      variant: "elite" as const,
    },
    {
      title: "Playoff Odds",
      value: "87%",
      subtitle: "Current projection",
      icon: Target,
      trend: "up" as const,
      trendValue: "+12%",
      variant: "champion" as const,
    },
  ];

  const leagues = [
    {
      name: "Championship League",
      type: "12-Team PPR",
      record: "8-2",
      standing: "1st",
      points: "1,247.6",
      status: "Leading",
      variant: "champion" as const,
    },
    {
      name: "Work Friends",
      type: "10-Team Standard",
      record: "6-4",
      standing: "3rd",
      points: "1,089.2",
      status: "Playoff Bound",
      variant: "premium" as const,
    },
    {
      name: "Family League",
      type: "8-Team PPR",
      record: "10-0",
      standing: "1st",
      points: "1,456.8",
      status: "Undefeated",
      variant: "elite" as const,
    },
  ];

  const upcomingMatchups = [
    {
      opponent: "Team Thunder",
      week: "Week 11",
      projection: "Win 68%",
      points: "124.5 vs 118.2",
    },
    {
      opponent: "Dynasty Destroyers",
      week: "Week 12",
      projection: "Win 72%",
      points: "127.8 vs 115.6",
    },
    {
      opponent: "Grid Iron Giants",
      week: "Week 13",
      projection: "Win 58%",
      points: "121.3 vs 119.7",
    },
  ];

  const leagueFeatures = [
    {
      title: "Multi-League Dashboard",
      description:
        "Manage all your fantasy leagues from one unified interface with real-time updates.",
      icon: BarChart3,
      variant: "premium" as const,
    },
    {
      title: "Playoff Scenarios",
      description:
        "Advanced playoff probability calculations and scenarios to secure your spot.",
      icon: Target,
      variant: "elite" as const,
    },
    {
      title: "League Intelligence",
      description:
        "Analyze your league mates' tendencies and trading patterns for strategic advantages.",
      icon: Zap,
      variant: "champion" as const,
    },
  ];

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
                <Trophy className="h-8 w-8 mr-3 text-emerald-400" />
                League Management
              </h1>
              <p className="text-slate-400 mt-1">
                Manage all your fantasy leagues in one place
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="championship">Championship League</option>
                <option value="work">Work Friends</option>
                <option value="family">Family League</option>
              </select>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Add League
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <StatGrid stats={leagueStats} />

        {/* Leagues Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Your Leagues</h2>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Manage All Leagues
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league, index) => (
              <FantasyCard key={index} cardType="league" cardData={league} />
            ))}
          </div>
        </motion.div>

        {/* Upcoming Matchups */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Upcoming Matchups</h2>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="space-y-4">
              {upcomingMatchups.map((matchup, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <div>
                      <h3 className="text-white font-medium">
                        vs {matchup.opponent}
                      </h3>
                      <p className="text-slate-400 text-sm">{matchup.week}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-medium">
                      {matchup.projection}
                    </p>
                    <p className="text-slate-400 text-sm">{matchup.points}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* League Features */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-3xl font-bold text-white">League Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {leagueFeatures.map((feature, index) => (
              <FantasyCard key={index} cardType="feature" cardData={feature} />
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Take Control of Your Leagues
          </h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Get advanced league management tools, real-time updates, and
            strategic insights to dominate all your fantasy football leagues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Upgrade for Full Access
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              View League Analytics
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default League;
