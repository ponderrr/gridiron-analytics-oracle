import React, { useMemo } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PlayerCard from "@/components/ui/cards/PlayerCard";
import { PlayerSearch } from "./PlayerSearch";
import { useRankings, Player } from "./RankingsProvider";
import { LoadingState } from "@/components/ui/common";

const ROW_HEIGHT = 80; // px, adjust as needed for PlayerCard
const LIST_HEIGHT = 600; // px, adjust for container

// Custom outer element for react-window with correct ref typing
const OuterElement = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
OuterElement.displayName = "VirtualizedOuterElement";

export function AvailablePlayersList() {
  const { state, dispatch, getFilteredAvailablePlayers } = useRankings();

  const filteredPlayers = useMemo(
    () => getFilteredAvailablePlayers(),
    [getFilteredAvailablePlayers]
  );

  const handleAddToRankings = (player: Player) => {
    dispatch({ type: "PUSH_UNDO", payload: [...state.rankedPlayers] });
    const newRank = state.rankedPlayers.length + 1;
    dispatch({ type: "ADD_RANKED_PLAYER", payload: { player, rank: newRank } });
  };

  // Virtualized row renderer with Draggable
  const Row = ({ index, style }: ListChildComponentProps) => {
    const player = filteredPlayers[index];
    if (!player) return null;
    return (
      <Draggable
        key={player.id}
        draggableId={`available-${player.id}`}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...style, marginBottom: 8 }}
          >
            <PlayerCard
              player={player}
              isDragging={snapshot.isDragging}
              onAddToRankings={handleAddToRankings}
            />
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-4">Available Players</h2>
        <PlayerSearch />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-400">
            {filteredPlayers.length} players found
          </div>
        </div>
        {filteredPlayers.length === 0 ? (
          <LoadingState
            type="skeleton"
            skeletonCount={6}
            message="No players found or loading..."
          />
        ) : (
          <Droppable droppableId="available-players" isDropDisabled={true}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="overflow-y-auto max-h-full"
              >
                <List
                  height={LIST_HEIGHT}
                  itemCount={filteredPlayers.length}
                  itemSize={ROW_HEIGHT}
                  width="100%"
                  outerElementType={OuterElement}
                  style={{ overflowX: "hidden" }}
                >
                  {Row}
                </List>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </div>
  );
}
