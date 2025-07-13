import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import MappingAnalytics from "@/components/admin/MappingAnalytics";
import MappingReview from "@/components/admin/MappingReview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkMappingResults {
  exact_matches: number;
  fuzzy_matches: number;
  manual_review_needed: number;
  unmapped: number;
  total_processed: number;
}

export default function AdminMapping() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkMappingResults | null>(null);

  const runBulkMapping = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    try {
      // Simulate progress (you can make this real with websockets)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke(
        "bulk-player-mapping",
        {
          body: { action: "run" },
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      if (data?.success) {
        setResults(data.data);
        toast.success("Bulk mapping completed successfully!");
      } else {
        throw new Error(data?.error || "Bulk mapping failed");
      }
    } catch (error: any) {
      console.error("Bulk mapping failed:", error);
      toast.error("Bulk mapping failed: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const runStatsSync = async (week: number) => {
    try {
      toast.info(`Syncing week ${week} stats...`);

      const { data, error } = await supabase.functions.invoke(
        "sync-weekly-stats",
        {
          body: { week, season: 2024 },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success(`Week ${week} stats synced successfully!`);
        console.log("Stats sync result:", data);
      } else {
        throw new Error(data?.error || "Stats sync failed");
      }
    } catch (error: any) {
      console.error("Stats sync failed:", error);
      toast.error(`Week ${week} sync failed: ` + error.message);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Player Mapping System</h1>
          <p className="text-muted-foreground">
            Manage player identity resolution between NFLverse and Sleeper
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="review">Manual Review</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <MappingAnalytics />
          </TabsContent>

          <TabsContent value="review">
            <MappingReview />
          </TabsContent>

          <TabsContent value="bulk">
            <div className="space-y-6">
              {/* Bulk Mapping Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Player Mapping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Run the initial mapping process to link NFLverse players
                    with Sleeper players. This should be run once to establish
                    the baseline mapping.
                  </p>

                  {isRunning && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Processing player mappings... {progress}%
                      </p>
                    </div>
                  )}

                  {results && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center">
                        <Badge variant="default">{results.exact_matches}</Badge>
                        <p className="text-xs">Exact Matches</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="secondary">
                          {results.fuzzy_matches}
                        </Badge>
                        <p className="text-xs">Fuzzy Matches</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline">
                          {results.manual_review_needed}
                        </Badge>
                        <p className="text-xs">Need Review</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="destructive">{results.unmapped}</Badge>
                        <p className="text-xs">Unmapped</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={runBulkMapping}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning ? "Processing..." : "Run Bulk Mapping"}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats Sync Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats Sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Test the stats sync with specific weeks to verify the
                    mapping system is working.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[5, 10, 15, 18].map((week) => (
                      <Button
                        key={week}
                        variant="outline"
                        onClick={() => runStatsSync(week)}
                        className="w-full"
                      >
                        Week {week}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Mapping Database:</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Edge Functions:</span>
                      <Badge variant="default">Deployed</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>NFLVerse API:</span>
                      <Badge variant="default">Accessible</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sleeper Cache:</span>
                      <Badge variant="default">Updated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Mapping Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configuration options for the player mapping system will be
                  available here.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Fuzzy Match Threshold:</span>
                    <Badge variant="outline">0.8 (80%)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Auto-create Mappings:</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Manual Review Required:</span>
                    <Badge variant="secondary">Low Confidence</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
