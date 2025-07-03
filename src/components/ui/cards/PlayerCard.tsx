import React, { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, X } from "lucide-react";

/**
 * Props for the unified PlayerCard component.
 * - Use `player` for rankings use cases (with optional rank/tier/actions/drag).
 * - Use primitive props for dashboard/overview use cases.
 */
export interface UnifiedPlayerCardProps {
  // Rankings use case
  player?: {
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
  // Dashboard/overview use case
  name?: string;
  position?: string;
  team?: string;
  projection?: number;
  points?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  tierLabel?: string;
  image?: string;
  status?: "active" | "injured" | "bye" | "questionable";
  className?: string;
}

// Tier variant keys
export enum TierVariant {
  Default = "default",
  Premium = "premium",
  Elite = "elite",
  Champion = "champion",
}

// Substrings that map to each tier variant
const TIER_LABEL_SUBSTRINGS: Record<TierVariant, string[]> = {
  [TierVariant.Elite]: ["elite"],
  [TierVariant.Champion]: ["champion"],
  [TierVariant.Premium]: ["wr1", "rb1", "qb1"],
  [TierVariant.Default]: [],
};

const cardVariants = {
  [TierVariant.Default]: "bg-slate-800/50 border-slate-700/50",
  [TierVariant.Premium]:
    "bg-gradient-to-br from-blue-900/30 to-slate-800/50 border-blue-500/30",
  [TierVariant.Elite]:
    "bg-gradient-to-br from-purple-900/30 to-slate-800/50 border-purple-500/30",
  [TierVariant.Champion]:
    "bg-gradient-to-br from-yellow-900/30 to-slate-800/50 border-yellow-500/30",
};

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

const getStatusColor = (status?: string) => {
  switch (status) {
    case "injured":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "questionable":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "bye":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    default:
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  }
};

const getTierVariant = (tierLabel?: string): TierVariant => {
  if (!tierLabel) return TierVariant.Default;
  const t = tierLabel.toLowerCase();
  if (TIER_LABEL_SUBSTRINGS[TierVariant.Elite].some((s) => t.includes(s)))
    return TierVariant.Elite;
  if (TIER_LABEL_SUBSTRINGS[TierVariant.Champion].some((s) => t.includes(s)))
    return TierVariant.Champion;
  if (TIER_LABEL_SUBSTRINGS[TierVariant.Premium].some((s) => t.includes(s)))
    return TierVariant.Premium;
  return TierVariant.Default;
};

// SVG background grid pattern for player card
const PLAYER_CARD_GRID_BG =
  "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E\")";

const PlayerCard: React.FC<UnifiedPlayerCardProps> = React.memo((props) => {
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
  // Rankings use case
  if (props.player) {
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
            ? "bg-slate-700/80 border-primary/50 shadow-lg"
            : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50",
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
                  // Optionally move focus after drag
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
              <h4 className="font-medium text-white truncate">{player.name}</h4>
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
            <div className="flex items-center gap-2 text-xs text-slate-400">
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
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:ring-2 focus:ring-red-400 focus:outline-none"
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
                className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20 focus:ring-2 focus:ring-green-400 focus:outline-none"
                aria-label={`Add ${player.name} to rankings`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Dashboard/overview use case
  const {
    name,
    position,
    team,
    projection,
    points,
    trend,
    trendValue,
    tierLabel,
    image,
    status,
    className,
  } = props;
  const variant = getTierVariant(tierLabel);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-2xl border backdrop-blur-sm transition-all duration-300",
        cardVariants[variant],
        className
      )}
      role="region"
      aria-label={`Player card for ${name}, ${position} on ${team}`}
      tabIndex={0}
    >
      <div className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: PLAYER_CARD_GRID_BG,
            }}
          />
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {tierLabel && (
                <span
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    variant === TierVariant.Elite &&
                      "bg-purple-500/20 text-purple-400",
                    variant === TierVariant.Premium &&
                      "bg-blue-500/20 text-blue-400",
                    variant === TierVariant.Champion &&
                      "bg-yellow-500/20 text-yellow-400",
                    variant === TierVariant.Default &&
                      "bg-emerald-500/20 text-emerald-400"
                  )}
                >
                  {tierLabel}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-700 text-white px-2 py-1 rounded text-sm font-medium">
                  {position}
                </span>
                <span className="text-slate-400 font-medium">{team}</span>
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  getStatusColor(status)
                )}
              >
                {(status || "active").toUpperCase()}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {projection && (
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {projection}
                </div>
                <div className="text-xs text-slate-400">PROJECTED</div>
              </div>
            )}
            {points && (
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {points}
                </div>
                <div className="text-xs text-slate-400">LAST WEEK</div>
              </div>
            )}
          </div>
          {trend && trendValue && (
            <div className="mt-4 flex items-center justify-center">
              <span
                className={cn(
                  "text-sm font-medium flex items-center px-3 py-1 rounded-lg",
                  trend === "up" && "text-emerald-400 bg-emerald-500/20",
                  trend === "down" && "text-red-400 bg-red-500/20",
                  trend === "neutral" && "text-slate-400 bg-slate-500/20"
                )}
              >
                {trendValue} vs Avg
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default PlayerCard;
