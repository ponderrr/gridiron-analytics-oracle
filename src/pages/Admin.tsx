
import React, { useState, useEffect } from 'react';
import { Database, Users, BarChart3, TrendingUp, ArrowLeftRight } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../integrations/supabase/client';

interface Player {
  id: string;
  player_id: string;
  name: string;
  position: string;
  team: string;
  active: boolean;
  bye_week: number | null;
}

interface WeeklyStat {
  id: string;
  player_id: string;
  season: number;
  week: number;
  fantasy_points: number | null;
  passing_yards: number | null;
  passing_tds: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
  receptions: number | null;
}

interface Projection {
  id: string;
  player_id: string;
  season: number;
  week: number;
  projected_points: number;
  projection_type: string;
  confidence_score: number | null;
}

interface TradeValue {
  id: string;
  player_id: string;
  season: number;
  week: number;
  trade_value: number;
  tier: number | null;
}

const Admin: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [tradeValues, setTradeValues] = useState<TradeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('position', { ascending: true });

      if (playersError) {
        console.error('Error fetching players:', playersError);
      } else {
        setPlayers(playersData || []);
      }

      // Fetch weekly stats
      const { data: statsData, error: statsError } = await supabase
        .from('weekly_stats')
        .select('*')
        .order('week', { ascending: true })
        .limit(10);

      if (statsError) {
        console.error('Error fetching weekly stats:', statsError);
      } else {
        setWeeklyStats(statsData || []);
      }

      // Fetch projections
      const { data: projectionsData, error: projectionsError } = await supabase
        .from('projections')
        .select('*')
        .order('projected_points', { ascending: false });

      if (projectionsError) {
        console.error('Error fetching projections:', projectionsError);
      } else {
        setProjections(projectionsData || []);
      }

      // Fetch trade values
      const { data: tradeValuesData, error: tradeValuesError } = await supabase
        .from('trade_values')
        .select('*')
        .order('trade_value', { ascending: false });

      if (tradeValuesError) {
        console.error('Error fetching trade values:', tradeValuesError);
      } else {
        setTradeValues(tradeValuesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const tabs = [
    { id: 'players', label: 'Players', icon: Users, count: players.length },
    { id: 'stats', label: 'Weekly Stats', icon: BarChart3, count: weeklyStats.length },
    { id: 'projections', label: 'Projections', icon: TrendingUp, count: projections.length },
    { id: 'trade-values', label: 'Trade Values', icon: ArrowLeftRight, count: tradeValues.length },
  ];

  if (loading) {
    return (
      <Layout isAuthenticated>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Database className="h-8 w-8 mr-3 text-emerald-400" />
            Database Admin
          </h1>
          <p className="text-slate-400 mt-1">View and verify database contents</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          {activeTab === 'players' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Bye Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {players.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{player.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{player.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{player.team}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{player.bye_week || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          player.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {player.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fantasy Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Passing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rushing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Receiving</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {weeklyStats.map((stat) => (
                    <tr key={stat.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {getPlayerName(stat.player_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">Week {stat.week}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">
                        {stat.fantasy_points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {stat.passing_yards}y, {stat.passing_tds}td
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {stat.rushing_yards}y, {stat.rushing_tds}td
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {stat.receptions}rec, {stat.receiving_yards}y, {stat.receiving_tds}td
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'projections' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Projected Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {projections.map((projection) => (
                    <tr key={projection.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {getPlayerName(projection.player_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">Week {projection.week}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">
                        {projection.projected_points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {projection.projection_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {projection.confidence_score ? `${(projection.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'trade-values' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Trade Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {tradeValues.map((value) => (
                    <tr key={value.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {getPlayerName(value.player_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">Week {value.week}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">
                        {value.trade_value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        Tier {value.tier}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Players</p>
                <p className="text-2xl font-bold text-white">{players.length}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Weekly Stats</p>
                <p className="text-2xl font-bold text-white">{weeklyStats.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Projections</p>
                <p className="text-2xl font-bold text-white">{projections.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Trade Values</p>
                <p className="text-2xl font-bold text-white">{tradeValues.length}</p>
              </div>
              <ArrowLeftRight className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
