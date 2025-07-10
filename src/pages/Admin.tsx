import React, { useState } from "react";
import { RefreshCw, Users, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import { MESSAGE_CONSTANTS } from "@/lib/constants";
import { useSyncData } from "@/hooks/useSyncData";
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
import { THEME_CONSTANTS } from "@/lib/constants";
import {
  ADMIN_TABS,
  ADMIN_TAB_LABELS,
  SYNC_SECTIONS,
  SYNC_DESCRIPTIONS,
} from "@/lib/adminConstants";
import { LoadingState } from "@/components/ui/common";
import SyncStatusDashboard from "@/components/ui/monitoring/SyncStatusDashboard";
import DataQualityMetrics from "@/components/ui/monitoring/DataQualityMetrics";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const { ICON_SIZES } = THEME_CONSTANTS;

// Define tabs outside component to avoid re-creation on every render
const ADMIN_TABS_CONFIG = [
  {
    id: ADMIN_TABS.DATA_SYNC,
    label: ADMIN_TAB_LABELS.DATA_SYNC,
    icon: RefreshCw,
    count: 0,
  },
];

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(ADMIN_TABS.DATA_SYNC);
  const [selectedWeek, setSelectedWeek] = useState<string>("1");
  const [selectedSeason, setSelectedSeason] = useState<string>("2024");
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlResult, setEtlResult] = useState<string | null>(null);

  // Sync data hook
  const { playerSync, statsSync, syncPlayers, syncWeeklyStats } = useSyncData();

  // Sync handlers
  const handlePlayerSync = async () => {
    try {
      await syncPlayers();
      toast.success("Player sync completed successfully!");
    } catch (error) {
      toast.error("Player sync failed. Please try again.");
      console.error(MESSAGE_CONSTANTS.ERROR_PLAYER_SYNC, error);
    }
  };

  const handleStatsSync = async () => {
    try {
      await syncWeeklyStats(
        parseInt(selectedWeek, 10),
        parseInt(selectedSeason, 10)
      );
      toast.success("Stats sync completed successfully!");
    } catch (error) {
      toast.error("Stats sync failed. Please try again.");
      console.error(MESSAGE_CONSTANTS.ERROR_STATS_SYNC, error);
    }
  };

  // Handler for running the full weekly ETL
  const handleRunWeeklyETL = async () => {
    setEtlLoading(true);
    setEtlResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("weekly_refresh");
      if (error) {
        toast.error("Weekly ETL failed: " + error.message);
        setEtlResult("Error: " + error.message);
      } else {
        toast.success("Weekly ETL started successfully!");
        setEtlResult("Success! Weekly ETL started.");
      }
    } catch (err: any) {
      toast.error("Weekly ETL failed: " + err.message);
      setEtlResult("Error: " + err.message);
    }
    setEtlLoading(false);
  };

  const tabs = ADMIN_TABS_CONFIG;

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
          {activeTab === ADMIN_TABS.DATA_SYNC && (
            <div className="px-8 space-y-6">
              {/* Monitoring Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SyncStatusDashboard />
                <DataQualityMetrics />
              </div>

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
                          <LoadingState size="sm" type="spinner" />
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
                          <LoadingState size="sm" type="spinner" />
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

              {/* Weekly Refresh ETL Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <RefreshCw
                    className={`${ICON_SIZES.MD} mr-2 text-emerald-400`}
                  />
                  Run Full Weekly ETL
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  This will run the full weekly ETL process (ADP, stats,
                  players) and refresh all analytics data. Only use if you want
                  to force a full refresh now.
                </p>
                <Button
                  onClick={handleRunWeeklyETL}
                  disabled={etlLoading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {etlLoading ? (
                    <>
                      <span className="mr-2">
                        <LoadingState size="sm" type="spinner" />
                      </span>
                      Running Weekly ETL...
                    </>
                  ) : (
                    <>
                      <RefreshCw className={`${ICON_SIZES.SM} mr-2`} />
                      Run Weekly ETL
                    </>
                  )}
                </Button>
                {etlResult && <div className="mt-4 text-sm">{etlResult}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
