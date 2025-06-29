
import React from 'react';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';
import Layout from '../components/Layout';

const Analytics: React.FC = () => {
  return (
    <Layout isAuthenticated>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <TrendingUp className="h-8 w-8 mr-3 text-emerald-400" />
            Analytics
          </h1>
          <p className="text-slate-400 mt-1">Advanced analytics and performance insights</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
            </div>
            <div className="h-48 bg-slate-900/50 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">Chart visualization coming soon</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <PieChart className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Position Analysis</h3>
            </div>
            <div className="h-48 bg-slate-900/50 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">Position breakdown coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
          <TrendingUp className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Advanced Analytics Dashboard</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Comprehensive analytics tools including trend analysis, predictive modeling, and performance optimization insights.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
