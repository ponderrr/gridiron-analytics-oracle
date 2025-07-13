import React, { useState } from "react";
import { RefreshCw, Users, BarChart3, Target, Zap } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SyncState {
  isLoading: boolean;
  result: any;
  error: string | null;
}

const Admin: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>("1");
  const [selectedSeason, setSelectedSeason] = useState<string>("2024");
  const [etlLoading, setEtlLoading] = useState(false);
  const [nflDataSync, setNflDataSync] = useState<SyncState>({
    isLoading: false,
    result: null,
    error: null,
  });
  const [weeklyStatsSync, setWeeklyStatsSync] = useState<SyncState>({
    isLoading: false,
    result: null,
    error: null,
  });
  const [top200Sync, setTop200Sync] = useState<SyncState>({
    isLoading: false,
    result: null,
    error: null,
  });
  const [dataPopulation, setDataPopulation] = useState<SyncState>({
    isLoading: false,
    result: null,
    error: null,
  });
  const [bulkWeeksSync, setBulkWeeksSync] = useState<SyncState>({
    isLoading: false,
    result: null,
    error: null,
  });
  const [startWeek, setStartWeek] = useState<string>("15");
  const [endWeek, setEndWeek] = useState<string>("18");

  // NFL Data Sync Handler
  const handleNFLDataSync = async () => {
    setNflDataSync({ isLoading: true, result: null, error: null });
    try {
      const { data, error } =
        (await supabase.functions.invoke("sync-nfl-data")) || {};
      if (error) throw error;
      setNflDataSync({ isLoading: false, result: data, error: null });
      toast.success("NFL data sync completed successfully!");
    } catch (error: any) {
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? error.message
          : String(error);
      setNflDataSync({ isLoading: false, result: null, error: errorMsg });
      toast.error("NFL data sync failed: " + errorMsg);
    }
  };

  // Enhanced Weekly Stats Sync Handler (single week)
  const handleWeeklyStatsSync = async () => {
    setWeeklyStatsSync({ isLoading: true, result: null, error: null });
    try {
      const { data, error } =
        (await supabase.functions.invoke("sync-weekly-stats", {
          body: {
            week: parseInt(selectedWeek),
            season: parseInt(selectedSeason),
          },
        })) || {};
      if (error) throw error;
      setWeeklyStatsSync({ isLoading: false, result: data, error: null });
      toast.success(`Week ${selectedWeek} stats sync completed!`);
    } catch (error: any) {
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? error.message
          : String(error);
      setWeeklyStatsSync({ isLoading: false, result: null, error: errorMsg });
      toast.error("Weekly stats sync failed: " + errorMsg);
    }
  };

  // NEW: Bulk Weekly Stats Sync Handler (multiple weeks)
  const handleBulkWeeklyStatsSync = async () => {
    setBulkWeeksSync({ isLoading: true, result: null, error: null });

    const start = parseInt(startWeek);
    const end = parseInt(endWeek);
    const season = parseInt(selectedSeason);

    if (start > end) {
      toast.error("Start week must be less than or equal to end week");
      setBulkWeeksSync({
        isLoading: false,
        result: null,
        error: "Invalid week range",
      });
      return;
    }

    try {
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let week = start; week <= end; week++) {
        try {
          toast.info(`Syncing week ${week}...`);
          const { data, error } = await supabase.functions.invoke(
            "sync-weekly-stats",
            {
              body: { week, season },
            }
          );

          if (error) {
            console.error(`Week ${week} failed:`, error);
            errorCount++;
            results.push(`❌ Week ${week}: ${error.message || "Failed"}`);
          } else {
            successCount++;
            results.push(
              `✅ Week ${week}: ${data?.stats_updated || 0} stats synced`
            );
          }

          // Small delay between requests to be nice to the API
          if (week < end) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (weekError: any) {
          console.error(`Week ${week} error:`, weekError);
          errorCount++;
          results.push(
            `❌ Week ${week}: ${weekError.message || "Unknown error"}`
          );
        }
      }

      const finalResult = {
        summary: `Completed: ${successCount} successful, ${errorCount} failed`,
        details: results.join("\n"),
        successCount,
        errorCount,
      };

      setBulkWeeksSync({ isLoading: false, result: finalResult, error: null });

      if (errorCount === 0) {
        toast.success(`All ${successCount} weeks synced successfully!`);
      } else {
        toast.warning(
          `Sync completed with ${errorCount} errors out of ${successCount + errorCount} weeks`
        );
      }
    } catch (error: any) {
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? error.message
          : String(error);
      setBulkWeeksSync({ isLoading: false, result: null, error: errorMsg });
      toast.error("Bulk sync failed: " + errorMsg);
    }
  };

  // Top 200 Sync Handler
  const handleTop200Sync = async (format: "dynasty" | "redraft") => {
    setTop200Sync({ isLoading: true, result: null, error: null });
    try {
      const { data, error } =
        (await supabase.functions.invoke("sync-top200-pool", {
          body: {
            format,
            season: parseInt(selectedSeason),
          },
        })) || {};
      if (error) throw error;
      setTop200Sync({ isLoading: false, result: data, error: null });
      toast.success(`${format} top 200 sync completed!`);
    } catch (error: any) {
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? error.message
          : String(error);
      setTop200Sync({ isLoading: false, result: null, error: errorMsg });
      toast.error(`${format} top 200 sync failed: ` + errorMsg);
    }
  };

  // Complete Data Population Handler
  const handleCompleteDataPopulation = async () => {
    setDataPopulation({ isLoading: true, result: null, error: null });
    try {
      const season = parseInt(selectedSeason);
      let results: string[] = [];
      toast.info("Step 1: Syncing NFL player data...");
      const { data: nflData, error: nflError } =
        (await supabase.functions.invoke("sync-nfl-data")) || {};
      if (nflError)
        throw new Error(
          "NFL Data sync failed: " + (nflError.message || String(nflError))
        );
      results.push(`✅ Synced ${nflData?.players_processed || 0} players`);
      toast.info("Step 2: Moving players to main table...");
      const { data: cacheData, error: cacheError } =
        (await supabase.functions.invoke("sync-cache-to-main", {
          body: { season, sync_players: true, sync_stats: false },
        })) || {};
      if (cacheError)
        throw new Error(
          "Cache sync failed: " + (cacheError.message || String(cacheError))
        );
      results.push(
        `✅ Moved ${cacheData?.players_synced || 0} players to main table`
      );
      toast.info("Step 3: Loading recent week stats...");
      for (let week = 15; week <= 18; week++) {
        const { error: statsError } =
          (await supabase.functions.invoke("sync-weekly-stats", {
            body: { week, season },
          })) || {};
        if (statsError) console.warn(`Week ${week} sync failed:`, statsError);
      }
      results.push(`✅ Loaded stats for weeks 15-18`);
      toast.info("Step 4: Moving stats to main table...");
      const { data: statsData, error: statsError } =
        (await supabase.functions.invoke("sync-cache-to-main", {
          body: { season, sync_players: false, sync_stats: true },
        })) || {};
      if (statsError)
        throw new Error(
          "Stats sync failed: " + (statsError.message || String(statsError))
        );
      results.push(
        `✅ Moved ${statsData?.stats_synced || 0} stats to main table`
      );
      toast.info("Step 5: Generating top 200 rankings...");
      const { data: dynastyData, error: dynastyError } =
        (await supabase.functions.invoke("sync-top200-pool", {
          body: { format: "dynasty", season },
        })) || {};
      if (dynastyError)
        throw new Error(
          "Dynasty top 200 failed: " +
            (dynastyError.message || String(dynastyError))
        );
      const { data: redraftData, error: redraftError } =
        (await supabase.functions.invoke("sync-top200-pool", {
          body: { format: "redraft", season },
        })) || {};
      if (redraftError)
        throw new Error(
          "Redraft top 200 failed: " +
            (redraftError.message || String(redraftError))
        );
      results.push(
        `✅ Generated dynasty (${dynastyData?.players_processed || 0}) and redraft (${redraftData?.players_processed || 0}) rankings`
      );
      setDataPopulation({
        isLoading: false,
        result: `Complete data population finished!\n\n${results.join("\n")}`,
        error: null,
      });
      toast.success("Complete data population finished successfully!");
    } catch (error: any) {
      const errorMsg =
        typeof error === "object" && error && "message" in error
          ? error.message
          : String(error);
      setDataPopulation({ isLoading: false, result: null, error: errorMsg });
      toast.error("Data population failed: " + errorMsg);
    }
  };

  // Handler for running the full weekly ETL
  const handleRunWeeklyETL = async () => {
    setEtlLoading(true);
    try {
      const { error } =
        (await supabase.functions.invoke("weekly_refresh")) || {};
      if (error) {
        const errorMsg = error.message || String(error);
        toast.error("Weekly ETL failed: " + errorMsg);
      } else {
        toast.success("Weekly ETL started successfully!");
      }
    } catch (err: any) {
      const errorMsg =
        typeof err === "object" && err && "message" in err
          ? err.message
          : String(err);
      toast.error("Weekly ETL failed: " + errorMsg);
    }
    setEtlLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* NFL Player Data Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>NFL Player Data Sync</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Sync current season player data from ESPN including names,
              positions, teams, and bye weeks.
            </p>
            <Button
              onClick={handleNFLDataSync}
              disabled={nflDataSync.isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {nflDataSync.isLoading ? "Syncing Players..." : "Sync Players"}
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Stats Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span>Weekly Stats Sync</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Sync weekly player statistics including passing, rushing,
              receiving, and defensive stats.
            </p>
            {/* Single Week Sync */}
            <div className="mb-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Single Week Sync</h4>
              <div className="flex space-x-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Week</label>
                  <select
                    className="border rounded px-2 py-1 text-gray-900 bg-white"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                  >
                    {Array.from({ length: 18 }, (_, i) => (
                      <option
                        key={i + 1}
                        value={i + 1}
                        className="text-gray-900 bg-white"
                      >{`Week ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Season
                  </label>
                  <input
                    className="border rounded px-2 py-1 text-gray-900 bg-white"
                    type="text"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleWeeklyStatsSync}
                disabled={weeklyStatsSync.isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {weeklyStatsSync.isLoading
                  ? "Syncing Stats..."
                  : "Sync Single Week"}
              </Button>
              {weeklyStatsSync.result && (
                <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                  <strong>Result:</strong>{" "}
                  {JSON.stringify(weeklyStatsSync.result)}
                </div>
              )}
              {weeklyStatsSync.error && (
                <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                  <strong>Error:</strong> {weeklyStatsSync.error}
                </div>
              )}
            </div>
            {/* Bulk Week Sync */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium mb-3">Bulk Week Sync</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sync multiple weeks at once. Recommended: Weeks 15-18 for end of
                2024 season.
              </p>
              <div className="flex space-x-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Week
                  </label>
                  <select
                    className="border rounded px-2 py-1 text-gray-900 bg-white"
                    value={startWeek}
                    onChange={(e) => setStartWeek(e.target.value)}
                  >
                    {Array.from({ length: 18 }, (_, i) => (
                      <option
                        key={i + 1}
                        value={i + 1}
                        className="text-gray-900 bg-white"
                      >{`Week ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Week
                  </label>
                  <select
                    className="border rounded px-2 py-1 text-gray-900 bg-white"
                    value={endWeek}
                    onChange={(e) => setEndWeek(e.target.value)}
                  >
                    {Array.from({ length: 18 }, (_, i) => (
                      <option
                        key={i + 1}
                        value={i + 1}
                        className="text-gray-900 bg-white"
                      >{`Week ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Season
                  </label>
                  <input
                    className="border rounded px-2 py-1 text-gray-900 bg-white"
                    type="text"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleBulkWeeklyStatsSync}
                disabled={bulkWeeksSync.isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {bulkWeeksSync.isLoading
                  ? `Syncing Weeks ${startWeek}-${endWeek}...`
                  : `Sync Weeks ${startWeek}-${endWeek}`}
              </Button>
              {bulkWeeksSync.result && (
                <div className="mt-3 p-3 bg-white rounded border text-sm">
                  <div className="font-medium mb-2">
                    {bulkWeeksSync.result.summary}
                  </div>
                  <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded max-h-40 overflow-y-auto text-gray-900">
                    {bulkWeeksSync.result.details}
                  </pre>
                </div>
              )}
              {bulkWeeksSync.error && (
                <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                  <strong>Error:</strong> {bulkWeeksSync.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top 200 Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <span>Top 200 Rankings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Sync dynasty and redraft top 200 rankings for the current season.
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => handleTop200Sync("dynasty")}
                disabled={top200Sync.isLoading}
              >
                <Target className="h-4 w-4 mr-2" />
                {top200Sync.isLoading
                  ? "Syncing Dynasty Top 200..."
                  : "Sync Dynasty Top 200"}
              </Button>
              <Button
                onClick={() => handleTop200Sync("redraft")}
                disabled={top200Sync.isLoading}
              >
                <Target className="h-4 w-4 mr-2" />
                {top200Sync.isLoading
                  ? "Syncing Redraft Top 200..."
                  : "Sync Redraft Top 200"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complete Data Population */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Complete Data Population</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will run the full ETL process (ADP, stats, players, rankings)
              and refresh all analytics data for the current season.
            </p>
            <Button
              onClick={handleCompleteDataPopulation}
              disabled={dataPopulation.isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {dataPopulation.isLoading
                ? "Running Complete ETL..."
                : "Run Complete ETL"}
            </Button>
          </CardContent>
        </Card>

        {/* Run Full Weekly ETL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Run Full Weekly ETL</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will run the full weekly ETL process (ADP, stats, players)
              and refresh all analytics data. Only use if you want to force a
              full refresh now.
            </p>
            <Button
              onClick={handleRunWeeklyETL}
              disabled={etlLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {etlLoading ? "Running Weekly ETL..." : "Run Weekly ETL"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
