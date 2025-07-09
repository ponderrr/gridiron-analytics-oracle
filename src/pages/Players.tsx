import React from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import Layout from "@/components/Layout";
import {
  RankingsProvider,
  useRankings,
  RankingsHeader,
  AvailablePlayersList,
  RankedPlayersList,
} from "../components/PlayerRankings";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";

function PlayersContent() {
  const { state, dispatch, saveRankings } = useRankings();
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Save current state for undo/redo
    dispatch({ type: "PUSH_UNDO", payload: [...state.rankedItems] });

    // Handle dragging from available players to rankings
    if (
      source.droppableId === "available-players" &&
      destination.droppableId === "ranked-players"
    ) {
      const playerId = draggableId.replace("available-", "");
      const player = state.availablePlayers.find((p) => p.id === playerId);

      if (player) {
        const newRank = destination.index + 1;
        dispatch({
          type: "ADD_RANKED_ITEM",
          payload: { item: player, type: "player", rank: newRank },
        });

        // Auto-save after a short delay
        setTimeout(() => {
          saveRankings();
        }, 1000);
      }
      return;
    }

    // Handle reordering within rankings
    if (
      source.droppableId === "ranked-players" &&
      destination.droppableId === "ranked-players"
    ) {
      if (source.index === destination.index) return;

      const reorderedItems = [...state.rankedItems];
      const [removed] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, removed);

      // Update ranks
      reorderedItems.forEach((item, index) => {
        item.overall_rank = index + 1;
      });

      dispatch({ type: "SET_RANKED_ITEMS", payload: reorderedItems });

      // Auto-save after a short delay
      setTimeout(() => {
        saveRankings();
      }, 1000);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <RankingsHeader />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Left Panel - Available Players */}
            <div
              className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} rounded-xl p-6`}
            >
              <AvailablePlayersList />
            </div>

            {/* Right Panel - Ranked Players */}
            <div
              className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} rounded-xl p-6`}
            >
              <RankedPlayersList />
            </div>
          </div>
        </DragDropContext>

        {/* Keyboard Shortcuts Help */}
        <div
          className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} rounded-xl p-4`}
        >
          <h3
            className={`text-sm font-medium ${themeClasses.TEXT_PRIMARY} mb-2`}
          >
            Keyboard Shortcuts
          </h3>
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-xs ${themeClasses.TEXT_TERTIARY}`}
          >
            <div>
              <kbd className={`${themeClasses.BG_TERTIARY} px-1 rounded`}>
                Ctrl+Z
              </kbd>{" "}
              Undo
            </div>
            <div>
              <kbd className={`${themeClasses.BG_TERTIARY} px-1 rounded`}>
                Ctrl+Y
              </kbd>{" "}
              Redo
            </div>
            <div>
              <kbd className={`${themeClasses.BG_TERTIARY} px-1 rounded`}>
                Ctrl+S
              </kbd>{" "}
              Save
            </div>
            <div>
              <kbd className={`${themeClasses.BG_TERTIARY} px-1 rounded`}>
                Del
              </kbd>{" "}
              Remove player
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const Players: React.FC = () => {
  // Add keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            // Undo functionality would be handled in context
            break;
          case "y":
            e.preventDefault();
            // Redo functionality would be handled in context
            break;
          case "s":
            e.preventDefault();
            // Save functionality would be handled in context
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <RankingsProvider>
      <PlayersContent />
    </RankingsProvider>
  );
};

export default Players;
