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
import { Card } from "@/components/ui/card";
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
import {
  MESSAGE_CONSTANTS,
  UI_CONSTANTS,
  getThemeClasses,
} from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";

// Form state interface for string values
interface WeeklyStatsFormInput {
  passing_yards: string;
  passing_tds: string;
  passing_interceptions: string;
  rushing_yards: string;
  rushing_tds: string;
  receiving_yards: string;
  receiving_tds: string;
  receptions: string;
  fumbles_lost: string;
}

const FantasyPointsTest: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  const [stats, setStats] = useState<WeeklyStatsFormInput>({
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

  const handleStatChange = (
    field: keyof WeeklyStatsFormInput,
    value: string,
  ) => {
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
      // Validate all inputs before parsing
      const validationErrors: string[] = [];

      Object.entries(stats).forEach(([key, value]) => {
        if (value.trim() !== "") {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            const fieldName = key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            validationErrors.push(`${fieldName} must be a valid number`);
          } else if (numValue < 0) {
            const fieldName = key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            validationErrors.push(`${fieldName} cannot be negative`);
          }
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(`Invalid input: ${validationErrors.join(", ")}`);
      }

      const parsedStats = Object.entries(stats).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value.trim() === "" ? 0 : Number(value),
        }),
        {} as import("@/lib/fantasyPoints").WeeklyStatsInput,
      );

      const calculatedResult = await calculateFantasyPoints(
        parsedStats,
        DEFAULT_SCORING_SETTINGS[scoringFormat],
      );

      setResult(calculatedResult);
    } catch (err) {
      console.error(MESSAGE_CONSTANTS.ERROR_FANTASY_POINTS, err);
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
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1
            className={`text-4xl font-bold ${themeClasses.TEXT_PRIMARY} flex items-center`}
          >
            <Calculator className="h-8 w-8 mr-3 text-emerald-400" />
            Fantasy Points Calculator
          </h1>
          <p className={`${themeClasses.TEXT_TERTIARY} mt-1`}>
            Calculate fantasy points with our advanced scoring engine
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Input Card */}
          <Card
            className={`p-6 ${themeClasses.BG_CARD} border ${themeClasses.BORDER} ${effectiveTheme === "dark" ? "bg-gradient-to-br from-blue-900/30 to-slate-800/50 border-blue-500/30" : "bg-gradient-to-br from-blue-50/30 to-slate-50/50 border-blue-200/30"}`}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="h-6 w-6 text-emerald-400" />
              <h3
                className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
              >
                Player Statistics
              </h3>
            </div>

            <div className="space-y-6 pb-20">
              {/* Calculate Button - Fixed Position */}
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[calc(100%-3rem)] max-w-xl">
                <Button
                  onClick={handleCalculate}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 py-6 text-lg shadow-lg"
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
                    <Label
                      htmlFor="passing_yards"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Passing Yards
                    </Label>
                    <Input
                      id="passing_yards"
                      type="number"
                      value={stats.passing_yards}
                      onChange={(e) =>
                        handleStatChange("passing_yards", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="passing_tds"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Passing TDs
                    </Label>
                    <Input
                      id="passing_tds"
                      type="number"
                      value={stats.passing_tds}
                      onChange={(e) =>
                        handleStatChange("passing_tds", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label
                      htmlFor="passing_interceptions"
                      className={themeClasses.TEXT_SECONDARY}
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
                          e.target.value,
                        )
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
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
                    <Label
                      htmlFor="rushing_yards"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Rushing Yards
                    </Label>
                    <Input
                      id="rushing_yards"
                      type="number"
                      value={stats.rushing_yards}
                      onChange={(e) =>
                        handleStatChange("rushing_yards", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="rushing_tds"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Rushing TDs
                    </Label>
                    <Input
                      id="rushing_tds"
                      type="number"
                      value={stats.rushing_tds}
                      onChange={(e) =>
                        handleStatChange("rushing_tds", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
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
                    <Label
                      htmlFor="receiving_yards"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Receiving Yards
                    </Label>
                    <Input
                      id="receiving_yards"
                      type="number"
                      value={stats.receiving_yards}
                      onChange={(e) =>
                        handleStatChange("receiving_yards", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="receiving_tds"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Receiving TDs
                    </Label>
                    <Input
                      id="receiving_tds"
                      type="number"
                      value={stats.receiving_tds}
                      onChange={(e) =>
                        handleStatChange("receiving_tds", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="receptions"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Receptions
                    </Label>
                    <Input
                      id="receptions"
                      type="number"
                      value={stats.receptions}
                      onChange={(e) =>
                        handleStatChange("receptions", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="fumbles_lost"
                      className={themeClasses.TEXT_SECONDARY}
                    >
                      Fumbles Lost
                    </Label>
                    <Input
                      id="fumbles_lost"
                      type="number"
                      value={stats.fumbles_lost}
                      onChange={(e) =>
                        handleStatChange("fumbles_lost", e.target.value)
                      }
                      className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                    />
                  </div>
                </div>
              </div>

              {/* Scoring Format */}
              <div className="space-y-3">
                <Label className={themeClasses.TEXT_SECONDARY}>
                  Scoring Format
                </Label>
                <Select
                  value={scoringFormat}
                  onValueChange={(value: "standard" | "ppr" | "half_ppr") =>
                    setScoringFormat(value)
                  }
                >
                  <SelectTrigger
                    className={`${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER}`}
                  >
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
          </Card>

          {/* Results Card */}
          <Card
            className={`p-6 ${themeClasses.BG_CARD} border ${themeClasses.BORDER} ${effectiveTheme === "dark" ? "bg-gradient-to-br from-purple-900/30 to-slate-800/50 border-purple-500/30" : "bg-gradient-to-br from-purple-50/30 to-slate-50/50 border-purple-200/30"}`}
          >
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <h3
                className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
              >
                Fantasy Points Result
              </h3>
            </div>

            {result ? (
              <div className="space-y-6">
                <div
                  className={`text-center p-8 ${themeClasses.BG_SECONDARY} rounded-xl`}
                >
                  <div className="text-5xl font-bold text-emerald-400 mb-2">
                    {result.total_points}
                  </div>
                  <p className={themeClasses.TEXT_TERTIARY}>
                    Total Fantasy Points ({result.scoring_format})
                  </p>
                </div>

                <Separator className={themeClasses.BORDER} />

                <div className="space-y-4">
                  <h3
                    className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
                  >
                    Points Breakdown
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={themeClasses.TEXT_TERTIARY}>
                          Passing
                        </span>
                        <span className="text-emerald-400 font-medium text-lg">
                          {result.breakdown.passing_points}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={themeClasses.TEXT_TERTIARY}>
                          Rushing
                        </span>
                        <span className="text-blue-400 font-medium text-lg">
                          {result.breakdown.rushing_points}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={themeClasses.TEXT_TERTIARY}>
                          Receiving
                        </span>
                        <span className="text-purple-400 font-medium text-lg">
                          {result.breakdown.receiving_points}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={themeClasses.TEXT_TERTIARY}>
                          Penalties
                        </span>
                        <span
                          className={`font-medium text-lg ${
                            result.breakdown.penalty_points < 0
                              ? "text-red-400"
                              : themeClasses.TEXT_PRIMARY
                          }`}
                        >
                          {result.breakdown.penalty_points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className={themeClasses.BORDER} />

                <div
                  className={`space-y-3 ${themeClasses.BG_SECONDARY} p-4 rounded-lg`}
                >
                  <p
                    className={`text-sm font-semibold ${themeClasses.TEXT_PRIMARY}`}
                  >
                    Scoring Rules:
                  </p>
                  <div
                    className={`space-y-2 text-xs ${themeClasses.TEXT_TERTIARY}`}
                  >
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
              <div
                className={`flex flex-col items-center justify-center ${UI_CONSTANTS.HEIGHT.MIN_400} text-center`}
              >
                <BarChart3
                  className={`h-16 w-16 ${themeClasses.TEXT_MUTED} mb-4`}
                />
                <p className={themeClasses.TEXT_TERTIARY}>
                  Enter player statistics and click "Calculate Fantasy Points"
                  to see the results.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default FantasyPointsTest;
