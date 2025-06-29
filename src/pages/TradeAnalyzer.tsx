
import React from 'react';
import { ArrowLeftRight, Plus } from 'lucide-react';
import Layout from '../components/Layout';

const TradeAnalyzer: React.FC = () => {
  return (
    <Layout isAuthenticated>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ArrowLeftRight className="h-8 w-8 mr-3 text-emerald-400" />
              Trade Analyzer
            </h1>
            <p className="text-slate-400 mt-1">AI-powered trade analysis and recommendations</p>
          </div>
          
          <button className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg px-4 py-2 text-white font-medium transition-colors mt-4 sm:mt-0">
            <Plus className="h-4 w-4" />
            <span>Analyze Trade</span>
          </button>
        </div>

        {/* Trade Analysis Tool */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Team</h3>
            <div className="space-y-3">
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-center">
                <p className="text-slate-500">Select players to trade away</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Trade Target</h3>
            <div className="space-y-3">
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-center">
                <p className="text-slate-500">Select players to acquire</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
          <ArrowLeftRight className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">AI Trade Analysis</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Get instant trade evaluations with win probability analysis, value assessment, and strategic recommendations.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TradeAnalyzer;
