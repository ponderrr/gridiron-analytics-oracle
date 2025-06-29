import React from "react";
import { Trophy, Users, Calendar } from "lucide-react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import ComingSoonCard from "../components/ComingSoonCard";

const League: React.FC = () => {
  return (
    <Layout isAuthenticated>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="League Management"
          subtitle="Manage all your fantasy leagues in one place"
          icon={<Trophy className="h-8 w-8 mr-3 text-emerald-400" />}
          actions={
            <span className="ml-3 bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full">
              Coming Soon
            </span>
          }
        />

        {/* Coming Soon Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              League Overview
            </h3>
            <p className="text-slate-400 text-sm">
              View standings, matchups, and league activity
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Schedule & Matchups
            </h3>
            <p className="text-slate-400 text-sm">
              Track upcoming games and playoff scenarios
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
            <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Championship Path
            </h3>
            <p className="text-slate-400 text-sm">
              Analyze your path to the championship
            </p>
          </div>
        </div>

        <ComingSoonCard
          icon={<Trophy className="h-16 w-16 text-slate-600 mx-auto" />}
          title="League Integration Coming Soon"
          description="Connect and manage multiple fantasy leagues with advanced analytics, automated lineup optimization, and championship insights."
        />
      </div>
    </Layout>
  );
};

export default League;
