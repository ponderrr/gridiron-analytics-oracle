import React, { useState, ReactNode, useMemo, useCallback } from "react";
import {
  Database,
  Users,
  BarChart3,
  TrendingUp,
  ArrowLeftRight,
  RefreshCw,
} from "lucide-react";
import Layout from "../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Player, WeeklyStat, Projection, TradeValue } from "../lib/database";
import { supabase } from "../integrations/supabase/client";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { appConfig } from "@/config/app";
import {
  fetchPlayers,
  fetchWeeklyStats,
  fetchProjections,
  fetchTradeValues,
} from "@/lib/api/admin";
import { useSyncData } from "@/hooks/useSyncData";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Simplified table components specific to Admin usage
const PlayersTable: React.FC<{ data: Player[] }> = ({ data }) => (
  <table className="w-full">
    <thead className="bg-slate-700/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Position
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Team
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Bye Week
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-700">
      {data.map((player) => (
        <tr key={player.id} className="hover:bg-slate-700/30">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {player.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {player.position}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {player.team}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {player.bye_week}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {player.active ? "Active" : "Inactive"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const StatsTable: React.FC<{
  data: WeeklyStat[];
  getPlayerName: (playerId: string | null) => string;
}> = ({ data, getPlayerName }) => (
  <table className="w-full">
    <thead className="bg-slate-700/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Player
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Week
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Fantasy Points
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Passing
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Rushing
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Receiving
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-700">
      {data.map((stat) => (
        <tr key={stat.id} className="hover:bg-slate-700/30">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {getPlayerName(stat.player_id)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {stat.week}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {stat.fantasy_points}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {stat.passing_yards}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {stat.rushing_yards}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {stat.receptions}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ProjectionsTable: React.FC<{
  data: Projection[];
  getPlayerName: (playerId: string | null) => string;
}> = ({ data, getPlayerName }) => (
  <table className="w-full">
    <thead className="bg-slate-700/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Player
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Week
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Projected Points
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Type
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Confidence
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-700">
      {data.map((projection) => (
        <tr key={projection.id} className="hover:bg-slate-700/30">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {getPlayerName(projection.player_id)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {projection.week}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {projection.projected_points}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {projection.projection_type}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {projection.confidence_score}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TradeValuesTable: React.FC<{
  data: TradeValue[];
  getPlayerName: (playerId: string | null) => string;
}> = ({ data, getPlayerName }) => (
  <table className="w-full">
    <thead className="bg-slate-700/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Player
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Week
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Trade Value
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
          Tier
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-700">
      {data.map((value) => (
        <tr key={value.id} className="hover:bg-slate-700/30">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {getPlayerName(value.player_id)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {value.week}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {value.trade_value}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {value.tier}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("players");
  const [selectedWeek, setSelectedWeek] = useState<string>("1");
  const [selectedSeason, setSelectedSeason] = useState<string>("2024");
  
  // Sync data hook
  const {
    playerSync,
    statsSync,
    syncPlayers,
    syncWeeklyStats,
    clearPlayerSync,
    clearStatsSync,
  } = useSyncData();

  const {
    data: players = [],
    isLoading: playersLoading,
    error: playersError,
    refetch: refetchPlayers,
  } = useQuery<Player[], Error>({
    queryKey: ["players"],
    queryFn: fetchPlayers,
  });

  const {
    data: weeklyStats = [],
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchWeeklyStats,
  } = useQuery<WeeklyStat[], Error>({
    queryKey: ["weeklyStats"],
    queryFn: () => fetchWeeklyStats(10),
  });

  const {
    data: projections = [],
    isLoading: projectionsLoading,
    error: projectionsError,
    refetch: refetchProjections,
  } = useQuery<Projection[], Error>({
    queryKey: ["projections"],
    queryFn: fetchProjections,
  });

  const {
    data: tradeValues = [],
    isLoading: tradeValuesLoading,
    error: tradeValuesError,
    refetch: refetchTradeValues,
  } = useQuery<TradeValue[], Error>({
    queryKey: ["tradeValues"],
    queryFn: fetchTradeValues,
  });

  const loading =
    playersLoading || statsLoading || projectionsLoading || tradeValuesLoading;
  const error =
    playersError || statsError || projectionsError || tradeValuesError;

  const handleRetry = useCallback(() => {
    refetchPlayers();
    refetchWeeklyStats();
    refetchProjections();
    refetchTradeValues();
  }, [
    refetchPlayers,
    refetchWeeklyStats,
    refetchProjections,
    refetchTradeValues,
  ]);

  const getPlayerName = useCallback(
    (playerId: string | null) => {
      if (!playerId) return "Unknown Player";
      const player = players.find((p) => p.id === playerId);
      return player ? player.name : "Unknown Player";
    },
    [players]
  );

  // Sync handlers
  const handlePlayerSync = async () => {
    try {
      await syncPlayers();
      // Auto-refresh data after successful sync
      refetchPlayers();
    } catch (error) {
      console.error('Player sync failed:', error);
    }
  };

  const handleStatsSync = async () => {
    try {
      await syncWeeklyStats(parseInt(selectedWeek), parseInt(selectedSeason));
      // Auto-refresh data after successful sync
      refetchWeeklyStats();
    } catch (error) {
      console.error('Stats sync failed:', error);
    }
  };

  const tabs = [
    { id: "players", label: "Players", icon: Users, count: players.length },
    {
      id: "stats",
      label: "Weekly Stats",
      icon: BarChart3,
      count: weeklyStats.length,
    },
    {
      id: "projections",
      label: "Projections",
      icon: TrendingUp,
      count: projections.length,
    },
    {
      id: "trade-values",
      label: "Trade Values",
      icon: ArrowLeftRight,
      count: tradeValues.length,
    },
    {
      id: "data-sync",
      label: "Data Sync",
      icon: RefreshCw,
      count: 0,
    },
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

  if (error) {
    return (
      <Layout isAuthenticated>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-400 font-bold text-lg mb-2">
            Failed to load data
          </div>
          <div className="text-slate-400 mb-4">{error.message}</div>
          <button
            className="btn-primary px-6 py-2 rounded font-semibold"
            onClick={handleRetry}
          >
            Retry
          </button>
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
            {APP_NAME}
          </h1>
          <p className="text-slate-400 mt-1">{APP_TAGLINE}</p>
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
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-slate-400 hover:text-slate-300"
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
          {activeTab === "players" && (
            <div className="overflow-x-auto">
              <PlayersTable data={players} />
            </div>
          )}

          {activeTab === "stats" && (
            <div className="overflow-x-auto">
              <StatsTable data={weeklyStats} getPlayerName={getPlayerName} />
            </div>
          )}

          {activeTab === "projections" && (
            <div className="overflow-x-auto">
              <ProjectionsTable
                data={projections}
                getPlayerName={getPlayerName}
              />
            </div>
          )}

          {activeTab === "trade-values" && (
            <div className="overflow-x-auto">
              <TradeValuesTable
                data={tradeValues}
                getPlayerName={getPlayerName}
              />
            </div>
          )}

          {activeTab === "data-sync" && (
            <div className="p-6 space-y-6">
              {/* Player Sync Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-emerald-400" />
                  NFL Player Data Sync
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Sync current season player data from ESPN including names, positions, teams, and bye weeks.
                </p>
                
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handlePlayerSync}
                    disabled={playerSync.isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {playerSync.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Syncing Players...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync NFL Players
                      </>
                    )}
                  </Button>
                  
                  {playerSync.result && (
                    <div className="text-sm">
                      <span className="text-emerald-400">
                        Added: {playerSync.result.players_added || 0}
                      </span>
                      <span className="text-blue-400 ml-4">
                        Processed: {playerSync.result.total_processed || 0}
                      </span>
                    </div>
                  )}
                </div>

                {playerSync.error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{playerSync.error}</p>
                  </div>
                )}

                {playerSync.result && playerSync.result.success && (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 text-sm">
                      Player sync completed successfully! Added {playerSync.result.players_added} players.
                    </p>
                  </div>
                )}
              </div>

              {/* Weekly Stats Sync Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                  Weekly Stats Sync
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Sync player statistics for a specific week and season from ESPN.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="week-select" className="text-sm font-medium text-slate-300">
                      Week
                    </Label>
                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select week" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {Array.from({ length: 18 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Week {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="season-input" className="text-sm font-medium text-slate-300">
                      Season
                    </Label>
                    <Input
                      id="season-input"
                      type="number"
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handleStatsSync}
                    disabled={statsSync.isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {statsSync.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Syncing Stats...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Weekly Stats
                      </>
                    )}
                  </Button>
                  
                  {statsSync.result && (
                    <div className="text-sm">
                      <span className="text-emerald-400">
                        Updated: {statsSync.result.stats_updated || 0}
                      </span>
                      <span className="text-blue-400 ml-4">
                        Processed: {statsSync.result.players_processed || 0}
                      </span>
                    </div>
                  )}
                </div>

                {statsSync.error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{statsSync.error}</p>
                  </div>
                )}

                {statsSync.result && statsSync.result.success && (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 text-sm">
                      Stats sync completed for Week {statsSync.result.week} of {statsSync.result.season}! 
                      Updated {statsSync.result.stats_updated} player records.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Players
                </p>
                <p className="text-2xl font-bold text-white">
                  {players.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Weekly Stats
                </p>
                <p className="text-2xl font-bold text-white">
                  {weeklyStats.length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Projections
                </p>
                <p className="text-2xl font-bold text-white">
                  {projections.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Trade Values
                </p>
                <p className="text-2xl font-bold text-white">
                  {tradeValues.length}
                </p>
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
