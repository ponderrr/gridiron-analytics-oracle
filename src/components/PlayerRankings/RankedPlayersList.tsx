import React, { useCallback, useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { List, Grid3X3 } from "lucide-react";
import PlayerCard from "@/components/ui/cards/PlayerCard";
import { useRankings } from "./RankingsProvider";
import { positions } from "@/constants/playerData";

export function RankedPlayersList() {
  const { state, dispatch } = useRankings();
  const [viewMode, setViewMode] = React.useState<"linear" | "tiers">("linear");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [kbdDragIndex, setKbdDragIndex] = useState<number | null>(null);
  const [kbdDragOrigin, setKbdDragOrigin] = useState<number | null>(null);

  const handleRemoveFromRankings = useCallback(
    (playerId: string) => {
      dispatch({ type: "PUSH_UNDO", payload: [...state.rankedItems] });
      dispatch({ type: "REMOVE_RANKED_ITEM", payload: playerId });
    },
    [dispatch, state.rankedItems]
  );

  const rankedPlayers = state.rankedItems
    .filter((item) => item.type === "player" && item.player)
    .filter(
      (item) =>
        positionFilter === "all" || item.player!.position === positionFilter
    )
    .map((item) => ({
      player_id: item.player_id!,
      overall_rank: item.overall_rank,
      tier: item.tier,
      notes: item.notes,
      player: item.player!,
    }));

  const groupedByTiers = React.useMemo(() => {
    const tiers = new Map<number, typeof rankedPlayers>();

    rankedPlayers.forEach((player) => {
      const tier = player.tier || 0;
      if (!tiers.has(tier)) {
        tiers.set(tier, []);
      }
      tiers.get(tier)!.push(player);
    });

    return Array.from(tiers.entries())
      .sort(([a], [b]) => a - b)
      .map(([tier, players]) => ({
        tier,
        players: players.sort((a, b) => a.overall_rank - b.overall_rank),
      }));
  }, [rankedPlayers]);

  const getTierName = (tier: number) => {
    switch (tier) {
      case 1:
        return "Elite";
      case 2:
        return "High-End";
      case 3:
        return "Mid-Tier 1";
      case 4:
        return "Mid-Tier 2";
      case 5:
        return "Depth";
      case 6:
        return "Late Round";
      case 7:
        return "Waiver Wire";
      default:
        return "Untiered";
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
      case 6:
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case 7:
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  // Keyboard drag handlers
  const startKbdDrag = (index: number) => {
    setKbdDragIndex(index);
    setKbdDragOrigin(index);
  };
  const moveKbdDrag = (direction: -1 | 1) => {
    if (kbdDragIndex === null) return;
    const newIndex = Math.max(
      0,
      Math.min(rankedPlayers.length - 1, kbdDragIndex + direction)
    );
    if (newIndex !== kbdDragIndex) {
      setKbdDragIndex(newIndex);
    }
  };
  const dropKbdDrag = () => {
    if (
      kbdDragIndex !== null &&
      kbdDragOrigin !== null &&
      kbdDragIndex !== kbdDragOrigin
    ) {
      dispatch({ type: "PUSH_UNDO", payload: [...state.rankedItems] });
      // Move the item in the array
      const updated = [...rankedPlayers];
      const [moved] = updated.splice(kbdDragOrigin, 1);
      updated.splice(kbdDragIndex, 0, moved);
      // Update overall_rank
      const newRankedItems = updated.map((p, i) => ({
        ...state.rankedItems.find((item) => item.player_id === p.player_id)!,
        overall_rank: i + 1,
      }));
      dispatch({ type: "SET_RANKED_ITEMS", payload: newRankedItems });
    }
    setKbdDragIndex(null);
    setKbdDragOrigin(null);
  };
  const cancelKbdDrag = () => {
    setKbdDragIndex(null);
    setKbdDragOrigin(null);
  };

  // Keyboard event handler for the list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (kbdDragIndex === null) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveKbdDrag(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveKbdDrag(1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dropKbdDrag();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelKbdDrag();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Rankings</h2>

        <div className="flex items-center gap-2">
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {position === "all" ? "All Positions" : position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex bg-slate-800 rounded-lg p-1">
            <Button
              variant={viewMode === "linear" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("linear")}
              className="p-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "tiers" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tiers")}
              className="p-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          <Badge variant="outline" className="text-slate-300">
            {rankedPlayers.length} ranked
          </Badge>
        </div>
      </div>

      {rankedPlayers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <p className="text-lg mb-2">No players ranked yet</p>
            <p className="text-sm">
              Drag players from the left or use "Create Default Rankings"
            </p>
          </div>
        </div>
      ) : viewMode === "linear" ? (
        <Droppable droppableId="ranked-players">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto space-y-2 ${snapshot.isDraggingOver ? "bg-primary/5 rounded-lg" : ""}`}
              tabIndex={0}
              onKeyDown={handleListKeyDown}
              aria-label="Ranked players list"
            >
              {rankedPlayers.map((rankedPlayer, index) => (
                <Draggable
                  key={rankedPlayer.player_id}
                  draggableId={`ranked-${rankedPlayer.player_id}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <PlayerCard
                        player={{
                          ...rankedPlayer.player,
                          bye_week: rankedPlayer.player.bye_week ?? undefined,
                        }}
                        rank={rankedPlayer.overall_rank}
                        tier={rankedPlayer.tier}
                        isRanked={true}
                        isDragging={snapshot.isDragging}
                        onRemoveFromRankings={handleRemoveFromRankings}
                        dragHandleProps={provided.dragHandleProps}
                        // Keyboard drag props
                        kbdDragActive={kbdDragIndex === index}
                        kbdDragMode={kbdDragIndex !== null}
                        onKbdDragStart={() => startKbdDrag(index)}
                        onKbdDragDrop={dropKbdDrag}
                        onKbdDragCancel={cancelKbdDrag}
                        tabIndex={
                          kbdDragIndex === null
                            ? 0
                            : kbdDragIndex === index
                              ? 0
                              : -1
                        }
                        aria-selected={kbdDragIndex === index}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {groupedByTiers.map(({ tier, players }) => (
            <div key={tier} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTierColor(tier)}>
                  Tier {tier}: {getTierName(tier)}
                </Badge>
                <span className="text-sm text-slate-400">
                  ({players.length} players)
                </span>
              </div>

              <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                {players.map((rankedPlayer) => (
                  <PlayerCard
                    key={rankedPlayer.player_id}
                    player={{
                      ...rankedPlayer.player,
                      bye_week: rankedPlayer.player.bye_week ?? undefined,
                    }}
                    rank={rankedPlayer.overall_rank}
                    tier={rankedPlayer.tier}
                    isRanked={true}
                    onRemoveFromRankings={handleRemoveFromRankings}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
