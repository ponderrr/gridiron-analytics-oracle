import { renderHook, act } from "@testing-library/react";
import { useTradeAnalysis } from "./useTradeAnalysis";

// Helper function to create valid Player objects for testing
const createTestPlayer = (
  id: string,
  name: string,
  position: string,
  team: string
) => ({
  id,
  name,
  position,
  team,
  active: true,
  bye_week: 7,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  metadata: null,
  player_id: id,
});

// Mock useRankings
jest.mock("@/components/PlayerRankings", () => ({
  useRankings: () => ({
    state: {
      rankedItems: [
        {
          player_id: "1",
          overall_rank: 1,
          type: "player",
          player: {
            id: "1",
            name: "A",
            position: "QB",
            team: "X",
            active: true,
            bye_week: 7,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            metadata: null,
            player_id: "1",
          },
        },
        {
          player_id: "2",
          overall_rank: 2,
          type: "player",
          player: {
            id: "2",
            name: "B",
            position: "RB",
            team: "Y",
            active: true,
            bye_week: 8,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            metadata: null,
            player_id: "2",
          },
        },
      ],
      availablePlayers: [
        {
          id: "1",
          name: "A",
          position: "QB",
          team: "X",
          active: true,
          bye_week: 7,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          metadata: null,
          player_id: "1",
        },
        {
          id: "2",
          name: "B",
          position: "RB",
          team: "Y",
          active: true,
          bye_week: 8,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          metadata: null,
          player_id: "2",
        },
      ],
      currentSet: { id: "set1", name: "Test Set" },
    },
  }),
}));

describe("useTradeAnalysis", () => {
  it("calculates player value and trade analysis", () => {
    const { result } = renderHook(() => useTradeAnalysis());
    act(() => {
      result.current.addPlayerToTrade(
        createTestPlayer("1", "A", "QB", "X"),
        "your"
      );
      result.current.addPlayerToTrade(
        createTestPlayer("2", "B", "RB", "Y"),
        "target"
      );
    });
    expect(result.current.yourPlayers.length).toBe(1);
    expect(result.current.targetPlayers.length).toBe(1);
    expect(result.current.tradeAnalysis).not.toBeNull();
    expect(result.current.tradeAnalysis?.fairness).toBeDefined();
    expect(result.current.tradeAnalysis?.recommendation).toBeDefined();
  });

  it("returns null tradeAnalysis if either side is empty", () => {
    const { result } = renderHook(() => useTradeAnalysis());
    expect(result.current.tradeAnalysis).toBeNull();
    act(() => {
      result.current.addPlayerToTrade(
        createTestPlayer("1", "A", "QB", "X"),
        "your"
      );
    });
    expect(result.current.tradeAnalysis).toBeNull();
  });

  it("clears trade state", () => {
    const { result } = renderHook(() => useTradeAnalysis());
    act(() => {
      result.current.addPlayerToTrade(
        createTestPlayer("1", "A", "QB", "X"),
        "your"
      );
      result.current.clearTrade();
    });
    expect(result.current.yourPlayers.length).toBe(0);
    expect(result.current.targetPlayers.length).toBe(0);
  });

  it("removes player from trade", () => {
    const { result } = renderHook(() => useTradeAnalysis());
    act(() => {
      result.current.addPlayerToTrade(
        createTestPlayer("1", "A", "QB", "X"),
        "your"
      );
      result.current.removePlayerFromTrade("1", "your");
    });
    expect(result.current.yourPlayers.length).toBe(0);
  });
});
