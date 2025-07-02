import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Download, Upload, Undo, Redo } from "lucide-react";
import { useRankings } from "./RankingsProvider";
import { CreateSetModal } from "./CreateSetModal";
import { toast } from "sonner";

export function RankingsHeader() {
  const { state, dispatch, selectSet, saveRankings, createDefaultRankings } =
    useRankings();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSetChange = (setId: string) => {
    selectSet(setId);
  };

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
    if (!state.currentSet || state.rankedPlayers.length === 0) {
      toast.error("No rankings to export");
      return;
    }

    const csvData = [
      ["Rank", "Player", "Position", "Team", "Tier"],
      ...state.rankedPlayers.map((p) => [
        p.overall_rank.toString(),
        p.player.name,
        p.player.position,
        p.player.team,
        p.tier?.toString() || "",
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Player Rankings</h1>
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
            disabled={!state.currentSet || state.rankedPlayers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">
            Rankings Set:
          </label>
          <Select
            value={state.currentSet?.id || ""}
            onValueChange={handleSetChange}
            disabled={state.loading}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a ranking set..." />
            </SelectTrigger>
            <SelectContent>
              {state.sets.map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  <div className="flex items-center gap-2">
                    <span>{set.name}</span>
                    {set.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={state.loading}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>

        {state.currentSet && state.rankedPlayers.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={createDefaultRankings}
            disabled={state.loading}
          >
            Create Default Rankings
          </Button>
        )}

        <div className="text-sm text-slate-400">
          {state.rankedPlayers.length} players ranked
        </div>
      </div>

      <CreateSetModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
