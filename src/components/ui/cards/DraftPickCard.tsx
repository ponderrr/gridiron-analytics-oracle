import React from "react";
import { cn } from "@/lib/utils";
import type { DraftPick } from "@/lib/database";
import "./PlayerCard.css";

interface DraftPickCardProps {
  pick: DraftPick;
  className?: string;
  onClick?: () => void;
}

// Map pick_type to color and indicator
const getPickValueColor = (pick_type: string) => {
  switch (pick_type) {
    case "early_1st":
      return "text-amber-400";
    case "mid_late_1st":
      return "text-emerald-400";
    case "early_2nd":
      return "text-purple-400";
    case "mid_late_2nd":
      return "text-orange-400";
    case "3rd":
      return "text-blue-400";
    case "4th":
      return "text-slate-400";
    default:
      return "text-slate-400";
  }
};

const getPickValueIndicator = (pick_type: string) => {
  switch (pick_type) {
    case "early_1st":
      return "★★★";
    case "mid_late_1st":
      return "★★";
    case "early_2nd":
      return "★";
    default:
      return "";
  }
};

export const DraftPickCard: React.FC<DraftPickCardProps> = ({
  pick,
  className,
  onClick,
}) => {
  const pickDisplay = `${pick.year} ${pick.display_name}`;
  const valueColor = getPickValueColor(pick.pick_type);
  const valueIndicator = getPickValueIndicator(pick.pick_type);

  return (
    <div
      className={cn("interactive-card", className)}
      tabIndex={0}
      onClick={onClick}
      style={{ transition: "all 0.2s ease" }}
      role="button"
      aria-label={`Draft pick card for ${pickDisplay}`}
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
            {pick.description && (
              <span className="text-sm text-muted-foreground">
                {pick.description}
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-secondary rounded-full">
              {pick.pick_type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={cn("text-sm font-medium", valueColor)}>
            {pick.pick_type.replace(/_/g, " ")}
          </div>
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
              width:
                pick.pick_type === "early_1st"
                  ? "90%"
                  : pick.pick_type === "mid_late_1st"
                    ? "75%"
                    : pick.pick_type === "early_2nd"
                      ? "60%"
                      : pick.pick_type === "mid_late_2nd"
                        ? "45%"
                        : pick.pick_type === "3rd"
                          ? "30%"
                          : "15%",
            }}
          />
        </div>
        <span className={cn("text-xs font-medium", valueColor)}>
          {pick.pick_type === "early_1st"
            ? "High"
            : pick.pick_type === "mid_late_1st" ||
                pick.pick_type === "early_2nd"
              ? "Mid"
              : "Late"}
        </span>
      </div>
    </div>
  );
};

export default DraftPickCard;
