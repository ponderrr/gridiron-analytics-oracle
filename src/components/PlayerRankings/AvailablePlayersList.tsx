import React, { useState, useMemo } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlayerCard } from "./PlayerCard";
import { PlayerSearch } from "./PlayerSearch";
import { useRankings } from "./RankingsProvider";

const PLAYERS_PER_PAGE = 50;

export function AvailablePlayersList() {
  const { state, dispatch, getFilteredAvailablePlayers } = useRankings();
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlayers = useMemo(
    () => getFilteredAvailablePlayers(),
    [getFilteredAvailablePlayers]
  );

  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  const paginatedPlayers = filteredPlayers.slice(
    startIndex,
    startIndex + PLAYERS_PER_PAGE
  );

  const handleAddToRankings = (player: any) => {
    dispatch({ type: "PUSH_UNDO", payload: [...state.rankedPlayers] });
    const newRank = state.rankedPlayers.length + 1;
    dispatch({ type: "ADD_RANKED_PLAYER", payload: { player, rank: newRank } });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Droppable droppableId="available-players" isDropDisabled={true}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2 overflow-y-auto max-h-full"
            >
              {paginatedPlayers.map((player, index) => (
                <Draggable
                  key={player.id}
                  draggableId={`available-${player.id}`}
                  index={startIndex + index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <PlayerCard
                        player={player}
                        isDragging={snapshot.isDragging}
                        onAddToRankings={handleAddToRankings}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
