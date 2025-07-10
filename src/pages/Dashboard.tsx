import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

const Dashboard: React.FC = () => {
  const { effectiveTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Welcome to FF Meta
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Your advanced fantasy football analytics platform is being built.
          </p>
        </motion.div>

        {/* Coming Soon Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] hover:border-[var(--color-border-accent)] transition-colors">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Advanced Analytics
                </h3>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  AI-powered insights and performance predictions
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] hover:border-[var(--color-border-accent)] transition-colors">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Real-time Data
                </h3>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  Live player updates and injury reports
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] hover:border-[var(--color-border-accent)] transition-colors">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  League Integration
                </h3>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  Connect all your fantasy leagues
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Building Something Amazing
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                While we're developing these features, explore our player
                rankings and trade analyzer tools.
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
