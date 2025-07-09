import React from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type FantasyPointsResult } from "@/lib/fantasyPoints";
import { MESSAGE_CONSTANTS, getThemeClasses } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";

interface FantasyPointsResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FantasyPointsResult | null;
  scoringFormat: "standard" | "ppr" | "half_ppr";
}

export const FantasyPointsResultModal: React.FC<
  FantasyPointsResultModalProps
> = ({ isOpen, onClose, result, scoringFormat }) => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  if (!isOpen || !result) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${themeClasses.BG_CARD} border ${themeClasses.BORDER} shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className={`text-xl font-bold ${themeClasses.TEXT_PRIMARY}`}>
            Fantasy Points Result
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Total Points */}
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

          {/* Points Breakdown */}
          <div className="space-y-4">
            <h3
              className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
            >
              Points Breakdown
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}>
                <div className="flex justify-between items-center">
                  <span className={themeClasses.TEXT_TERTIARY}>Passing</span>
                  <span className="text-emerald-400 font-medium text-lg">
                    {result.breakdown.passing_points}
                  </span>
                </div>
              </div>
              <div className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}>
                <div className="flex justify-between items-center">
                  <span className={themeClasses.TEXT_TERTIARY}>Rushing</span>
                  <span className="text-blue-400 font-medium text-lg">
                    {result.breakdown.rushing_points}
                  </span>
                </div>
              </div>
              <div className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}>
                <div className="flex justify-between items-center">
                  <span className={themeClasses.TEXT_TERTIARY}>Receiving</span>
                  <span className="text-purple-400 font-medium text-lg">
                    {result.breakdown.receiving_points}
                  </span>
                </div>
              </div>
              <div className={`${themeClasses.BG_SECONDARY} p-4 rounded-lg`}>
                <div className="flex justify-between items-center">
                  <span className={themeClasses.TEXT_TERTIARY}>Penalties</span>
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

          {/* Scoring Rules */}
          <div
            className={`space-y-3 ${themeClasses.BG_SECONDARY} p-4 rounded-lg`}
          >
            <p className={`text-sm font-semibold ${themeClasses.TEXT_PRIMARY}`}>
              Scoring Rules:
            </p>
            <div className={`space-y-2 text-xs ${themeClasses.TEXT_TERTIARY}`}>
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

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-700">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
