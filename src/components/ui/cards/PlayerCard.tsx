import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { LoadingState } from "@/components/ui/common/LoadingState";
import "./PlayerCard.css"; // Import the CSS for micro-interactions

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
  loading?: boolean;
  kbdDragActive?: boolean;
  kbdDragMode?: boolean;
  onKbdDragStart?: () => void;
  onKbdDragDrop?: () => void;
  onKbdDragCancel?: () => void;
  tabIndex?: number;
  "aria-selected"?: boolean;
}

const getPositionColor = (position: string, themeClasses: any) => {
  switch (position) {
    case "QB":
      return `${themeClasses.BG_ACCENT_DANGER} ${themeClasses.TEXT_ACCENT_DANGER} border-red-400`;
    case "RB":
      return `${themeClasses.BG_ACCENT_PRIMARY} ${themeClasses.TEXT_ACCENT_PRIMARY} border-emerald-400`;
    case "WR":
      return `${themeClasses.BG_ACCENT_SECONDARY} ${themeClasses.TEXT_ACCENT_SECONDARY} border-blue-400`;
    case "TE":
      return `${themeClasses.BG_ACCENT_WARNING} ${themeClasses.TEXT_ACCENT_WARNING} border-yellow-400`;
    case "K":
      return `${themeClasses.BG_ACCENT_TERTIARY} ${themeClasses.TEXT_ACCENT_TERTIARY} border-purple-400`;
    case "D/ST":
      return `bg-orange-500/20 text-orange-400 border-orange-400`;
    default:
      return `${themeClasses.BG_TERTIARY} ${themeClasses.TEXT_TERTIARY} border-slate-400`;
  }
};

const getTierColor = (tier: number, themeClasses: any) => {
  switch (tier) {
    case 1:
      return `bg-amber-400/20 text-amber-400 border-amber-400`;
    case 2:
      return `${themeClasses.BG_ACCENT_PRIMARY} ${themeClasses.TEXT_ACCENT_PRIMARY} border-emerald-400`;
    case 3:
      return `${themeClasses.BG_ACCENT_SECONDARY} ${themeClasses.TEXT_ACCENT_SECONDARY} border-blue-400`;
    case 4:
      return `${themeClasses.BG_ACCENT_TERTIARY} ${themeClasses.TEXT_ACCENT_TERTIARY} border-purple-400`;
    case 5:
      return `bg-pink-400/20 text-pink-400 border-pink-400`;
    default:
      return `${themeClasses.BG_TERTIARY} ${themeClasses.TEXT_TERTIARY} border-slate-400`;
  }
};

const areEqual = (prevProps: PlayerCardProps, nextProps: PlayerCardProps) => {
  // Deep compare player object
  const playerKeys = Object.keys(prevProps.player);
  for (const key of playerKeys) {
    if (prevProps.player[key] !== nextProps.player[key]) return false;
  }
  if (prevProps.rank !== nextProps.rank) return false;
  if (prevProps.tier !== nextProps.tier) return false;
  if (prevProps.isRanked !== nextProps.isRanked) return false;
  if (prevProps.isDragging !== nextProps.isDragging) return false;
  if (prevProps.className !== nextProps.className) return false;
  return true;
};

// DragHandle component
const DragHandle: React.FC<{
  playerName: string;
  dragHandleProps?: any;
  dragHandleRef: React.RefObject<HTMLDivElement>;
  announce: (msg: string) => void;
  kbdDragActive?: boolean;
  kbdDragMode?: boolean;
  onKbdDragStart?: () => void;
  onKbdDragDrop?: () => void;
  onKbdDragCancel?: () => void;
  tabIndex?: number;
  "aria-selected"?: boolean;
  themeClasses: any;
}> = ({
  playerName,
  dragHandleProps,
  dragHandleRef,
  announce,
  kbdDragActive,
  kbdDragMode,
  onKbdDragStart,
  onKbdDragDrop,
  onKbdDragCancel,
  tabIndex,
  themeClasses,
  ...rest
}) => (
  <button
    type="button"
    {...dragHandleProps}
    className={cn(
      "cursor-grab active:cursor-grabbing focus:outline-none",
      themeClasses.RING,
      kbdDragActive && `${themeClasses.RING} ${themeClasses.BG_ACTIVE}`
    )}
    role="button"
    aria-label={`Drag to reorder player ${playerName}`}
    aria-grabbed={kbdDragActive ? "true" : "false"}
    tabIndex={tabIndex ?? 0}
    ref={dragHandleRef}
    aria-selected={rest["aria-selected"]}
    onKeyDown={(e) => {
      if (!kbdDragMode && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onKbdDragStart?.();
        announce(`Started keyboard drag for ${playerName}`);
      } else if (kbdDragMode && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onKbdDragDrop?.();
        announce(`Dropped ${playerName}`);
      } else if (kbdDragMode && e.key === "Escape") {
        e.preventDefault();
        onKbdDragCancel?.();
        announce(`Cancelled drag for ${playerName}`);
      }
    }}
    onMouseDown={() => {
      announce(`Started dragging ${playerName}`);
    }}
    onBlur={() => {
      announce(`Dropped ${playerName}`);
    }}
    aria-describedby={`player-card-desc-${playerName}`}
  >
    <GripVertical className={`h-4 w-4 ${themeClasses.TEXT_MUTED}`} />
  </button>
);

// PlayerDisplay component
const PlayerDisplay: React.FC<{
  player: PlayerCardProps["player"];
  rank?: number;
  tier?: number;
  themeClasses: any;
}> = ({ player, rank, tier, themeClasses }) => (
  <>
    {rank && (
      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
        <span className="text-sm font-bold text-primary">{rank}</span>
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <h4 className={`font-medium ${themeClasses.TEXT_PRIMARY} truncate`}>
          {player.name}
        </h4>
        {/* Do not render position badge for K, DEF, or D/ST */}
        {!(player.position === "K" || player.position === "DEF" || player.position === "D/ST") && (
          <Badge
            variant="outline"
            className={getPositionColor(player.position, themeClasses)}
          >
            {player.position}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={`text-xs ${themeClasses.TEXT_MUTED}`}
        >
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
          <Badge variant="outline" className={getTierColor(tier, themeClasses)}>
            Tier {tier}
          </Badge>
        )}
      </div>
    </div>
  </>
);

// RankingControls component
const RankingControls: React.FC<{
  isRanked: boolean;
  player: PlayerCardProps["player"];
  onAddToRankings?: (player: any) => void;
  onRemoveFromRankings?: (playerId: string) => void;
  announce: (msg: string) => void;
  themeClasses: any;
}> = ({
  isRanked,
  player,
  onAddToRankings,
  onRemoveFromRankings,
  announce,
  themeClasses,
}) => (
  <div className="flex-shrink-0">
    {isRanked ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onRemoveFromRankings?.(player.id);
          announce(`Removed ${player.name} from rankings`);
        }}
        className={`h-8 w-8 p-0 ${themeClasses.TEXT_ACCENT_DANGER} ${themeClasses.BG_ACCENT_DANGER} focus:outline-none ${themeClasses.RING}`}
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
        className={`h-8 w-8 p-0 ${themeClasses.TEXT_ACCENT_PRIMARY} ${themeClasses.BG_ACCENT_PRIMARY} focus:outline-none ${themeClasses.RING}`}
        aria-label={`Add ${player.name} to rankings`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    )}
  </div>
);

// Main PlayerCard
const PlayerCard: React.FC<PlayerCardProps> = (props) => {
  const { effectiveTheme } = useTheme();
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
    loading = false,
    kbdDragActive = false,
    kbdDragMode = false,
    onKbdDragStart,
    onKbdDragDrop,
    onKbdDragCancel,
    tabIndex = 0,
    "aria-selected": ariaSelected,
  } = props;
  const dragHandleRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div
        className="interactive-card skeleton-card"
        tabIndex={0}
        aria-busy="true"
        aria-label="Loading player card"
      >
        <LoadingState />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "interactive-card",
        className,
        isDragging && "dragging",
        props.kbdDragActive && "kbd-drag-active"
      )}
      tabIndex={props.tabIndex ?? 0}
      aria-selected={props["aria-selected"]}
      style={{ transition: "all 0.2s ease" }}
    >
      {/* ARIA live region for announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id={`player-card-desc-${player.name}`}
      />
      <div className="flex items-center gap-3">
        {isRanked && (
          <DragHandle
            playerName={player.name}
            dragHandleProps={dragHandleProps}
            dragHandleRef={dragHandleRef}
            announce={announce}
            kbdDragActive={kbdDragActive}
            kbdDragMode={kbdDragMode}
            onKbdDragStart={onKbdDragStart}
            onKbdDragDrop={onKbdDragDrop}
            onKbdDragCancel={onKbdDragCancel}
            tabIndex={tabIndex}
            aria-selected={ariaSelected}
            themeClasses={{
              RING: "ring-2 ring-primary/20",
              BG_ACTIVE: "bg-primary/20",
              TEXT_MUTED: "text-muted-foreground",
              TEXT_PRIMARY: "text-primary",
              BG_ACCENT_DANGER: "bg-red-500/20 text-red-400 border-red-400",
              BG_ACCENT_PRIMARY:
                "bg-emerald-500/20 text-emerald-400 border-emerald-400",
              BG_ACCENT_SECONDARY:
                "bg-blue-500/20 text-blue-400 border-blue-400",
              BG_ACCENT_WARNING:
                "bg-yellow-500/20 text-yellow-400 border-yellow-400",
              BG_ACCENT_TERTIARY:
                "bg-purple-500/20 text-purple-400 border-purple-400",
              BG_TERTIARY: "bg-slate-200 text-slate-600 border-slate-400",
            }}
          />
        )}
        <PlayerDisplay
          player={player}
          rank={isRanked ? rank : undefined}
          tier={tier}
          themeClasses={{
            TEXT_PRIMARY: "text-primary",
            TEXT_MUTED: "text-muted-foreground",
            BG_ACCENT_DANGER: "bg-red-500/20 text-red-400 border-red-400",
            BG_ACCENT_PRIMARY:
              "bg-emerald-500/20 text-emerald-400 border-emerald-400",
            BG_ACCENT_SECONDARY: "bg-blue-500/20 text-blue-400 border-blue-400",
            BG_ACCENT_WARNING:
              "bg-yellow-500/20 text-yellow-400 border-yellow-400",
            BG_ACCENT_TERTIARY:
              "bg-purple-500/20 text-purple-400 border-purple-400",
            BG_TERTIARY: "bg-slate-200 text-slate-600 border-slate-400",
          }}
        />
        <RankingControls
          isRanked={isRanked}
          player={player}
          onAddToRankings={onAddToRankings}
          onRemoveFromRankings={onRemoveFromRankings}
          announce={announce}
          themeClasses={{
            TEXT_ACCENT_DANGER: "text-red-400",
            BG_ACCENT_DANGER: "bg-red-500/20",
            TEXT_ACCENT_PRIMARY: "text-primary",
            BG_ACCENT_PRIMARY: "bg-emerald-500/20",
            RING: "ring-2 ring-primary/20",
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(PlayerCard, areEqual);
