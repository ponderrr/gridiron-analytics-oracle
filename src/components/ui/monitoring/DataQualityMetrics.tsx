import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Database, Users } from 'lucide-react';

interface DataQualityStats {
  total_players: number;
  active_players: number;
  players_with_teams: number;
  players_with_positions: number;
  players_with_metadata: number;
  recent_updates: number;
}

const fetchDataQualityStats = async (): Promise<DataQualityStats> => {
  // Use individual queries since the RPC function doesn't exist yet
  const [playersResult, activeResult, teamsResult, positionsResult, metadataResult] = await Promise.all([
    supabase.from('players').select('id', { count: 'exact' }),
    supabase.from('players').select('id', { count: 'exact' }).eq('active', true),
    supabase.from('players').select('id', { count: 'exact' }).not('team', 'is', null),
    supabase.from('players').select('id', { count: 'exact' }).not('position', 'is', null),
    supabase.from('players').select('id', { count: 'exact' }).not('metadata', 'is', null),
  ]);

  return {
    total_players: playersResult.count || 0,
    active_players: activeResult.count || 0,
    players_with_teams: teamsResult.count || 0,
    players_with_positions: positionsResult.count || 0,
    players_with_metadata: metadataResult.count || 0,
    recent_updates: 0,
  };
};

const DataQualityMetrics: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dataQualityStats'],
    queryFn: fetchDataQualityStats,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                <div className="h-2 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="text-red-400 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Error loading data quality metrics</span>
        </div>
      </Card>
    );
  }

  const getQualityScore = () => {
    if (stats.total_players === 0) return 0;
    const completenessScore = (
      (stats.active_players / stats.total_players) * 0.3 +
      (stats.players_with_teams / stats.total_players) * 0.3 +
      (stats.players_with_positions / stats.total_players) * 0.3 +
      (stats.players_with_metadata / stats.total_players) * 0.1
    ) * 100;
    return Math.round(completenessScore);
  };

  const qualityScore = getQualityScore();
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-400" />
          Data Quality Metrics
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`text-2xl font-bold ${getScoreColor(qualityScore)}`}>
            {qualityScore}%
          </div>
          {qualityScore >= 90 ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Total Players</span>
            <span className="text-white font-medium">{stats.total_players}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Database coverage</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Active Players</span>
            <span className="text-white font-medium">
              {stats.active_players} ({((stats.active_players / stats.total_players) * 100).toFixed(1)}%)
            </span>
          </div>
          <Progress 
            value={(stats.active_players / stats.total_players) * 100} 
            className="h-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Players with Teams</span>
            <span className="text-white font-medium">
              {stats.players_with_teams} ({((stats.players_with_teams / stats.total_players) * 100).toFixed(1)}%)
            </span>
          </div>
          <Progress 
            value={(stats.players_with_teams / stats.total_players) * 100} 
            className="h-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Players with Positions</span>
            <span className="text-white font-medium">
              {stats.players_with_positions} ({((stats.players_with_positions / stats.total_players) * 100).toFixed(1)}%)
            </span>
          </div>
          <Progress 
            value={(stats.players_with_positions / stats.total_players) * 100} 
            className="h-2"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Players with Metadata</span>
            <span className="text-white font-medium">
              {stats.players_with_metadata} ({((stats.players_with_metadata / stats.total_players) * 100).toFixed(1)}%)
            </span>
          </div>
          <Progress 
            value={(stats.players_with_metadata / stats.total_players) * 100} 
            className="h-2"
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Overall Data Quality</span>
          <span className={`font-semibold ${getScoreColor(qualityScore)}`}>
            {qualityScore >= 90 ? 'Excellent' : qualityScore >= 70 ? 'Good' : 'Needs Improvement'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DataQualityMetrics;