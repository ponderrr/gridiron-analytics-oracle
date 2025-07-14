import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Download, Undo, Redo } from "lucide-react";
import { useRankings } from "./RankingsProvider";
import { CreateSetModal, CreateSetModalRef } from "./CreateSetModal";
import { toast } from "sonner";

export function RankingsHeader() {
  const { state, dispatch, saveRankings, createDefaultRankings } =
    useRankings();
  // Modal open/close state is now lifted here
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handleUndo = () => {
    if (state.undoStack.length > 0) {
      dispatch({ type: "UNDO" });
    }
  };

  const handleRedo = () => {
    if (state.redoStack.length > 0) {
      dispatch({ type: "REDO" });
    }
  };

  const handleExport = () => {
    if (!state.currentSet || state.rankedItems.length === 0) {
      toast.error("No rankings to export");
      return;
    }

    // Helper to derive legacy rankedPlayers from rankedItems
    const rankedPlayers = state.rankedItems
      .filter((item) => item.type === "player" && item.player)
      .map((item) => ({
        player_id: item.player_id!,
        overall_rank: item.overall_rank,
        tier: item.tier,
        notes: item.notes,
        player: item.player!,
      }));

    const csvData = [
      ["Rank", "Player", "Position", "Team", "Bye Week"],
      ...rankedPlayers.map((p) => [
        p.overall_rank.toString(),
        p.player.name,
        p.player.position,
        p.player.team,
        p.player.bye_week ?? "",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.currentSet.name}_rankings.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rankings exported successfully");
  };

  const handleCreateNew = () => {
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Player Rankings</h1>
          {state.currentSet && (
            <Badge variant="outline" className="text-sm">
              {state.currentSet.format === "dynasty" ? "Dynasty" : "Redraft"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {state.saving && (
            <Badge
              variant="outline"
              className="text-yellow-400 border-yellow-400"
            >
              Saving...
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={state.undoStack.length === 0}
            className="p-2"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={state.redoStack.length === 0}
            className="p-2"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={saveRankings}
            disabled={state.saving || !state.currentSet}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!state.currentSet || state.rankedItems.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Create New button positioned above table header */}
      <div className="flex justify-start">
        <Button onClick={handleCreateNew} disabled={state.loading} size="sm" className="rounded-full px-6 font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {state.currentSet && state.rankedItems.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={createDefaultRankings}
            disabled={state.loading}
          >
            Create Default Rankings
          </Button>
        )}
      </div>

      <CreateSetModal isOpen={isCreateModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
