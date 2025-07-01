import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { FantasyCard, CardType } from "../components/ui/cards/FantasyCard";
import { SearchFilters, StatGrid } from "../components/ui/common";
import { Users, TrendingUp, BarChart3, Target, Activity } from "lucide-react";

const Players: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");

  const playerStats = [
    {
      title: "Total Players",
      value: "1,247",
      subtitle: "Active roster",
      icon: Users,
      trend: "up" as const,
      trendValue: "+23",
      variant: "default" as const,
    },
    {
      title: "Top Performers",
      value: "89",
      subtitle: "Above projection",
      icon: TrendingUp,
      trend: "up" as const,
      trendValue: "+12%",
      variant: "premium" as const,
    },
    {
      title: "Breakout Candidates",
      value: "34",
      subtitle: "High upside",
      icon: Target,
      trend: "up" as const,
      trendValue: "+8",
      variant: "elite" as const,
    },
    {
      title: "Waiver Targets",
      value: "16",
      subtitle: "Available pickups",
      icon: Activity,
      trend: "neutral" as const,
      trendValue: "→",
      variant: "champion" as const,
    },
  ];

  const featuredPlayers = [
    {
      name: "Josh Allen",
      position: "QB",
      team: "BUF",
      projection: 24.8,
      points: 28.4,
      trend: "up" as const,
      trendValue: "+12%",
      tier: "Elite",
      status: "active" as const,
    },
    {
      name: "Christian McCaffrey",
      position: "RB",
      team: "SF",
      projection: 18.4,
      points: 22.1,
      trend: "up" as const,
      trendValue: "+8%",
      tier: "RB1",
      status: "active" as const,
    },
    {
      name: "Cooper Kupp",
      position: "WR",
      team: "LAR",
      projection: 16.2,
      points: 19.7,
      trend: "up" as const,
      trendValue: "+15%",
      tier: "WR1",
      status: "questionable" as const,
    },
    {
      name: "Travis Kelce",
      position: "TE",
      team: "KC",
      projection: 14.8,
      points: 17.3,
      trend: "up" as const,
      trendValue: "+6%",
      tier: "Elite",
      status: "active" as const,
    },
    {
      name: "Stefon Diggs",
      position: "WR",
      team: "HOU",
      projection: 15.9,
      points: 18.2,
      trend: "up" as const,
      trendValue: "+9%",
      tier: "WR1",
      status: "active" as const,
    },
    {
      name: "Derrick Henry",
      position: "RB",
      team: "BAL",
      projection: 16.7,
      points: 20.1,
      trend: "up" as const,
      trendValue: "+14%",
      tier: "RB1",
      status: "active" as const,
    },
  ];

  const playerCategories = [
    {
      title: "Elite Performers",
      description: "Top-tier players consistently delivering high scores",
      icon: Target,
      variant: "premium" as const,
      count: 23,
    },
    {
      title: "Breakout Candidates",
      description: "Players showing signs of significant improvement",
      icon: TrendingUp,
      variant: "elite" as const,
      count: 34,
    },
    {
      title: "Value Plays",
      description: "High-upside players available at lower cost",
      icon: BarChart3,
      variant: "champion" as const,
      count: 45,
    },
    {
      title: "Injury Concerns",
      description: "Players to monitor due to health situations",
      icon: Activity,
      variant: "default" as const,
      count: 12,
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

  const searchFilters = [
    {
      label: "Position",
      value: selectedPosition,
      options: [
        { value: "all", label: "All Positions" },
        { value: "qb", label: "Quarterbacks" },
        { value: "rb", label: "Running Backs" },
        { value: "wr", label: "Wide Receivers" },
        { value: "te", label: "Tight Ends" },
      ],
      onChange: setSelectedPosition,
    },
    {
      label: "Team",
      value: selectedTeam,
      options: [
        { value: "all", label: "All Teams" },
        { value: "buf", label: "Buffalo Bills" },
        { value: "sf", label: "San Francisco 49ers" },
        { value: "lar", label: "Los Angeles Rams" },
        { value: "kc", label: "Kansas City Chiefs" },
      ],
      onChange: setSelectedTeam,
    },
  ];

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
                <Users className="h-8 w-8 mr-3 text-emerald-400" />
                Player Database
              </h1>
              <p className="text-slate-400 mt-1">
                Discover and analyze player performance data
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search players by name..."
            filters={searchFilters}
            showMoreFilters={true}
            onMoreFiltersClick={() => console.log("More filters clicked")}
          />
        </motion.div>

        {/* Stats Grid */}
        <StatGrid stats={playerStats} />

        {/* Player Categories */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Player Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {playerCategories.map((feature, index) => (
              <FantasyCard key={index} cardType="feature" cardData={feature} />
            ))}
          </div>
        </motion.div>

        {/* Featured Players */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Featured Players</h2>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              View All Players
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlayers.map((player, index) => (
              <FantasyCard key={index} cardType="player" cardData={player} />
            ))}
          </div>
        </motion.div>

        {/* Tools Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Player Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FantasyCard
              title="Player Comparison"
              description="Compare multiple players side-by-side with detailed statistics and projections."
              icon={BarChart3}
              variant="premium"
              comingSoon
            />
            <FantasyCard
              title="Waiver Wire Analysis"
              description="Identify the best available players on the waiver wire with pickup recommendations."
              icon={Target}
              variant="elite"
              comingSoon
            />
            <FantasyCard
              title="Injury Impact Analysis"
              description="Understand how injuries affect player performance and identify replacement options."
              icon={Activity}
              variant="champion"
              comingSoon
            />
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Access Full Player Database
          </h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Get detailed player profiles, advanced statistics, and personalized
            recommendations to build the perfect roster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Upgrade for Full Access
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Browse Free Players
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Players;
