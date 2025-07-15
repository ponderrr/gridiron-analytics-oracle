import { useState, useCallback } from "react";

/**
 * Custom hook for managing keyboard drag-and-drop in a list.
 * @template T Item type in the list
 * @param {number} itemCount - Number of items in the list
 * @param {(from: number, to: number) => void} onDrop - Callback when an item is dropped
 * @returns {object} Keyboard drag state and handlers
 */
export function useKeyboardDrag(
  itemCount: number,
  onDrop: (from: number, to: number) => void
) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOrigin, setDragOrigin] = useState<number | null>(null);

  const startDrag = useCallback((index: number) => {
    setDragIndex(index);
    setDragOrigin(index);
  }, []);

  const moveDrag = useCallback(
    (direction: -1 | 1) => {
      setDragIndex((prev) => {
        if (prev === null) return null;
        const newIndex = Math.max(0, Math.min(itemCount - 1, prev + direction));
        return newIndex !== prev ? newIndex : prev;
      });
    },
    [itemCount]
  );

  const dropDrag = useCallback(() => {
    if (dragIndex !== null && dragOrigin !== null && dragIndex !== dragOrigin) {
      onDrop(dragOrigin, dragIndex);
    }
    setDragIndex(null);
    setDragOrigin(null);
  }, [dragIndex, dragOrigin, onDrop]);

  const cancelDrag = useCallback(() => {
    setDragIndex(null);
    setDragOrigin(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (dragIndex === null) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveDrag(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveDrag(1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dropDrag();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelDrag();
      }
    },
    [dragIndex, moveDrag, dropDrag, cancelDrag]
  );

  return {
    dragIndex,
    dragOrigin,
    startDrag,
    moveDrag,
    dropDrag,
    cancelDrag,
    handleKeyDown,
  };
}
