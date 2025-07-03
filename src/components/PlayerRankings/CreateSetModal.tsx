import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRankings } from "./RankingsProvider";
import { toast } from "@/components/ui/sonner";
import { useModal } from "@/hooks/useModal";

export interface CreateSetModalRef {
  openModal: () => void;
}

export const CreateSetModal = forwardRef<CreateSetModalRef>((_, ref) => {
  const { state, createSet } = useRankings();
  const { isOpen, openModal, closeModal, loading, setLoading } = useModal();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"dynasty" | "redraft">("redraft");
  const [copyFromSetId, setCopyFromSetId] = useState("");
  const [copyFromExisting, setCopyFromExisting] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal,
  }));

  useEffect(() => {
    setCopyFromSetId("");
  }, [format]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createSet(
        name.trim(),
        format,
        copyFromExisting && copyFromSetId ? copyFromSetId : undefined
      );

      // Reset form
      setName("");
      setFormat("redraft");
      setCopyFromSetId("");
      setCopyFromExisting(false);
      closeModal();
    } catch (error) {
      toast.error("Failed to create ranking set. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Memoize the filtered sets to avoid unnecessary recomputation
  const availableSetsForCopy = useMemo(
    () =>
      state.sets.filter(
        (set) => set.format === format && set.id !== state.currentSet?.id
      ),
    [state.sets, format, state.currentSet?.id]
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Ranking Set</DialogTitle>
          <DialogDescription>
            Create a new set of player rankings for your fantasy league.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Set Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My 2024 Rankings"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={format}
              onValueChange={(value: "dynasty" | "redraft") => setFormat(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="redraft">Redraft</SelectItem>
                <SelectItem value="dynasty">Dynasty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {availableSetsForCopy.length > 0 && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copyFromExisting"
                  checked={copyFromExisting}
                  onCheckedChange={(checked) => setCopyFromExisting(!!checked)}
                />
                <Label htmlFor="copyFromExisting" className="text-sm">
                  Copy rankings from existing set
                </Label>
              </div>

              {copyFromExisting && (
                <div className="space-y-2">
                  <Label htmlFor="copyFromSet">Copy From</Label>
                  <Select
                    value={copyFromSetId}
                    onValueChange={setCopyFromSetId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a set to copy..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSetsForCopy.map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Set"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CreateSetModal.displayName = "CreateSetModal";
