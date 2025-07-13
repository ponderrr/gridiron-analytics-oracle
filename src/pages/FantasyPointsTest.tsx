import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Loader2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import { FantasyPointsResultModal } from "@/components/modals/FantasyPointsResult";
import { toast } from "sonner";

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

  const [scoringFormat, setScoringFormat] = useState<"standard" | "ppr" | "half_ppr">("standard");
  const [result, setResult] = useState<FantasyPointsResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState(true);
  // Real-time calculation preview
  const [previewResult, setPreviewResult] = useState<FantasyPointsResult | null>(null);

  // Calculate preview when stats change
  useEffect(() => {
    if (!showPreview) return;

    const hasStats = Object.values(stats).some(value => value.trim() !== "");
    if (!hasStats) {
      setPreviewResult(null);
      return;
    }

    const calculatePreview = async () => {
      try {
        const parsedStats = Object.entries(stats).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value.trim() === "" ? 0 : parseInt(value, 10),
          }),
          {} as any
        );

        const scoringSettings = DEFAULT_SCORING_SETTINGS[scoringFormat];
        const calculatedResult = await calculateFantasyPoints(parsedStats, scoringSettings);
        setPreviewResult(calculatedResult);
      } catch (err) {
        setPreviewResult(null);
      }
    };

    const timeoutId = setTimeout(calculatePreview, 500);
    return () => clearTimeout(timeoutId);
  }, [stats, scoringFormat, showPreview]);

  const handleStatChange = (field: keyof WeeklyStatsFormInput, value: string) => {
    setStats((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validate all inputs before parsing
      const validationErrors: string[] = [];

      Object.entries(stats).forEach(([key, value]) => {
        if (value.trim() !== "") {
          const numValue = parseInt(value, 10);
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
          [key]: value.trim() === "" ? 0 : parseInt(value, 10),
        }),
        {} as any
      );

      const scoringSettings = DEFAULT_SCORING_SETTINGS[scoringFormat];
      const calculatedResult = await calculateFantasyPoints(parsedStats, scoringSettings);

      setResult(calculatedResult);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error calculating fantasy points:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearStats = () => {
    setStats({
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
    toast.info("Stats cleared");
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">POINTS CALCULATOR</h1>
            <p className="text-lg text-muted-foreground text-center mb-8">Calculate fantasy points with advanced scoring options and real-time preview</p>
          </motion.div>

          {/* Main Content: use layout div, not Card */}
          <div className="w-full flex flex-col gap-8">
            {/* Scoring Format Card */}
            <Card className="bg-[var(--color-bg-card)]/80 backdrop-blur-md border border-[var(--color-border-primary)] rounded-2xl shadow-xl p-8">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center">
                  <span>Scoring Format</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Select
                      value={scoringFormat}
                      onValueChange={(value: "standard" | "ppr" | "half_ppr") => setScoringFormat(value)}
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="ppr">PPR (Point Per Reception)</SelectItem>
                        <SelectItem value="half_ppr">Half PPR (0.5 Per Reception)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview Bar */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-semibold text-[var(--color-text-primary)]">Live Preview</span>
                  <Switch checked={showPreview} onCheckedChange={setShowPreview} />
                </div>
                <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-8 flex items-center px-4 relative overflow-hidden border border-[var(--color-border-primary)]">
                  {showPreview && previewResult ? (
                    <>
                      <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(previewResult.total_points, 50) * 2}%`, background: 'linear-gradient(90deg, #60a5fa 0%, #34d399 100%)', opacity: 0.2 }} />
                      <span className="relative z-10 text-lg font-bold text-[var(--color-text-primary)]">
                        {previewResult.total_points.toFixed(2)} pts
                      </span>
                    </>
                  ) : (
                    <span className="text-[var(--color-text-secondary)] text-base">{showPreview ? "Enter stats to see preview" : "Preview disabled"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Player Statistics Card */}
            <Card className="bg-[var(--color-bg-card)]/80 backdrop-blur-md border border-[var(--color-border-primary)] rounded-2xl shadow-xl p-8">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center">
                  <span>Player Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Passing Stats */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Passing</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passing_yards" className="text-sm text-[var(--color-text-secondary)]">
                        Passing Yards
                      </Label>
                      <Input
                        id="passing_yards"
                        type="number"
                        value={stats.passing_yards}
                        onChange={(e) => handleStatChange("passing_yards", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passing_tds" className="text-sm text-[var(--color-text-secondary)]">
                        Passing TDs
                      </Label>
                      <Input
                        id="passing_tds"
                        type="number"
                        value={stats.passing_tds}
                        onChange={(e) => handleStatChange("passing_tds", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passing_interceptions" className="text-sm text-[var(--color-text-secondary)]">
                        Interceptions
                      </Label>
                      <Input
                        id="passing_interceptions"
                        type="number"
                        value={stats.passing_interceptions}
                        onChange={(e) => handleStatChange("passing_interceptions", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rushing Stats */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Rushing</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rushing_yards" className="text-sm text-[var(--color-text-secondary)]">
                        Rushing Yards
                      </Label>
                      <Input
                        id="rushing_yards"
                        type="number"
                        value={stats.rushing_yards}
                        onChange={(e) => handleStatChange("rushing_yards", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rushing_tds" className="text-sm text-[var(--color-text-secondary)]">
                        Rushing TDs
                      </Label>
                      <Input
                        id="rushing_tds"
                        type="number"
                        value={stats.rushing_tds}
                        onChange={(e) => handleStatChange("rushing_tds", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Receiving Stats */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Receiving</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="receiving_yards" className="text-sm text-[var(--color-text-secondary)]">
                        Receiving Yards
                      </Label>
                      <Input
                        id="receiving_yards"
                        type="number"
                        value={stats.receiving_yards}
                        onChange={(e) => handleStatChange("receiving_yards", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiving_tds" className="text-sm text-[var(--color-text-secondary)]">
                        Receiving TDs
                      </Label>
                      <Input
                        id="receiving_tds"
                        type="number"
                        value={stats.receiving_tds}
                        onChange={(e) => handleStatChange("receiving_tds", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receptions" className="text-sm text-[var(--color-text-secondary)]">
                        Receptions
                      </Label>
                      <Input
                        id="receptions"
                        type="number"
                        value={stats.receptions}
                        onChange={(e) => handleStatChange("receptions", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Other Stats */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Penalties</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fumbles_lost" className="text-sm text-[var(--color-text-secondary)]">
                        Fumbles Lost
                      </Label>
                      <Input
                        id="fumbles_lost"
                        type="number"
                        value={stats.fumbles_lost}
                        onChange={(e) => handleStatChange("fumbles_lost", e.target.value)}
                        placeholder="0"
                        className="rounded-full"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 w-full">
                  <Button variant="outline" onClick={handleClearStats} className="rounded-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Stats
                  </Button>
                  <Button
                    onClick={handleCalculate}
                    className="bg-primary hover:bg-primary/90 rounded-full"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calculator className="h-4 w-4 mr-2" />
                    )}
                    Calculate Points
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Fantasy Points Result Modal */}
        <FantasyPointsResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          result={result}
          scoringFormat={scoringFormat}
        />
        </div>
      </div>
    </Layout>
  );
};

export default FantasyPointsTest;
