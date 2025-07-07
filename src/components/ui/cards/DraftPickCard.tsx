import React from "react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type DraftPick = Database["public"]["Tables"]["draft_picks"]["Row"];

interface DraftPickCardProps {
  pick: DraftPick;
  className?: string;
  onClick?: () => void;
}

const getPickValueColor = (round: number, pick: number) => {
  if (round === 1) {
    if (pick <= 3) return "text-amber-400"; // Gold for top 3
    if (pick <= 6) return "text-emerald-400"; // Green for picks 4-6
    return "text-blue-400"; // Blue for rest of round 1
  }
  if (round === 2) return "text-purple-400"; // Purple for round 2
  if (round === 3) return "text-orange-400"; // Orange for round 3
  return "text-slate-400"; // Gray for round 4+
};

const getPickValueIndicator = (round: number, pick: number) => {
  if (round === 1 && pick <= 3) return "★★★"; // Elite
  if (round === 1 && pick <= 6) return "★★"; // High value
  if (round === 1 || (round === 2 && pick <= 6)) return "★"; // Good value
  return ""; // Standard
};

export const DraftPickCard: React.FC<DraftPickCardProps> = ({
  pick,
  className,
  onClick,
}) => {
  const pickDisplay = `${pick.year} ${pick.round}.${pick.pick.toString().padStart(2, "0")}`;
  const valueColor = getPickValueColor(pick.round, pick.pick);
  const valueIndicator = getPickValueIndicator(pick.round, pick.pick);

  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border border-border p-4 transition-all duration-200",
        "hover:bg-accent hover:border-accent-foreground/20 hover:shadow-lg",
        "cursor-pointer select-none",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">{pickDisplay}</h3>
            {valueIndicator && (
              <span className={cn("text-sm font-medium", valueColor)}>
                {valueIndicator}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-muted-foreground">
              Overall #{pick.overall_pick}
            </span>
            <span className="text-xs px-2 py-1 bg-secondary rounded-full">
              {pick.league_type}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className={cn("text-sm font-medium", valueColor)}>
            Round {pick.round}
          </div>
          <div className="text-xs text-muted-foreground">Pick {pick.pick}</div>
        </div>
      </div>

      {/* Pick value indicator bar */}
      <div className="mt-3 flex items-center space-x-2">
        <div className="flex-1 bg-secondary rounded-full h-1.5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              valueColor.replace("text-", "bg-")
            )}
            style={{
              width: `${Math.max(10, 100 - (pick.round - 1) * 25 - (pick.pick - 1) * 2)}%`,
            }}
          />
        </div>
        <span className={cn("text-xs font-medium", valueColor)}>
          {pick.round === 1 && pick.pick <= 6
            ? "High"
            : pick.round <= 2
              ? "Mid"
              : "Late"}
        </span>
      </div>
    </div>
  );
};

export default DraftPickCard;
