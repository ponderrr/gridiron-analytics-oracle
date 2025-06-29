import React, { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// ErrorBoundary for data fetching
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    // Log error if needed
    console.error("ErrorBoundary caught: ", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-400 font-bold text-lg mb-2">
            An error occurred
          </div>
          <div className="text-slate-400 mb-4">{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

const FantasyPointsTest: React.FC = () => {
  const [stats, setStats] = useState<WeeklyStatsInput>({
    passing_yards: 0,
    passing_tds: 0,
    passing_interceptions: 0,
    rushing_yards: 0,
    rushing_tds: 0,
    receiving_yards: 0,
    receiving_tds: 0,
    receptions: 0,
    fumbles_lost: 0,
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
      [field]: parseInt(value) || 0,
    }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      console.log("Calculating fantasy points with stats:", stats);
      console.log("Using scoring format:", scoringFormat);

      const calculatedResult = await calculateFantasyPoints(
        stats,
        DEFAULT_SCORING_SETTINGS[scoringFormat]
      );

      console.log("Calculation result:", calculatedResult);
      setResult(calculatedResult);
    } catch (err) {
      console.error("Error calculating fantasy points:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCalculating(false);
    }
  };

  const loadSampleData = (playerType: "qb" | "rb" | "wr" | "te") => {
    const sampleData = {
      qb: {
        passing_yards: 317,
        passing_tds: 3,
        passing_interceptions: 0,
        rushing_yards: 39,
        rushing_tds: 1,
        receiving_yards: 0,
        receiving_tds: 0,
        receptions: 0,
        fumbles_lost: 0,
      },
      rb: {
        passing_yards: 0,
        passing_tds: 0,
        passing_interceptions: 0,
        rushing_yards: 98,
        rushing_tds: 1,
        receiving_yards: 80,
        receiving_tds: 1,
        receptions: 8,
        fumbles_lost: 0,
      },
      wr: {
        passing_yards: 0,
        passing_tds: 0,
        passing_interceptions: 0,
        rushing_yards: 0,
        rushing_tds: 0,
        receiving_yards: 123,
        receiving_tds: 1,
        receptions: 8,
        fumbles_lost: 0,
      },
      te: {
        passing_yards: 0,
        passing_tds: 0,
        passing_interceptions: 0,
        rushing_yards: 0,
        rushing_tds: 0,
        receiving_yards: 84,
        receiving_tds: 1,
        receptions: 7,
        fumbles_lost: 0,
      },
    };

    setStats(sampleData[playerType]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Fantasy Points Calculator Test
        </h1>
        <p className="text-slate-400">
          Test the fantasy points calculation engine with different stats and
          scoring formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Player Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample Data Buttons */}
            <div className="space-y-2">
              <Label className="text-slate-300">Load Sample Data:</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleData("qb")}
                >
                  QB Sample
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleData("rb")}
                >
                  RB Sample
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleData("wr")}
                >
                  WR Sample
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleData("te")}
                >
                  TE Sample
                </Button>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Passing Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-400">
                Passing
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="col-span-2">
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
                      handleStatChange("passing_interceptions", e.target.value)
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Rushing Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-400">
                Rushing
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Receiving Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-400">
                Receiving
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
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
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Scoring Format */}
            <div className="space-y-2">
              <Label className="text-slate-300">Scoring Format</Label>
              <Select
                value={scoringFormat}
                onValueChange={(value: "standard" | "ppr" | "half_ppr") =>
                  setScoringFormat(value)
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="ppr">PPR (Point Per Reception)</SelectItem>
                  <SelectItem value="half_ppr">
                    Half PPR (0.5 Per Reception)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCalculate}
              className="w-full"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Calculate Fantasy Points"
              )}
            </Button>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Fantasy Points Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">
                    {result.total_points}
                  </div>
                  <p className="text-slate-400">
                    Total Fantasy Points ({result.scoring_format})
                  </p>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">
                    Points Breakdown
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passing:</span>
                      <span className="text-white font-medium">
                        {result.breakdown.passing_points}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rushing:</span>
                      <span className="text-white font-medium">
                        {result.breakdown.rushing_points}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Receiving:</span>
                      <span className="text-white font-medium">
                        {result.breakdown.receiving_points}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Penalties:</span>
                      <span
                        className={`font-medium ${
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

                <Separator className="bg-slate-700" />

                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    <strong>Scoring Rules:</strong>
                  </p>
                  <p>Passing: 1 pt/25 yds, 6 pts/TD, -2 pts/INT</p>
                  <p>Rushing/Receiving: 1 pt/10 yds, 6 pts/TD</p>
                  <p>
                    Receptions:{" "}
                    {scoringFormat === "ppr"
                      ? "1 pt"
                      : scoringFormat === "half_ppr"
                      ? "0.5 pts"
                      : "0 pts"}
                  </p>
                  <p>Fumbles Lost: -2 pts</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">
                  Enter player statistics and click "Calculate Fantasy Points"
                  to see the results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function FantasyPointsTestWithBoundary() {
  return (
    <ErrorBoundary>
      <FantasyPointsTest />
    </ErrorBoundary>
  );
}
