import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";

export interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    team: string;
    bye_week?: string | number;
    fantasy_points?: number;
    [key: string]: any;
  };
  rank?: number;
  tier?: number;
  isRanked?: boolean;
  isDragging?: boolean;
  onAddToRankings?: (player: any) => void;
  onRemoveFromRankings?: (playerId: string) => void;
  dragHandleProps?: any;
  className?: string;
}

const getPositionColor = (position: string) => {
  switch (position) {
    case "QB":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    case "RB":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "WR":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "TE":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "K":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case "D/ST":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
};

const getTierColor = (tier: number) => {
  switch (tier) {
    case 1:
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case 2:
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case 3:
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case 4:
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case 5:
      return "bg-pink-500/20 text-pink-300 border-pink-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
};

const PlayerCard: React.FC<PlayerCardProps> = React.memo((props) => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  // Accessibility: Announce drag events
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const announce = (msg: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = msg;
      setTimeout(() => {
        if (liveRegionRef.current) liveRegionRef.current.textContent = "";
      }, 1000);
    }
  };

  const {
    player,
    rank,
    tier,
    isRanked = false,
    isDragging = false,
    onAddToRankings,
    onRemoveFromRankings,
    dragHandleProps,
    className,
  } = props;
  // Focus management for drag handle
  const dragHandleRef = useRef<HTMLDivElement>(null);
  return (
    <Card
      className={cn(
        "p-3 transition-all duration-200",
        isDragging
          ? `${themeClasses.BG_TERTIARY} border-primary/50 shadow-lg`
          : `${themeClasses.BG_CARD} border ${themeClasses.BORDER} ${themeClasses.BG_HOVER}`,
        className
      )}
    >
      {/* ARIA live region for announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div className="flex items-center gap-3">
        {isRanked && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            role="button"
            aria-label={`Drag to reorder player ${player.name}`}
            tabIndex={0}
            ref={dragHandleRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                dragHandleProps?.onMouseDown?.(e);
                announce(`Started dragging ${player.name}`);
                setTimeout(() => {
                  dragHandleRef.current?.focus();
                }, 10);
              }
              if (e.key === "Escape") {
                announce(`Cancelled dragging ${player.name}`);
              }
            }}
            onMouseDown={(e) => {
              announce(`Started dragging ${player.name}`);
            }}
            onBlur={() => {
              announce(`Dropped ${player.name}`);
            }}
          >
            <GripVertical className="h-4 w-4 text-slate-400" />
          </div>
        )}

        {isRanked && rank && (
          <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{rank}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${themeClasses.TEXT_PRIMARY} truncate`}>
              {player.name}
            </h4>
            <Badge
              variant="outline"
              className={getPositionColor(player.position)}
            >
              {player.position}
            </Badge>
            <Badge variant="outline" className="text-xs text-slate-400">
              {player.team}
            </Badge>
          </div>
          <div
            className={`flex items-center gap-2 text-xs ${themeClasses.TEXT_TERTIARY}`}
          >
            {player.bye_week && <span>Bye: {player.bye_week}</span>}
            {player.fantasy_points && (
              <span>FP: {player.fantasy_points.toFixed(1)}</span>
            )}
            {tier && (
              <Badge variant="outline" className={getTierColor(tier)}>
                Tier {tier}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {isRanked ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onRemoveFromRankings?.(player.id);
                announce(`Removed ${player.name} from rankings`);
              }}
              className={`h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:ring-2 focus:ring-red-400 focus:outline-none`}
              aria-label={`Remove ${player.name} from rankings`}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddToRankings?.(player);
                announce(`Added ${player.name} to rankings`);
              }}
              className={`h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20 focus:ring-2 focus:ring-green-400 focus:outline-none`}
              aria-label={`Add ${player.name} to rankings`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});

export default PlayerCard;
