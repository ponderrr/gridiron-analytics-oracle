import React, {
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
  const initialForm = {
    name: "",
    format: "redraft" as "dynasty" | "redraft",
    copyFromSetId: "",
    copyFromExisting: false,
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
    openModal,
  }));

  useEffect(() => {
    setForm({ ...form, copyFromSetId: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.format]);

  useEffect(() => {
    if (!isOpen) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createSet(
        form.name.trim(),
        form.format,
        form.copyFromExisting && form.copyFromSetId
          ? form.copyFromSetId
          : undefined
      );
      closeModal();
    } catch (error) {
      setError("Failed to create ranking set. Please try again.");
      toast.error("Failed to create ranking set. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const availableSetsForCopy = useMemo(
    () =>
      state.sets.filter(
        (set) => set.format === form.format && set.id !== state.currentSet?.id
      ),
    [state.sets, form.format, state.currentSet?.id]
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My 2024 Rankings"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={form.format}
              onValueChange={(value: "dynasty" | "redraft") =>
                setForm({ ...form, format: value })
              }
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
                  checked={form.copyFromExisting}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, copyFromExisting: !!checked })
                  }
                />
                <Label htmlFor="copyFromExisting" className="text-sm">
                  Copy rankings from existing set
                </Label>
              </div>
              {form.copyFromExisting && (
                <div className="space-y-2">
                  <Label htmlFor="copyFromSet">Copy From</Label>
                  <Select
                    value={form.copyFromSetId}
                    onValueChange={(value) =>
                      setForm({ ...form, copyFromSetId: value })
                    }
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
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
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
              disabled={!form.name.trim() || loading}
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
