import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import {
  StatCard,
  FeatureCard,
  FantasyCard,
} from "../components/ui/cards/FantasyCard";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Target,
  Brain,
  Filter,
  Calendar,
} from "lucide-react";

const Analytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("season");
  const [selectedPosition, setSelectedPosition] = useState("all");

  const analyticsStats = [
    {
      title: "Total Players Analyzed",
      value: "1,247",
      subtitle: "Across all positions",
      icon: Users,
      trend: "up" as const,
      trendValue: "+8%",
      variant: "default" as const,
    },
    {
      title: "Prediction Accuracy",
      value: "89.2%",
      subtitle: "Last 4 weeks",
      icon: Target,
      trend: "up" as const,
      trendValue: "+2.3%",
      variant: "premium" as const,
    },
    {
      title: "Top Performers ID'd",
      value: "156",
      subtitle: "Breakout candidates",
      icon: TrendingUp,
      trend: "up" as const,
      trendValue: "+12",
      variant: "elite" as const,
    },
    {
      title: "Analysis Score",
      value: "94.7",
      subtitle: "Algorithm performance",
      icon: Brain,
      trend: "up" as const,
      trendValue: "+1.2",
      variant: "champion" as const,
    },
  ];

  const chartPlaceholders = [
    {
      title: "Performance Trends",
      description: "Weekly player performance analysis across all positions",
      icon: BarChart3,
      variant: "premium" as const,
    },
    {
      title: "Position Analysis",
      description: "Breakdown of scoring trends by position group",
      icon: PieChart,
      variant: "elite" as const,
    },
    {
      title: "Matchup Intelligence",
      description: "Defense vs position scoring analysis",
      icon: Activity,
      variant: "default" as const,
    },
    {
      title: "Projection Accuracy",
      description: "Model performance tracking over time",
      icon: Target,
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
                <TrendingUp className="h-8 w-8 mr-3 text-emerald-400" />
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Advanced analytics and performance insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="season">Season</option>
              </select>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Positions</option>
                <option value="qb">Quarterbacks</option>
                <option value="rb">Running Backs</option>
                <option value="wr">Wide Receivers</option>
                <option value="te">Tight Ends</option>
              </select>
              <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 hover:text-white transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {analyticsStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Performance Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartPlaceholders.map((chart, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <FantasyCard variant={chart.variant} className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <chart.icon className="h-6 w-6 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {chart.title}
                    </h3>
                  </div>
                  <div className="h-48 bg-slate-900/50 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <chart.icon className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">
                        Chart visualization coming soon
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">{chart.description}</p>
                </FantasyCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Advanced Features */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Advanced Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Predictive Modeling"
              description="AI-powered player performance predictions using machine learning algorithms and historical data patterns."
              icon={Brain}
              variant="premium"
              comingSoon
            />
            <FeatureCard
              title="Market Analysis"
              description="Real-time fantasy market trends and ownership percentages to identify value opportunities."
              icon={TrendingUp}
              variant="elite"
              comingSoon
            />
            <FeatureCard
              title="Weekly Reports"
              description="Automated weekly analysis reports with key insights and actionable recommendations."
              icon={Calendar}
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
            Unlock Advanced Analytics
          </h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Get access to comprehensive analytics tools including trend
            analysis, predictive modeling, and performance optimization
            insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Upgrade to Pro
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              View Demo
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Analytics;
