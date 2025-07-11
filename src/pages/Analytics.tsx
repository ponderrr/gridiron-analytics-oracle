import React from "react";
import { motion } from "framer-motion";
import { Brain, Construction, BarChart3, Zap } from "lucide-react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";

const Analytics: React.FC = () => {
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
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-500" />
            Analytics
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Advanced analytics and performance insights
          </p>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div variants={itemVariants}>
          <Card className="p-12 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Construction className="h-10 w-10 text-white animate-pulse" />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                  Coming Soon
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                  We're building powerful analytics tools to help you dominate
                  your league.
                </p>
              </div>

              {/* Feature Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  {
                    icon: Brain,
                    title: "AI Predictions",
                    desc: "Machine learning player forecasts",
                  },
                  {
                    icon: BarChart3,
                    title: "Performance Metrics",
                    desc: "Advanced statistical analysis",
                  },
                  {
                    icon: Zap,
                    title: "Real-time Insights",
                    desc: "Live game impact analysis",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)]"
                  >
                    <feature.icon className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Analytics;
