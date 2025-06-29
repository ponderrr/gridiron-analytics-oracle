import React, { useState, ReactNode, useMemo, useCallback } from "react";
import {
  Database,
  Users,
  BarChart3,
  TrendingUp,
  ArrowLeftRight,
} from "lucide-react";
import Layout from "../components/Layout";
import { useQuery } from "@/hooks/useQuery";
import {
  fetchPlayers,
  fetchWeeklyStats,
  fetchProjections,
  fetchTradeValues,
  Player,
  WeeklyStat,
  Projection,
  TradeValue,
} from "../lib/database";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { appConfig } from "@/config/app";
import ErrorBoundary from "@/components/ErrorBoundary";

// Reusable Table component
interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
}

function Table<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
}: TableProps<T>) {
  const getCellValue = (row: T, col: TableColumn<T>): ReactNode => {
    if (col.render) {
      return col.render(row);
    }

    // Type-safe property access
    if (col.key in row) {
      const value = row[col.key as keyof T];
      return value != null ? String(value) : "";
    }

    // For custom keys that don't exist on the row, return empty
    return "";
  };

  return (
    <table className="w-full">
      <thead className="bg-slate-700/50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key as string}
              className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-700">
        {data.map((row) => (
          <tr key={rowKey(row)} className="hover:bg-slate-700/30">
            {columns.map((col) => (
              <td
                key={col.key as string}
                className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"
              >
                {getCellValue(row, col)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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

  const memoizedPlayers = useMemo(() => players, [players]);
  const memoizedWeeklyStats = useMemo(() => weeklyStats, [weeklyStats]);
  const memoizedProjections = useMemo(() => projections, [projections]);
  const memoizedTradeValues = useMemo(() => tradeValues, [tradeValues]);

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
              <Table
                columns={[
                  { key: "name", label: "Name" },
                  { key: "position", label: "Position" },
                  { key: "team", label: "Team" },
                  { key: "bye_week", label: "Bye Week" },
                  { key: "active", label: "Status" },
                ]}
                data={memoizedPlayers}
                rowKey={(player) => player.id}
              />
            </div>
          )}

          {activeTab === "stats" && (
            <div className="overflow-x-auto">
              <Table
                columns={[
                  {
                    key: "player",
                    label: "Player",
                    render: (stat) => getPlayerName(stat.player_id),
                  },
                  { key: "week", label: "Week" },
                  { key: "fantasy_points", label: "Fantasy Points" },
                  { key: "passing_yards", label: "Passing" },
                  { key: "rushing_yards", label: "Rushing" },
                  { key: "receptions", label: "Receiving" },
                ]}
                data={memoizedWeeklyStats}
                rowKey={(stat) => stat.id}
              />
            </div>
          )}

          {activeTab === "projections" && (
            <div className="overflow-x-auto">
              <Table
                columns={[
                  {
                    key: "player",
                    label: "Player",
                    render: (projection) => getPlayerName(projection.player_id),
                  },
                  { key: "week", label: "Week" },
                  { key: "projected_points", label: "Projected Points" },
                  { key: "projection_type", label: "Type" },
                  { key: "confidence_score", label: "Confidence" },
                ]}
                data={memoizedProjections}
                rowKey={(projection) => projection.id}
              />
            </div>
          )}

          {activeTab === "trade-values" && (
            <div className="overflow-x-auto">
              <Table
                columns={[
                  {
                    key: "player",
                    label: "Player",
                    render: (value) => getPlayerName(value.player_id),
                  },
                  { key: "week", label: "Week" },
                  { key: "trade_value", label: "Trade Value" },
                  { key: "tier", label: "Tier" },
                ]}
                data={memoizedTradeValues}
                rowKey={(value) => value.id}
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

export default function AdminWithBoundary() {
  return (
    <ErrorBoundary>
      <Admin />
    </ErrorBoundary>
  );
}
