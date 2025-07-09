import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Activity, TrendingUp, Target, Brain } from "lucide-react";
import Layout from "@/components/Layout";
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
import {
  calculateFantasyPoints,
  type FantasyPointsResult,
} from "@/lib/fantasyPoints";
import { DEFAULT_SCORING_SETTINGS } from "@/lib/fantasyPoints.constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MESSAGE_CONSTANTS, getThemeClasses } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { FantasyPointsResultModal } from "@/components/modals/FantasyPointsResult";

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleStatChange = (
    field: keyof WeeklyStatsFormInput,
    value: string
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
        {} as import("@/lib/fantasyPoints").WeeklyStatsInput
      );

      const calculatedResult = await calculateFantasyPoints(
        parsedStats,
        DEFAULT_SCORING_SETTINGS[scoringFormat]
      );

      setResult(calculatedResult);
      setIsModalOpen(true);
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
        <motion.div variants={itemVariants}>
          {/* Player Statistics Card */}
          <Card
            className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} ${effectiveTheme === "dark" ? "bg-gradient-to-br from-blue-900/30 to-slate-800/50 border-blue-500/30" : "bg-gradient-to-br from-blue-50/30 to-slate-50/50 border-blue-200/30"}`}
          >
            {/* Card Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-emerald-400" />
                <h3
                  className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
                >
                  Player Statistics
                </h3>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
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
                          e.target.value
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

            {/* Card Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/30">
              <div className="flex justify-end">
                <Button
                  onClick={handleCalculate}
                  className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 text-lg"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Calculate Fantasy Points"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Fantasy Points Result Modal */}
        <FantasyPointsResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          result={result}
          scoringFormat={scoringFormat}
        />
      </motion.div>
    </Layout>
  );
};

export default FantasyPointsTest;
