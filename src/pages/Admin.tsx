import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  RefreshCw,
  Users,
  BarChart3,
  Database,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  FileText,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Eye,
  Filter,
  Search,
  Calendar,
  Zap,
  Globe,
  Server,
  HardDrive,
  Network,
  Cpu,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useSyncData } from "@/hooks/useSyncData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/ui/common";
import SyncStatusDashboard from "@/components/ui/monitoring/SyncStatusDashboard";
import DataQualityMetrics from "@/components/ui/monitoring/DataQualityMetrics";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Mock data for admin dashboard
const mockSystemStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalRankings: 3456,
  dataSyncs: 156,
  systemUptime: 99.8,
  databaseSize: "2.4 GB",
  lastBackup: "2024-01-22T10:30:00Z",
  serverLoad: 45,
  memoryUsage: 67,
  diskUsage: 78,
};

const mockRecentActivity = [
  {
    id: "1",
    type: "data_sync",
    description: "Weekly stats sync completed",
    timestamp: "2024-01-22T15:30:00Z",
    status: "success",
    details: "Updated 1,247 player records",
  },
  {
    id: "2",
    type: "user_registration",
    description: "New user registered",
    timestamp: "2024-01-22T14:45:00Z",
    status: "info",
    details: "User ID: 1247",
  },
  {
    id: "3",
    type: "ranking_created",
    description: "New ranking set created",
    timestamp: "2024-01-22T14:20:00Z",
    status: "success",
    details: "Dynasty Top 200 by user_123",
  },
  {
    id: "4",
    type: "error",
    description: "API rate limit exceeded",
    timestamp: "2024-01-22T13:15:00Z",
    status: "error",
    details: "ESPN API - Retrying in 5 minutes",
  },
];

const mockDataQuality = {
  playerData: 98.5,
  statsData: 97.2,
  projectionData: 95.8,
  tradeValueData: 96.3,
  overallQuality: 97.0,
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "data_sync":
      return RefreshCw;
    case "user_registration":
      return Users;
    case "ranking_created":
      return Target;
    case "error":
      return AlertTriangle;
    default:
      return Activity;
  }
};

const getActivityColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-500";
    case "error":
      return "text-red-500";
    case "warning":
      return "text-yellow-500";
    case "info":
      return "text-blue-500";
    default:
      return "text-gray-500";
  }
};

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWeek, setSelectedWeek] = useState<string>("1");
  const [selectedSeason, setSelectedSeason] = useState<string>("2024");
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlResult, setEtlResult] = useState<string | null>(null);
  const [nflDataSync, setNflDataSync] = useState({ isLoading: false, result: null, error: null });
  const [cacheToMainSync, setCacheToMainSync] = useState({ isLoading: false, result: null, error: null });
  const [weeklyStatsSync, setWeeklyStatsSync] = useState({ isLoading: false, result: null, error: null });
  const [top200Sync, setTop200Sync] = useState({ isLoading: false, result: null, error: null });
  const [dataPopulation, setDataPopulation] = useState({ isLoading: false, result: null, error: null });

  // Sync data hook
  const { playerSync, statsSync, syncPlayers, syncWeeklyStats } = useSyncData();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // NFL Data Sync Handler
  const handleNFLDataSync = async () => {
    setNflDataSync({ isLoading: true, result: null, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("sync-nfl-data");
      if (error) throw error;
      setNflDataSync({ isLoading: false, result: data, error: null });
      toast.success("NFL data sync completed successfully!");
    } catch (error: any) {
      setNflDataSync({ isLoading: false, result: null, error: error.message });
      toast.error("NFL data sync failed: " + error.message);
    }
  };

  // Cache to Main Sync Handler
  const handleCacheToMainSync = async () => {
    setCacheToMainSync({ isLoading: true, result: null, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("sync-cache-to-main", {
        body: { season: parseInt(selectedSeason) }
      });
      if (error) throw error;
      setCacheToMainSync({ isLoading: false, result: data, error: null });
      toast.success("Cache to main sync completed successfully!");
    } catch (error: any) {
      setCacheToMainSync({ isLoading: false, result: null, error: error.message });
      toast.error("Cache to main sync failed: " + error.message);
    }
  };

  // Weekly Stats Sync Handler
  const handleWeeklyStatsSync = async () => {
    setWeeklyStatsSync({ isLoading: true, result: null, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("sync-weekly-stats", {
        body: { 
          week: parseInt(selectedWeek), 
          season: parseInt(selectedSeason) 
        }
      });
      if (error) throw error;
      setWeeklyStatsSync({ isLoading: false, result: data, error: null });
      toast.success(`Week ${selectedWeek} stats sync completed!`);
    } catch (error: any) {
      setWeeklyStatsSync({ isLoading: false, result: null, error: error.message });
      toast.error("Weekly stats sync failed: " + error.message);
    }
  };

  // Top 200 Sync Handler
  const handleTop200Sync = async (format: 'dynasty' | 'redraft') => {
    setTop200Sync({ isLoading: true, result: null, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("sync-top200-pool", {
        body: { 
          format, 
          season: parseInt(selectedSeason) 
        }
      });
      if (error) throw error;
      setTop200Sync({ isLoading: false, result: data, error: null });
      toast.success(`${format} top 200 sync completed!`);
    } catch (error: any) {
      setTop200Sync({ isLoading: false, result: null, error: error.message });
      toast.error(`${format} top 200 sync failed: ` + error.message);
    }
  };

  // Complete Data Population Handler
  const handleCompleteDataPopulation = async () => {
    setDataPopulation({ isLoading: true, result: null, error: null });
    try {
      const season = parseInt(selectedSeason);
      let results = [];
      toast.info("Step 1: Syncing NFL player data...");
      const { data: nflData, error: nflError } = await supabase.functions.invoke("sync-nfl-data");
      if (nflError) throw new Error("NFL Data sync failed: " + nflError.message);
      results.push(`✅ Synced ${nflData.players_processed || 0} players`);
      toast.info("Step 2: Moving players to main table...");
      const { data: cacheData, error: cacheError } = await supabase.functions.invoke("sync-cache-to-main", {
        body: { season, sync_players: true, sync_stats: false }
      });
      if (cacheError) throw new Error("Cache sync failed: " + cacheError.message);
      results.push(`✅ Moved ${cacheData.players_synced || 0} players to main table`);
      toast.info("Step 3: Loading recent week stats...");
      for (let week = 15; week <= 18; week++) {
        const { error: statsError } = await supabase.functions.invoke("sync-weekly-stats", {
          body: { week, season }
        });
        if (statsError) console.warn(`Week ${week} sync failed:`, statsError);
      }
      results.push(`✅ Loaded stats for weeks 15-18`);
      toast.info("Step 4: Moving stats to main table...");
      const { data: statsData, error: statsError } = await supabase.functions.invoke("sync-cache-to-main", {
        body: { season, sync_players: false, sync_stats: true }
      });
      if (statsError) throw new Error("Stats sync failed: " + statsError.message);
      results.push(`✅ Moved ${statsData.stats_synced || 0} stats to main table`);
      toast.info("Step 5: Generating top 200 rankings...");
      const { data: dynastyData, error: dynastyError } = await supabase.functions.invoke("sync-top200-pool", {
        body: { format: 'dynasty', season }
      });
      if (dynastyError) throw new Error("Dynasty top 200 failed: " + dynastyError.message);
      const { data: redraftData, error: redraftError } = await supabase.functions.invoke("sync-top200-pool", {
        body: { format: 'redraft', season }
      });
      if (redraftError) throw new Error("Redraft top 200 failed: " + redraftError.message);
      results.push(`✅ Generated dynasty (${dynastyData.players_processed || 0}) and redraft (${redraftData.players_processed || 0}) rankings`);
      setDataPopulation({ 
        isLoading: false, 
        result: `Complete data population finished!\n\n${results.join('\n')}`, 
        error: null 
      });
      toast.success("Complete data population finished successfully!");
    } catch (error: any) {
      setDataPopulation({ isLoading: false, result: null, error: error.message });
      toast.error("Data population failed: " + error.message);
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary" />
                <span>Admin Dashboard</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                System administration and data management
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Animated Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-xl shadow-lg p-6"
        >
          {/* Tab Navigation */}
          <div className="relative flex mb-8 border-b border-slate-200 dark:border-slate-200/10">
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "overview"
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("overview")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Overview</span>
              </div>
            </button>
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "data-sync"
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("data-sync")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Data Sync</span>
              </div>
            </button>
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "monitoring"
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("monitoring")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Monitoring</span>
              </div>
            </button>
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "users"
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("users")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Users</span>
              </div>
            </button>

            {/* Animated Indicator */}
            <motion.span
              className="absolute bottom-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded"
              initial={false}
              animate={{
                left:
                  activeTab === "overview"
                    ? "0%"
                    : activeTab === "data-sync"
                      ? "25%"
                      : activeTab === "monitoring"
                        ? "50%"
                        : "75%",
                width: "25%",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* System Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              Total Users
                            </p>
                            <p className="text-xl font-bold text-[var(--color-text-primary)]">
                              {mockSystemStats.totalUsers.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              Total Rankings
                            </p>
                            <p className="text-xl font-bold text-[var(--color-text-primary)]">
                              {mockSystemStats.totalRankings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <RefreshCw className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              Data Syncs
                            </p>
                            <p className="text-xl font-bold text-[var(--color-text-primary)]">
                              {mockSystemStats.dataSyncs}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              System Uptime
                            </p>
                            <p className="text-xl font-bold text-[var(--color-text-primary)]">
                              {mockSystemStats.systemUptime}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Health */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                          <Server className="h-5 w-5 text-blue-500" />
                          <span>System Health</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">
                              Server Load
                            </span>
                            <span className="text-[var(--color-text-primary)] font-medium">
                              {mockSystemStats.serverLoad}%
                            </span>
                          </div>
                          <Progress
                            value={mockSystemStats.serverLoad}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">
                              Memory Usage
                            </span>
                            <span className="text-[var(--color-text-primary)] font-medium">
                              {mockSystemStats.memoryUsage}%
                            </span>
                          </div>
                          <Progress
                            value={mockSystemStats.memoryUsage}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">
                              Disk Usage
                            </span>
                            <span className="text-[var(--color-text-primary)] font-medium">
                              {mockSystemStats.diskUsage}%
                            </span>
                          </div>
                          <Progress
                            value={mockSystemStats.diskUsage}
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                          <Database className="h-5 w-5 text-green-500" />
                          <span>Data Quality</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">
                              Player Data
                            </span>
                            <span className="text-[var(--color-text-primary)] font-medium">
                              {mockDataQuality.playerData}%
                            </span>
                          </div>
                          <Progress
                            value={mockDataQuality.playerData}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">
                              Stats Data
                            </span>
                            <span className="text-[var(--color-text-primary)] font-medium">
                              {mockDataQuality.statsData}%
                            </span>
                          </div>
                          <Progress
                            value={mockDataQuality.statsData}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[var(--color-text-secondary)]">
                              Overall Quality
                            </span>
                            <span className="text-[var(--color-text-primary)] font-medium">
                              {mockDataQuality.overallQuality}%
                            </span>
                          </div>
                          <Progress
                            value={mockDataQuality.overallQuality}
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockRecentActivity.map((activity) => {
                          const Icon = getActivityIcon(activity.type);
                          return (
                            <div
                              key={activity.id}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.status)} bg-opacity-10`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                  {activity.details} •{" "}
                                  {formatDate(activity.timestamp)}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  activity.status === "success"
                                    ? "default"
                                    : activity.status === "error"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {activity.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Data Sync Tab */}
              {activeTab === "data-sync" && (
                <div className="space-y-6">
                  {/* Monitoring Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SyncStatusDashboard />
                    <DataQualityMetrics />
                  </div>

                  {/* Player Sync Section */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span>NFL Player Data Sync</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Sync current season player data from ESPN including
                        names, positions, teams, and bye weeks.
                      </p>

                      <div className="flex items-center justify-between">
                        <Button
                          onClick={handleNFLDataSync}
                          disabled={nflDataSync.isLoading}
                        >
                          {nflDataSync.isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Syncing Players...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="h-4 w-4" />
                              <span>Sync Players</span>
                            </div>
                          )}
                        </Button>

                        {nflDataSync.result && (
                          <div className="text-sm space-x-4">
                            <span className="text-green-500">
                              {nflDataSync.result.players_added || 0} players
                              added
                            </span>
                            <span className="text-blue-500">
                              {nflDataSync.result.total_processed || 0} players
                              processed
                            </span>
                          </div>
                        )}
                      </div>

                      {nflDataSync.error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm">
                            {String(nflDataSync.error)}
                          </p>
                        </div>
                      )}

                      {nflDataSync.result && nflDataSync.result.success && (
                        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                          <p className="text-green-400 text-sm">
                            Player sync completed for{" "}
                            {nflDataSync.result.players_added} players.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Weekly Stats Sync Section */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        <span>Weekly Stats Sync</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Sync weekly player statistics including passing,
                        rushing, receiving, and defensive stats.
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="week-select"
                            className="text-sm font-medium text-[var(--color-text-primary)]"
                          >
                            Week
                          </Label>
                          <Select
                            value={selectedWeek}
                            onValueChange={setSelectedWeek}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select week" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 18 }, (_, i) => (
                                <SelectItem
                                  key={i + 1}
                                  value={(i + 1).toString()}
                                >
                                  Week {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label
                            htmlFor="season-input"
                            className="text-sm font-medium text-[var(--color-text-primary)]"
                          >
                            Season
                          </Label>
                          <Input
                            id="season-input"
                            type="number"
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                            className="mt-1"
                            min="2020"
                            max="2030"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          onClick={handleWeeklyStatsSync}
                          disabled={weeklyStatsSync.isLoading}
                        >
                          {weeklyStatsSync.isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Syncing Stats...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="h-4 w-4" />
                              <span>Sync Stats</span>
                            </div>
                          )}
                        </Button>

                        {weeklyStatsSync.result && (
                          <div className="text-sm space-x-4">
                            <span className="text-green-500">
                              Updated:{" "}
                              {weeklyStatsSync.result.stats_updated || 0}
                            </span>
                            <span className="text-blue-500">
                              Processed:{" "}
                              {weeklyStatsSync.result.players_processed || 0}
                            </span>
                          </div>
                        )}
                      </div>

                      {weeklyStatsSync.error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm">
                            {String(weeklyStatsSync.error)}
                          </p>
                        </div>
                      )}

                      {weeklyStatsSync.result &&
                        weeklyStatsSync.result.success && (
                          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">
                              Stats sync completed for Week{" "}
                              {weeklyStatsSync.result.week} of{" "}
                              {weeklyStatsSync.result.season}! Updated{" "}
                              {weeklyStatsSync.result.stats_updated} player
                              records.
                            </p>
                          </div>
                        )}
                    </CardContent>
                  </Card>

                  {/* Top 200 Sync Section */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <Target className="h-5 w-5 text-purple-500" />
                        <span>Top 200 Rankings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Sync dynasty and redraft top 200 rankings for the
                        current season.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleTop200Sync("dynasty")}
                          disabled={top200Sync.isLoading}
                        >
                          {top200Sync.isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Syncing Dynasty Top 200...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4" />
                              <span>Sync Dynasty Top 200</span>
                            </div>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleTop200Sync("redraft")}
                          disabled={top200Sync.isLoading}
                        >
                          {top200Sync.isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Syncing Redraft Top 200...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4" />
                              <span>Sync Redraft Top 200</span>
                            </div>
                          )}
                        </Button>
                      </div>
                      {top200Sync.result && (
                        <div className="text-sm space-x-4">
                          <span className="text-green-500">
                            {top200Sync.result.players_processed || 0} players
                            processed
                          </span>
                        </div>
                      )}
                      {top200Sync.error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm">
                            {String(top200Sync.error)}
                          </p>
                        </div>
                      )}
                      {top200Sync.result && top200Sync.result.success && (
                        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                          <p className="text-green-400 text-sm">
                            Top 200 sync completed for{" "}
                            {top200Sync.result.players_processed || 0} players.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Complete Data Population Section */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <span>Complete Data Population</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        This will run the full ETL process (ADP, stats, players,
                        rankings) and refresh all analytics data for the current
                        season.
                      </p>
                      <Button
                        onClick={handleCompleteDataPopulation}
                        disabled={dataPopulation.isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {dataPopulation.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Running Complete ETL...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4" />
                            <span>Run Complete ETL</span>
                          </div>
                        )}
                      </Button>
                      {dataPopulation.result && (
                        <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-400 text-sm">
                            {dataPopulation.result}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Weekly Refresh ETL Section */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <span>Run Full Weekly ETL</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        This will run the full weekly ETL process (ADP, stats,
                        players) and refresh all analytics data. Only use if you
                        want to force a full refresh now.
                      </p>

                      <Button
                        onClick={handleRunWeeklyETL}
                        disabled={etlLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {etlLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Running Weekly ETL...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4" />
                            <span>Run Weekly ETL</span>
                          </div>
                        )}
                      </Button>

                      {etlResult && (
                        <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-400 text-sm">{etlResult}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Monitoring Tab */}
              {activeTab === "monitoring" && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                      Advanced Monitoring
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      Real-time system monitoring, performance metrics, and
                      alert management.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Configure Monitoring
                    </Button>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                      User Management
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      Manage user accounts, permissions, and access controls.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Admin;
