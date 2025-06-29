import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import {
  StatCard,
  PlayerCard,
  FeatureCard,
  FantasyCard,
} from "../components/ui/cards/FantasyCard";
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";

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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search players by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Positions</option>
              <option value="qb">Quarterbacks</option>
              <option value="rb">Running Backs</option>
              <option value="wr">Wide Receivers</option>
              <option value="te">Tight Ends</option>
            </select>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Teams</option>
              <option value="buf">Buffalo Bills</option>
              <option value="sf">San Francisco 49ers</option>
              <option value="lar">Los Angeles Rams</option>
              <option value="kc">Kansas City Chiefs</option>
            </select>
            <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 hover:text-white transition-colors">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {playerStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </motion.div>

        {/* Player Categories */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Player Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {playerCategories.map((category, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <FantasyCard
                  variant={category.variant}
                  className="p-6 text-center cursor-pointer"
                  hover
                >
                  <category.icon className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="text-2xl font-bold text-white">
                    {category.count}
                  </div>
                  <div className="text-xs text-slate-500">players</div>
                </FantasyCard>
              </motion.div>
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
              <motion.div
                key={player.name}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <PlayerCard
                  {...player}
                  onClick={() => console.log(`View ${player.name} details`)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tools Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Player Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Player Comparison"
              description="Compare multiple players side-by-side with detailed statistics and projections."
              icon={BarChart3}
              variant="premium"
              comingSoon
            />
            <FeatureCard
              title="Waiver Wire Analysis"
              description="Identify the best available players on the waiver wire with pickup recommendations."
              icon={Target}
              variant="elite"
              comingSoon
            />
            <FeatureCard
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
