import React, { useMemo, forwardRef, useImperativeHandle } from "react";
import BaseModal from "../ui/BaseModal";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { Label } from "../ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.tsx";
import { Checkbox } from "../ui/checkbox.tsx";
import { useRankings } from "./RankingsProvider.tsx";
import { toast } from "../ui/sonner.tsx";
import { useModal } from "../../hooks/useModal.ts";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Player } from "../../lib/database.ts";
import { MOCK_AVAILABLE_PLAYERS } from "../../lib/mock/players.ts";

export interface CreateSetModalRef {
  openModal: () => void;
}

export const CreateSetModal = forwardRef<CreateSetModalRef>((_, ref) => {
  const { state, createSet } = useRankings();
  const initialForm = {
    name: "",
  };
  const {
    isOpen,
    openModal,
    closeModal,
    loading,
    setLoading,
    error,
    setError,
    form,
    setForm,
    resetForm,
  } = useModal<typeof initialForm>({ initialForm });

  useImperativeHandle(ref, () => ({
    openModal: () => {
      openModal();
    },
  }));

  // Drag-and-drop state
  const [activeTab, setActiveTab] = React.useState<string>("overall");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [rankingSearchTerm, setRankingSearchTerm] = React.useState("");
  const [rankingActiveTab, setRankingActiveTab] =
    React.useState<string>("overall");
  const [newRanking, setNewRanking] = React.useState<Player[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const allPlayers =
    state.availablePlayers && state.availablePlayers.length > 0
      ? state.availablePlayers
      : MOCK_AVAILABLE_PLAYERS;

  // Helper to get a unique id for a player (use id if present, else name)
  const getPlayerId = (player: Player) =>
    player.id ? String(player.id) : String(player.name);

  // Only show available players not already in newRanking
  const filteredPlayers = allPlayers.filter((player: Player) => {
    const matchesName = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPosition =
      activeTab === "overall" || player.position === activeTab;
    const notInRanking = !newRanking.some(
      (rp) => getPlayerId(rp) === getPlayerId(player)
    );
    return matchesName && matchesPosition && notInRanking;
  });

  // Only show players in newRanking that are not in filteredPlayers (should always be true, but for safety)
  const filteredRanking = newRanking
    .filter(
      (player) =>
        !filteredPlayers.some((ap) => getPlayerId(ap) === getPlayerId(player))
    )
    .filter((player) =>
      player.name.toLowerCase().includes(rankingSearchTerm.toLowerCase())
    )
    .filter(
      (player) =>
        rankingActiveTab === "overall" || player.position === rankingActiveTab
    );

  const onDragEnd = (result: DropResult) => {
    setDragging(false);
    const { source, destination } = result;
    if (!destination) return;
    // Drag from left to right
    if (
      source.droppableId === "availablePlayers" &&
      destination.droppableId === "newRanking"
    ) {
      const player = filteredPlayers[source.index];
      if (!newRanking.find((p) => getPlayerId(p) === getPlayerId(player))) {
        setNewRanking([...newRanking, player]);
      }
    }
    // Reorder within right list
    if (
      source.droppableId === "newRanking" &&
      destination.droppableId === "newRanking"
    ) {
      const updated = Array.from(newRanking);
      const [removed] = updated.splice(source.index, 1);
      updated.splice(destination.index, 0, removed);
      setNewRanking(updated);
    }
    // Remove from right list if dragged to left
    if (
      source.droppableId === "newRanking" &&
      destination.droppableId === "availablePlayers"
    ) {
      const updated = Array.from(newRanking);
      updated.splice(source.index, 1);
      setNewRanking(updated);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeModal}
      className={`sm:max-w-4xl${dragging ? " no-transform" : ""}`}
    >
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Create New Ranking Set</h2>
          <p className="text-muted-foreground">
            Build your custom ranking set by dragging players from the left to
            the right.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault(); /* Save logic here */
          }}
          className="space-y-4"
        >
          <div className="flex items-end gap-4">
            <div className="flex-1 flex flex-col">
              <Label htmlFor="name">Set Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, name: e.currentTarget.value })
                }
                placeholder="My 2024 Rankings"
                required
              />
            </div>
            <Button
              className="rounded-full h-12 px-8"
              type="submit"
              disabled={!form.name.trim() || loading}
              style={{ marginBottom: 0 }}
            >
              {loading ? "Creating..." : "Save Ranking Set"}
            </Button>
          </div>
          <DragDropContext
            onDragStart={() => setDragging(true)}
            onDragEnd={onDragEnd}
          >
            <div className="flex flex-row gap-8 mt-4">
              {/* Left column: Query selector, search, draggable player list */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {["overall", "QB", "RB", "WR", "TE", "K", "DEF"].map(
                    (position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => setActiveTab(position)}
                        className={
                          "px-5 py-2 rounded-full font-medium text-base border border-border transition-all duration-200 relative " +
                          (activeTab === position
                            ? "bg-primary text-white border-primary shadow-lg"
                            : "bg-muted text-foreground hover:bg-primary/10")
                        }
                      >
                        {position === "overall" ? "Overall" : position}
                        {activeTab === position && (
                          <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-pulse pointer-events-none"></span>
                        )}
                      </button>
                    )
                  )}
                </div>
                <Input
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.currentTarget.value)
                  }
                  placeholder="Search players by name..."
                  className="w-full h-12 text-base px-4 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
                <Droppable
                  droppableId="availablePlayers"
                  renderClone={(provided, _snapshot, rubric) => {
                    const player = filteredPlayers[rubric.source.index];
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center gap-4 px-4 py-2 rounded border border-border bg-card shadow-sm cursor-pointer"
                        style={{
                          ...provided.draggableProps.style,
                          zIndex: 9999,
                        }}
                      >
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-base border-2 bg-background border-border text-foreground rounded-full">
                          {player.position}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="font-semibold text-base truncate">
                            {player.name}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground font-medium truncate">
                            {player.team}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col gap-2 mt-4 max-h-[50vh] overflow-y-auto border rounded-lg p-2 bg-muted/30"
                    >
                      {filteredPlayers.map((player: Player, index: number) => (
                        <Draggable
                          key={getPlayerId(player)}
                          draggableId={getPlayerId(player)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center gap-4 px-4 py-2 rounded border border-border bg-card shadow-sm cursor-pointer"
                            >
                              <div className="w-8 h-8 flex items-center justify-center font-bold text-base border-2 bg-background border-border text-foreground rounded-full">
                                {player.position}
                              </div>
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="font-semibold text-base truncate">
                                  {player.name}
                                </span>
                                <span className="ml-2 text-sm text-muted-foreground font-medium truncate">
                                  {player.team}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
              {/* Right column: Droppable new ranking set list */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {["overall", "QB", "RB", "WR", "TE", "K", "DEF"].map(
                    (position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => setRankingActiveTab(position)}
                        className={
                          "px-5 py-2 rounded-full font-medium text-base border border-border transition-all duration-200 relative " +
                          (rankingActiveTab === position
                            ? "bg-primary text-white border-primary shadow-lg"
                            : "bg-muted text-foreground hover:bg-primary/10")
                        }
                      >
                        {position === "overall" ? "Overall" : position}
                        {rankingActiveTab === position && (
                          <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-pulse pointer-events-none"></span>
                        )}
                      </button>
                    )
                  )}
                </div>
                <Input
                  value={rankingSearchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRankingSearchTerm(e.currentTarget.value)
                  }
                  placeholder="Search your ranking set by name..."
                  className="w-full h-12 text-base px-4 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  style={{ marginBottom: "0.5rem" }}
                />
                <Droppable
                  droppableId="newRanking"
                  renderClone={(provided, _snapshot, rubric) => {
                    const idx = rubric.source.index;
                    const player = filteredRanking[idx] ||
                      filteredRanking[0] || {
                        name: "",
                        team: "",
                        position: "",
                      };
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center gap-4 px-4 py-2 rounded border border-border bg-card shadow-sm cursor-pointer"
                        style={{
                          ...provided.draggableProps.style,
                          zIndex: 9999,
                        }}
                      >
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-base border-2 bg-background border-border text-foreground rounded-full">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="font-semibold text-base truncate">
                            {player.name}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground font-medium truncate">
                            {player.team}
                          </span>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-base border-2 bg-background rounded-full ml-auto">
                          {player.position}
                        </div>
                      </div>
                    );
                  }}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto border rounded-lg p-2 bg-muted/30 min-w-[300px]"
                    >
                      {filteredRanking.length === 0 && (
                        <div className="text-muted-foreground text-center py-8">
                          Drag players here to build your set
                        </div>
                      )}
                      {filteredRanking.map((player: Player, index: number) => (
                        <Draggable
                          key={getPlayerId(player)}
                          draggableId={getPlayerId(player)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center gap-4 px-4 py-2 rounded border border-border bg-card shadow-sm cursor-pointer"
                            >
                              <div className="w-8 h-8 flex items-center justify-center font-bold text-base border-2 bg-background border-border text-foreground rounded-full">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="font-semibold text-base truncate">
                                  {player.name}
                                </span>
                                <span className="ml-2 text-sm text-muted-foreground font-medium truncate">
                                  {player.team}
                                </span>
                              </div>
                              <div className="w-8 h-8 flex items-center justify-center font-bold text-base border-2 bg-background rounded-full ml-auto">
                                {player.position}
                              </div>
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
          </DragDropContext>
        </form>
      </div>
    </BaseModal>
  );
});

CreateSetModal.displayName = "CreateSetModal";
