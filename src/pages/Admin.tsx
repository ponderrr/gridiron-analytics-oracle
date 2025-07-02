import React, {
  useState,
  ReactNode,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { Users } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { ArrowLeftRight } from "lucide-react";
import { RefreshCw } from "lucide-react";
import Layout from "../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Player, WeeklyStat, Projection, TradeValue } from "../lib/database";
import { supabase } from "../integrations/supabase/client";
import { MESSAGE_CONSTANTS } from "@/lib/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEME_CONSTANTS, UI_CONSTANTS } from "@/lib/constants";
import {
  ADMIN_TABS,
  ADMIN_TAB_LABELS,
  SYNC_SECTIONS,
  SYNC_DESCRIPTIONS,
} from "../lib/adminConstants";
import type { ColumnConfig } from "../components/ui/table/AdminTable";
import { formatErrorMessage } from "../lib/validation";

const { ICON_SIZES } = THEME_CONSTANTS;
const { HEIGHT } = UI_CONSTANTS;

const AdminTable = lazy(() =>
  import("../components/ui/table/AdminTable").then((mod) => ({
    default: mod.AdminTable,
  }))
) as unknown as <T>(
  props: import("../components/ui/table/AdminTable").AdminTableProps<T>
) => JSX.Element;

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(ADMIN_TABS.PLAYERS);
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
      console.error(MESSAGE_CONSTANTS.ERROR_PLAYER_SYNC, error);
    }
  };

  const handleStatsSync = async () => {
    try {
      await syncWeeklyStats(parseInt(selectedWeek), parseInt(selectedSeason));
      // Auto-refresh data after successful sync
      refetchWeeklyStats();
    } catch (error) {
      console.error(MESSAGE_CONSTANTS.ERROR_STATS_SYNC, error);
    }
  };

  const tabs = useMemo(
    () => [
      {
        id: ADMIN_TABS.PLAYERS,
        label: ADMIN_TAB_LABELS.PLAYERS,
        icon: Users,
        count: players.length,
      },
      {
        id: ADMIN_TABS.STATS,
        label: ADMIN_TAB_LABELS.STATS,
        icon: BarChart3,
        count: weeklyStats.length,
      },
      {
        id: ADMIN_TABS.PROJECTIONS,
        label: ADMIN_TAB_LABELS.PROJECTIONS,
        icon: TrendingUp,
        count: projections.length,
      },
      {
        id: ADMIN_TABS.TRADE_VALUES,
        label: ADMIN_TAB_LABELS.TRADE_VALUES,
        icon: ArrowLeftRight,
        count: tradeValues.length,
      },
      {
        id: ADMIN_TABS.DATA_SYNC,
        label: ADMIN_TAB_LABELS.DATA_SYNC,
        icon: RefreshCw,
        count: 0,
      },
    ],
    [players.length, weeklyStats.length, projections.length, tradeValues.length]
  );

  // Column definitions for each table type
  const playerColumns: ColumnConfig<Player>[] = [
    { header: "Name", accessor: "name", sortable: true, filterable: true },
    {
      header: "Position",
      accessor: "position",
      sortable: true,
      filterable: true,
    },
    { header: "Team", accessor: "team", sortable: true, filterable: true },
    { header: "Bye Week", accessor: "bye_week", sortable: true },
    {
      header: "Status",
      accessor: (row) => (row.active ? "Active" : "Inactive"),
      sortable: true,
      filterable: true,
      filterFn: (row, filter) =>
        (row.active ? "Active" : "Inactive")
          .toLowerCase()
          .includes(filter.toLowerCase()),
    },
  ];

  const statsColumns: ColumnConfig<WeeklyStat>[] = [
    {
      header: "Player",
      accessor: (row) => getPlayerName(row.player_id),
      sortable: true,
      filterable: true,
      filterFn: (row, filter) =>
        getPlayerName(row.player_id)
          .toLowerCase()
          .includes(filter.toLowerCase()),
    },
    { header: "Week", accessor: "week", sortable: true },
    { header: "Fantasy Points", accessor: "fantasy_points", sortable: true },
    { header: "Passing", accessor: "passing_yards", sortable: true },
    { header: "Rushing", accessor: "rushing_yards", sortable: true },
    { header: "Receiving", accessor: "receptions", sortable: true },
  ];

  const projectionsColumns: ColumnConfig<Projection>[] = [
    {
      header: "Player",
      accessor: (row) => getPlayerName(row.player_id),
      sortable: true,
      filterable: true,
      filterFn: (row, filter) =>
        getPlayerName(row.player_id)
          .toLowerCase()
          .includes(filter.toLowerCase()),
    },
    { header: "Week", accessor: "week", sortable: true },
    {
      header: "Projected Points",
      accessor: "projected_points",
      sortable: true,
    },
    {
      header: "Type",
      accessor: "projection_type",
      sortable: true,
      filterable: true,
    },
    { header: "Confidence", accessor: "confidence_score", sortable: true },
  ];

  const tradeValuesColumns: ColumnConfig<TradeValue>[] = [
    {
      header: "Player",
      accessor: (row) => getPlayerName(row.player_id),
      sortable: true,
      filterable: true,
      filterFn: (row, filter) =>
        getPlayerName(row.player_id)
          .toLowerCase()
          .includes(filter.toLowerCase()),
    },
    { header: "Week", accessor: "week", sortable: true },
    { header: "Trade Value", accessor: "trade_value", sortable: true },
    { header: "Tier", accessor: "tier", sortable: true },
  ];

  if (loading) {
    return (
      <Layout>
        <div className={`flex items-center justify-center ${HEIGHT.H_64}`}>
          <div
            className={`animate-spin rounded-full ${ICON_SIZES.XXL} border-b-2 border-emerald-500`}
          ></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div
          className={`flex flex-col items-center justify-center ${HEIGHT.H_64} text-center`}
        >
          <div className="text-red-400 font-bold text-lg mb-2">
            {MESSAGE_CONSTANTS.FAILED_TO_LOAD_DATA}
          </div>
          <div className="text-slate-400 mb-4">
            {error ? formatErrorMessage(error) : null}
          </div>
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
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Users className={`${ICON_SIZES.XL} mr-3 text-emerald-400`} />
            {MESSAGE_CONSTANTS.APP_NAME}
          </h1>
          <p className="text-slate-400 mt-1">{MESSAGE_CONSTANTS.APP_TAGLINE}</p>
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
                  <Icon className={ICON_SIZES.SM} />
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
          {activeTab === ADMIN_TABS.PLAYERS && (
            <div className="overflow-x-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <AdminTable<Player>
                  columns={playerColumns}
                  data={players}
                  rowKey={(row) => row.id as string}
                  pageSize={20}
                />
              </Suspense>
            </div>
          )}

          {activeTab === ADMIN_TABS.STATS && (
            <div className="overflow-x-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <AdminTable<WeeklyStat>
                  columns={statsColumns}
                  data={weeklyStats}
                  rowKey={(row) => row.id as string}
                  pageSize={20}
                />
              </Suspense>
            </div>
          )}

          {activeTab === ADMIN_TABS.PROJECTIONS && (
            <div className="overflow-x-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <AdminTable<Projection>
                  columns={projectionsColumns}
                  data={projections}
                  rowKey={(row) => row.id as string}
                  pageSize={20}
                />
              </Suspense>
            </div>
          )}

          {activeTab === ADMIN_TABS.TRADE_VALUES && (
            <div className="overflow-x-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <AdminTable<TradeValue>
                  columns={tradeValuesColumns}
                  data={tradeValues}
                  rowKey={(row) => row.id as string}
                  pageSize={20}
                />
              </Suspense>
            </div>
          )}

          {activeTab === ADMIN_TABS.DATA_SYNC && (
            <div className="px-8 space-y-6">
              {/* Player Sync Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Users className={`${ICON_SIZES.MD} mr-2 text-emerald-400`} />
                  {SYNC_SECTIONS.PLAYER_SYNC}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {SYNC_DESCRIPTIONS.PLAYER_SYNC}
                </p>

                <div className="flex items-center justify-between">
                  <Button
                    onClick={handlePlayerSync}
                    disabled={playerSync.isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {playerSync.isLoading ? (
                      <>
                        <span className="mr-2">
                          <LoadingSpinner size="sm" />
                        </span>
                        {MESSAGE_CONSTANTS.SYNCING_PLAYERS_LABEL}
                      </>
                    ) : (
                      <>
                        <RefreshCw className={`${ICON_SIZES.SM} mr-2`} />
                        {MESSAGE_CONSTANTS.SYNC_PLAYERS_LABEL}
                      </>
                    )}
                  </Button>

                  {playerSync.result && (
                    <div className="text-sm">
                      <span className="text-emerald-400">
                        {MESSAGE_CONSTANTS.PLAYERS_ADDED}{" "}
                        {playerSync.result.players_added || 0}
                      </span>
                      <span className="text-blue-400 ml-4">
                        {MESSAGE_CONSTANTS.PLAYERS_PROCESSED}{" "}
                        {playerSync.result.total_processed || 0}
                      </span>
                    </div>
                  )}
                </div>

                {playerSync.error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">
                      {String(playerSync.error)}
                    </p>
                  </div>
                )}

                {playerSync.result && playerSync.result.success && (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 text-sm">
                      {MESSAGE_CONSTANTS.PLAYER_SYNC_SUCCESS}{" "}
                      {playerSync.result.players_added} players.
                    </p>
                  </div>
                )}
              </div>

              {/* Weekly Stats Sync Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <BarChart3
                    className={`${ICON_SIZES.MD} mr-2 text-blue-400`}
                  />
                  {SYNC_SECTIONS.STATS_SYNC}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {SYNC_DESCRIPTIONS.STATS_SYNC}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label
                      htmlFor="week-select"
                      className="text-sm font-medium text-slate-300"
                    >
                      Week
                    </Label>
                    <Select
                      value={selectedWeek}
                      onValueChange={setSelectedWeek}
                    >
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
                    <Label
                      htmlFor="season-input"
                      className="text-sm font-medium text-slate-300"
                    >
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
                        <span className="mr-2">
                          <LoadingSpinner size="sm" />
                        </span>
                        {MESSAGE_CONSTANTS.SYNCING_STATS_LABEL}
                      </>
                    ) : (
                      <>
                        <RefreshCw className={`${ICON_SIZES.SM} mr-2`} />
                        {MESSAGE_CONSTANTS.SYNC_STATS_LABEL}
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
                    <p className="text-red-400 text-sm">
                      {String(statsSync.error)}
                    </p>
                  </div>
                )}

                {statsSync.result && statsSync.result.success && (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 text-sm">
                      Stats sync completed for Week {statsSync.result.week} of{" "}
                      {statsSync.result.season}! Updated{" "}
                      {statsSync.result.stats_updated} player records.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-6">
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
