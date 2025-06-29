
import React from 'react';
import { Users, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';

const Players: React.FC = () => {
  return (
    <Layout isAuthenticated>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Users className="h-8 w-8 mr-3 text-emerald-400" />
              Players
            </h1>
            <p className="text-slate-400 mt-1">Discover and analyze player performance data</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search players..."
                className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 hover:text-white transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
          <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Player Database Coming Soon</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Access comprehensive player statistics, projections, and analysis tools to make informed roster decisions.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Players;
