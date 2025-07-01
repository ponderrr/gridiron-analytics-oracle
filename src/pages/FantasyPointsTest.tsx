import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Activity,
  TrendingUp,
  BarChart3,
  Target,
  Brain,
} from "lucide-react";
import Layout from "../components/Layout";
import { FantasyCard } from "@/components/ui/cards/FantasyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  calculateFantasyPoints,
  type WeeklyStatsInput,
  type FantasyPointsResult,
} from "@/lib/fantasyPoints";
import { DEFAULT_SCORING_SETTINGS } from "@/lib/fantasyPoints.constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

const FantasyPointsTest: React.FC = () => {
  const [stats, setStats] = useState<WeeklyStatsInput>({
    passing_yards: "",
    passing_tds: "",
    passing_interceptions: "",
    rushing_yards: "",
    rushing_tds: "",
    receiving_yards: "",
    receiving_tds: "",
    receptions: "",
    fumbles_lost: "",
  });

  const [scoringFormat, setScoringFormat] = useState<
    "standard" | "ppr" | "half_ppr"
  >("standard");
  const [result, setResult] = useState<FantasyPointsResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatChange = (field: keyof WeeklyStatsInput, value: string) => {
    setStats((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Only parse when calculating
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const parsedStats = Object.entries(stats).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: parseInt(value) || 0,
        }),
        {} as WeeklyStatsInput
      );

      const calculatedResult = await calculateFantasyPoints(
        parsedStats,
        DEFAULT_SCORING_SETTINGS[scoringFormat]
      );

      setResult(calculatedResult);
    } catch (err) {
      console.error("Error calculating fantasy points:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCalculating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Layout isAuthenticated>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white flex items-center">
            <Calculator className="h-8 w-8 mr-3 text-emerald-400" />
            Fantasy Points Calculator
          </h1>
          <p className="text-slate-400 mt-1">
            Calculate fantasy points with our advanced scoring engine
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Input Card */}
          <FantasyCard variant="premium" className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="h-6 w-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">
                Player Statistics
              </h3>
            </div>

            <div className="space-y-6">
              {/* Sample Data Buttons */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 -mx-6 px-6 py-4 border-b border-slate-700/50">
                <Button
                  onClick={handleCalculate}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Calculate Fantasy Points"
                  )}
                </Button>
              </div>

              {/* Passing Stats */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-emerald-400">
                  <Activity className="h-5 w-5" />
                  <span>Passing</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passing_yards" className="text-slate-300">
                      Passing Yards
                    </Label>
                    <Input
                      id="passing_yards"
                      type="number"
                      value={stats.passing_yards}
                      onChange={(e) =>
                        handleStatChange("passing_yards", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passing_tds" className="text-slate-300">
                      Passing TDs
                    </Label>
                    <Input
                      id="passing_tds"
                      type="number"
                      value={stats.passing_tds}
                      onChange={(e) =>
                        handleStatChange("passing_tds", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label
                      htmlFor="passing_interceptions"
                      className="text-slate-300"
                    >
                      Interceptions
                    </Label>
                    <Input
                      id="passing_interceptions"
                      type="number"
                      value={stats.passing_interceptions}
                      onChange={(e) =>
                        handleStatChange(
                          "passing_interceptions",
                          e.target.value
                        )
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Rushing Stats */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-blue-400">
                  <TrendingUp className="h-5 w-5" />
                  <span>Rushing</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rushing_yards" className="text-slate-300">
                      Rushing Yards
                    </Label>
                    <Input
                      id="rushing_yards"
                      type="number"
                      value={stats.rushing_yards}
                      onChange={(e) =>
                        handleStatChange("rushing_yards", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rushing_tds" className="text-slate-300">
                      Rushing TDs
                    </Label>
                    <Input
                      id="rushing_tds"
                      type="number"
                      value={stats.rushing_tds}
                      onChange={(e) =>
                        handleStatChange("rushing_tds", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Receiving Stats */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-purple-400">
                  <Target className="h-5 w-5" />
                  <span>Receiving</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiving_yards" className="text-slate-300">
                      Receiving Yards
                    </Label>
                    <Input
                      id="receiving_yards"
                      type="number"
                      value={stats.receiving_yards}
                      onChange={(e) =>
                        handleStatChange("receiving_yards", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiving_tds" className="text-slate-300">
                      Receiving TDs
                    </Label>
                    <Input
                      id="receiving_tds"
                      type="number"
                      value={stats.receiving_tds}
                      onChange={(e) =>
                        handleStatChange("receiving_tds", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receptions" className="text-slate-300">
                      Receptions
                    </Label>
                    <Input
                      id="receptions"
                      type="number"
                      value={stats.receptions}
                      onChange={(e) =>
                        handleStatChange("receptions", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fumbles_lost" className="text-slate-300">
                      Fumbles Lost
                    </Label>
                    <Input
                      id="fumbles_lost"
                      type="number"
                      value={stats.fumbles_lost}
                      onChange={(e) =>
                        handleStatChange("fumbles_lost", e.target.value)
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Scoring Format */}
              <div className="space-y-3">
                <Label className="text-slate-300">Scoring Format</Label>
                <Select
                  value={scoringFormat}
                  onValueChange={(value: "standard" | "ppr" | "half_ppr") =>
                    setScoringFormat(value)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="ppr">
                      PPR (Point Per Reception)
                    </SelectItem>
                    <SelectItem value="half_ppr">
                      Half PPR (0.5 Per Reception)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </FantasyCard>

          {/* Results Card */}
          <FantasyCard variant="elite" className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Fantasy Points Result
              </h3>
            </div>

            {result ? (
              <div className="space-y-6">
                <div className="text-center p-8 bg-slate-800/50 rounded-xl">
                  <div className="text-5xl font-bold text-emerald-400 mb-2">
                    {result.total_points}
                  </div>
                  <p className="text-slate-400">
                    Total Fantasy Points ({result.scoring_format})
                  </p>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Points Breakdown
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Passing</span>
                        <span className="text-emerald-400 font-medium text-lg">
                          {result.breakdown.passing_points}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Rushing</span>
                        <span className="text-blue-400 font-medium text-lg">
                          {result.breakdown.rushing_points}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Receiving</span>
                        <span className="text-purple-400 font-medium text-lg">
                          {result.breakdown.receiving_points}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Penalties</span>
                        <span
                          className={`font-medium text-lg ${
                            result.breakdown.penalty_points < 0
                              ? "text-red-400"
                              : "text-white"
                          }`}
                        >
                          {result.breakdown.penalty_points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-white">
                    Scoring Rules:
                  </p>
                  <div className="space-y-2 text-xs text-slate-400">
                    <p>• Passing: 1 pt/25 yds, 6 pts/TD, -2 pts/INT</p>
                    <p>• Rushing/Receiving: 1 pt/10 yds, 6 pts/TD</p>
                    <p>
                      • Receptions:{" "}
                      {scoringFormat === "ppr"
                        ? "1 pt"
                        : scoringFormat === "half_ppr"
                        ? "0.5 pts"
                        : "0 pts"}
                    </p>
                    <p>• Fumbles Lost: -2 pts</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <BarChart3 className="h-16 w-16 text-slate-600 mb-4" />
                <p className="text-slate-400">
                  Enter player statistics and click "Calculate Fantasy Points"
                  to see the results.
                </p>
              </div>
            )}
          </FantasyCard>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default FantasyPointsTest;
