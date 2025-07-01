import React, { useState, ReactNode, useMemo, useCallback } from "react";
import {
  Database,
  Users,
  BarChart3,
  TrendingUp,
  ArrowLeftRight,
} from "lucide-react";
import Layout from "../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Player, WeeklyStat, Projection, TradeValue } from "../lib/database";
import { supabase } from "../integrations/supabase/client";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { appConfig } from "@/config/app";
import ErrorBoundary from "@/components/ErrorBoundary";

// Local database functions moved from database.ts
async function fetchPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase.from("players").select("*");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchPlayers error:", err);
    throw err;
  }
}

async function fetchWeeklyStats(limit = 10): Promise<WeeklyStat[]> {
  try {
    const { data, error } = await supabase
      .from("weekly_stats")
      .select("*")
      .order("week", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchWeeklyStats error:", err);
    throw err;
  }
}

async function fetchProjections(): Promise<Projection[]> {
  try {
    const { data, error } = await supabase.from("projections").select("*");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchProjections error:", err);
    throw err;
  }
}

async function fetchTradeValues(): Promise<TradeValue[]> {
  try {
    const { data, error } = await supabase.from("trade_values").select("*");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchTradeValues error:", err);
    throw err;
  }
}

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
