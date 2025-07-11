import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Activity,
  TrendingUp,
  Target,
  Brain,
  Settings,
  Copy,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Eye,
  Share2,
  RotateCcw
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { DEFAULT_SCORING_SETTINGS, type ScoringSettings } from "@/lib/fantasyPoints.constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTheme } from "@/contexts/ThemeContext";
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



const getPositionColor = (position: string) => {
  switch (position) {
    case "QB": return "bg-blue-500";
    case "RB": return "bg-green-500";
    case "WR": return "bg-purple-500";
    case "TE": return "bg-orange-500";
    default: return "bg-gray-500";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 30) return "text-green-500";
  if (score >= 20) return "text-blue-500";
  if (score >= 15) return "text-yellow-500";
  if (score >= 10) return "text-orange-500";
  return "text-red-500";
};

const FantasyPointsTest: React.FC = () => {
  const { effectiveTheme } = useTheme();

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
  const [customScoring, setCustomScoring] = useState<ScoringSettings>(DEFAULT_SCORING_SETTINGS.standard);
  const [useCustomScoring, setUseCustomScoring] = useState(false);
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
            [key]: value.trim() === "" ? 0 : Number(value),
          }),
          {} as any
        );

        const scoringSettings = useCustomScoring ? customScoring : DEFAULT_SCORING_SETTINGS[scoringFormat];
        const calculatedResult = await calculateFantasyPoints(parsedStats, scoringSettings);
        setPreviewResult(calculatedResult);
      } catch (err) {
        setPreviewResult(null);
      }
    };

    const timeoutId = setTimeout(calculatePreview, 500);
    return () => clearTimeout(timeoutId);
  }, [stats, scoringFormat, customScoring, useCustomScoring, showPreview]);

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
        {} as any
      );

      const scoringSettings = useCustomScoring ? customScoring : DEFAULT_SCORING_SETTINGS[scoringFormat];
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

  const handleCopyResult = () => {
    if (result) {
      const resultText = `Fantasy Points: ${result.total_points.toFixed(2)}\nScoring: ${scoringFormat.toUpperCase()}\n\nStats:\n${Object.entries(stats).filter(([_, value]) => value.trim() !== "").map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`).join('\n')}`;
      navigator.clipboard.writeText(resultText);
      toast.success("Result copied to clipboard");
    }
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
                <Calculator className="h-8 w-8 text-primary" />
                <span>Fantasy Points Calculator</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Calculate fantasy points with advanced scoring options and real-time preview
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleCopyResult} disabled={!result}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Calculation
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Input */}
            <div className="lg:col-span-2 space-y-6">
                {/* Scoring Format Selection */}
                <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <span>Scoring Format</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Select
                          value={scoringFormat}
                          onValueChange={(value: "standard" | "ppr" | "half_ppr") => setScoringFormat(value)}
                          disabled={useCustomScoring}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="ppr">PPR (Point Per Reception)</SelectItem>
                            <SelectItem value="half_ppr">Half PPR (0.5 Per Reception)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={useCustomScoring}
                          onCheckedChange={setUseCustomScoring}
                        />
                        <Label className="text-sm text-[var(--color-text-primary)]">
                          Custom Scoring
                        </Label>
                      </div>
                    </div>
                    
                    {useCustomScoring && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--color-text-secondary)]">Passing Yards per Point</Label>
                          <Input
                            type="number"
                            value={customScoring.passing_yards_per_point}
                            onChange={(e) => setCustomScoring(prev => ({ ...prev, passing_yards_per_point: Number(e.target.value) }))}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--color-text-secondary)]">Rush/Rec Yards per Point</Label>
                          <Input
                            type="number"
                            value={customScoring.rushing_receiving_yards_per_point}
                            onChange={(e) => setCustomScoring(prev => ({ ...prev, rushing_receiving_yards_per_point: Number(e.target.value) }))}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--color-text-secondary)]">Passing TD Points</Label>
                          <Input
                            type="number"
                            value={customScoring.passing_td_points}
                            onChange={(e) => setCustomScoring(prev => ({ ...prev, passing_td_points: Number(e.target.value) }))}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--color-text-secondary)]">Rush/Rec TD Points</Label>
                          <Input
                            type="number"
                            value={customScoring.rushing_receiving_td_points}
                            onChange={(e) => setCustomScoring(prev => ({ ...prev, rushing_receiving_td_points: Number(e.target.value) }))}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--color-text-secondary)]">Reception Points</Label>
                          <Input
                            type="number"
                            value={customScoring.reception_points}
                            onChange={(e) => setCustomScoring(prev => ({ ...prev, reception_points: Number(e.target.value) }))}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--color-text-secondary)]">Interception Penalty</Label>
                          <Input
                            type="number"
                            value={customScoring.interception_penalty}
                            onChange={(e) => setCustomScoring(prev => ({ ...prev, interception_penalty: Number(e.target.value) }))}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Player Statistics */}
                <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-emerald-500" />
                      <span>Player Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Passing Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-500" />
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
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Rushing Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
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
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Receiving Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-purple-500" />
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
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Other Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
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
                    <div className="flex items-center justify-between pt-4">
                      <Button variant="outline" onClick={handleClearStats}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear Stats
                      </Button>
                      <Button
                        onClick={handleCalculate}
                        className="bg-primary hover:bg-primary/90"
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

              {/* Preview Panel */}
              <div className="space-y-6">
                {/* Real-time Preview */}
                <Card className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[var(--color-text-primary)] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <span>Live Preview</span>
                      </div>
                                             <Switch
                         checked={showPreview}
                         onCheckedChange={setShowPreview}
                       />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                                         {showPreview && previewResult ? (
                       <div className="space-y-4">
                         <div className="text-center">
                           <div className={`text-3xl font-bold ${getScoreColor(previewResult.total_points)}`}>
                             {previewResult.total_points.toFixed(2)}
                           </div>
                           <div className="text-sm text-[var(--color-text-secondary)]">
                             Fantasy Points
                           </div>
                         </div>
                         
                         <div className="space-y-2">
                           {previewResult.breakdown.passing_points > 0 && (
                             <div className="flex items-center justify-between text-sm">
                               <span className="text-[var(--color-text-secondary)]">Passing</span>
                               <span className="font-medium text-blue-500">{previewResult.breakdown.passing_points.toFixed(2)}</span>
                             </div>
                           )}
                           {previewResult.breakdown.rushing_points > 0 && (
                             <div className="flex items-center justify-between text-sm">
                               <span className="text-[var(--color-text-secondary)]">Rushing</span>
                               <span className="font-medium text-green-500">{previewResult.breakdown.rushing_points.toFixed(2)}</span>
                             </div>
                           )}
                           {previewResult.breakdown.receiving_points > 0 && (
                             <div className="flex items-center justify-between text-sm">
                               <span className="text-[var(--color-text-secondary)]">Receiving</span>
                               <span className="font-medium text-purple-500">{previewResult.breakdown.receiving_points.toFixed(2)}</span>
                             </div>
                           )}
                           {previewResult.breakdown.penalty_points < 0 && (
                             <div className="flex items-center justify-between text-sm">
                               <span className="text-[var(--color-text-secondary)]">Penalties</span>
                               <span className="font-medium text-red-500">{previewResult.breakdown.penalty_points.toFixed(2)}</span>
                             </div>
                           )}
                         </div>
                       </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calculator className="h-8 w-8 text-[var(--color-text-secondary)] mx-auto mb-2" />
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {showPreview ? "Enter stats to see preview" : "Preview disabled"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                
              </div>
            </div>
          </div>

        {/* Fantasy Points Result Modal */}
        <FantasyPointsResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          result={result}
          scoringFormat={scoringFormat}
        />
      </div>
    </Layout>
  );
};

export default FantasyPointsTest;
