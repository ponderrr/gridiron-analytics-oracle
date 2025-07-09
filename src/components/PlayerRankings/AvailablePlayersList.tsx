import React, { useMemo } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import PlayerCard from "@/components/ui/cards/PlayerCard";
import DraftPickCard from "@/components/ui/cards/DraftPickCard";
import { PlayerSearch } from "./PlayerSearch";
import { useRankings, Player } from "./RankingsProvider";
import { DraftPick } from "@/lib/database";
import { LoadingState } from "@/components/ui/common";
import { useResponsiveListDimensions } from "@/hooks/useResponsiveListDimensions";

// Custom outer element for react-window with correct ref typing
const OuterElement = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
OuterElement.displayName = "VirtualizedOuterElement";

export function AvailablePlayersList() {
  const { state, dispatch, getFilteredAvailableItems } = useRankings();
  const { rowHeight, listHeight } = useResponsiveListDimensions();

  const filteredItems = useMemo(
    () => getFilteredAvailableItems(),
    [getFilteredAvailableItems]
  );

  const handleAddToRankings = (item: Player | DraftPick) => {
    dispatch({ type: "PUSH_UNDO", payload: [...state.rankedItems] });
    const newRank = state.rankedItems.length + 1;
    const itemType = "name" in item ? "player" : "pick";
    dispatch({
      type: "ADD_RANKED_ITEM",
      payload: { item, type: itemType, rank: newRank },
    });
  };

  const isPlayer = (item: Player | DraftPick): item is Player => {
    return "name" in item;
  };

  // Virtualized row renderer with Draggable
  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = filteredItems[index];
    if (!item) return null;

    const itemType = isPlayer(item) ? "player" : "pick";

    return (
      <Draggable
        key={item.id}
        draggableId={`available-${itemType}-${item.id}`}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...style, marginBottom: 8 }}
          >
            {isPlayer(item) ? (
              <PlayerCard
                player={{ ...item, bye_week: item.bye_week ?? undefined }}
                isDragging={snapshot.isDragging}
                onAddToRankings={() => handleAddToRankings(item)}
              />
            ) : (
              <DraftPickCard
                pick={item}
                className={snapshot.isDragging ? "opacity-50" : ""}
                onClick={() => handleAddToRankings(item)}
              />
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Available Items
        </h2>
        <PlayerSearch />

        {/* Filter toggles */}
        <div className="flex gap-2 mt-3">
          <Button
            variant={state.showPlayers ? "default" : "outline"}
            size="sm"
            onClick={() =>
              dispatch({
                type: "SET_SHOW_PLAYERS",
                payload: !state.showPlayers,
              })
            }
          >
            Players ({state.availablePlayers.length})
          </Button>
          <Button
            variant={state.showPicks ? "default" : "outline"}
            size="sm"
            onClick={() =>
              dispatch({ type: "SET_SHOW_PICKS", payload: !state.showPicks })
            }
          >
            Draft Picks ({state.availablePicks.length})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-400">
            {filteredItems.length} items found
          </div>
        </div>
        {filteredItems.length === 0 ? (
          state.loading ? (
            <LoadingState
              type="skeleton"
              skeletonCount={6}
              message="Loading items..."
            />
          ) : (
            <LoadingState
              type="spinner"
              message="No items found matching your current filters."
            />
          )
        ) : (
          <Droppable droppableId="available-items" isDropDisabled={true}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="overflow-y-auto max-h-full"
              >
                <List
                  height={listHeight}
                  itemCount={filteredItems.length}
                  itemSize={rowHeight}
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
