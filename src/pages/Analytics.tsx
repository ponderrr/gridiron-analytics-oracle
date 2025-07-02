import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { Brain, Construction, Zap } from "lucide-react";
import { FantasyCard } from "../components/ui/cards/FantasyCard";

const Analytics: React.FC = () => {
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
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white flex items-center">
            <Brain className="h-8 w-8 mr-3 text-emerald-400" />
            Analytics
          </h1>
          <p className="text-slate-400 mt-1">
            Advanced analytics and performance insights
          </p>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div variants={itemVariants}>
          <FantasyCard variant="premium" className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <Construction className="h-16 w-16 text-emerald-400 animate-pulse" />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">Coming Soon</h2>
                <p className="text-slate-400 max-w-2xl">
                  We're working hard to bring you advanced analytics
                  capabilities. Our team is developing cutting-edge features to
                  help you make data-driven decisions for your fantasy team.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                  <Brain className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    AI Predictions
                  </h3>
                  <p className="text-sm text-slate-400">
                    Machine learning powered performance predictions
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                  <Zap className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Real-time Analysis
                  </h3>
                  <p className="text-sm text-slate-400">
                    Live performance tracking and analysis
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                  <Construction className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Custom Reports
                  </h3>
                  <p className="text-sm text-slate-400">
                    Personalized analytics reports and insights
                  </p>
                </div>
              </div>
            </div>
          </FantasyCard>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Analytics;
