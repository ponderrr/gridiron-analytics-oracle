
import React from 'react';
import Layout from '../components/Layout';
import { BarChart3, TrendingUp, Users, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout isAuthenticated={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Guru'}!
          </h1>
          <p className="text-slate-400">
            Ready to dominate your fantasy leagues with data-driven insights?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Leagues</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="card-gradient rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-white">73%</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card-gradient rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Players Tracked</p>
                <p className="text-2xl font-bold text-white">247</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="card-gradient rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Predictions</p>
                <p className="text-2xl font-bold text-white">89%</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-gradient rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
            <p className="text-slate-400 mb-6">
              Get deep insights into player performance, matchup analysis, and predictive modeling 
              to make the smartest lineup decisions.
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <p className="text-emerald-400 text-sm font-medium">Coming Soon</p>
              <p className="text-slate-300 text-sm mt-1">
                Player performance predictions, injury impact analysis, and weather-adjusted projections.
              </p>
            </div>
          </div>

          <div className="card-gradient rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">League Management</h3>
            <p className="text-slate-400 mb-6">
              Track multiple leagues, monitor trades, and get notifications about key player updates 
              that could impact your lineups.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm font-medium">Coming Soon</p>
              <p className="text-slate-300 text-sm mt-1">
                Multi-league dashboard, trade analyzer, and automated lineup optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="card-gradient rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Take Your Fantasy Game to the Next Level?
            </h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              Our advanced analytics platform is being built to give you the competitive edge you need. 
              Stay tuned for powerful features that will transform how you play fantasy football.
            </p>
            <button className="btn-primary px-8 py-3">
              Get Notified of Updates
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
