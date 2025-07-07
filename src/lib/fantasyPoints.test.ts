import {
  calculateFantasyPointsSync,
  getPlayerStatTotal,
} from "./fantasyPoints";
import { DEFAULT_SCORING_SETTINGS } from "./fantasyPoints.constants";

describe("fantasyPoints", () => {
  it("calculates fantasy points for a typical QB", () => {
    const stats = {
      passing_yards: 300,
      passing_tds: 2,
      passing_interceptions: 1,
      rushing_yards: 20,
      rushing_tds: 0,
      receiving_yards: 0,
      receiving_tds: 0,
      receptions: 0,
      fumbles_lost: 0,
    };
    const points = calculateFantasyPointsSync(
      stats,
      DEFAULT_SCORING_SETTINGS.standard
    );
    expect(points).toBeCloseTo(300 / 25 + 2 * 4 - 1 * 2 + 20 / 10, 2);
  });

  it("returns 0 for missing stats", () => {
    const points = calculateFantasyPointsSync(
      {},
      DEFAULT_SCORING_SETTINGS.standard
    );
    expect(points).toBe(0);
  });

  it("handles negative stats (e.g. fumbles, interceptions)", () => {
    const stats = {
      passing_yards: 100,
      passing_tds: 1,
      passing_interceptions: 2,
      rushing_yards: 0,
      rushing_tds: 0,
      receiving_yards: 0,
      receiving_tds: 0,
      receptions: 0,
      fumbles_lost: 1,
    };
    const points = calculateFantasyPointsSync(
      stats,
      DEFAULT_SCORING_SETTINGS.standard
    );
    expect(points).toBeCloseTo(100 / 25 + 1 * 4 - 2 * 2 - 1 * 2, 2);
  });

  it("getPlayerStatTotal sums up stats correctly", () => {
    const stats = [
      { passing_yards: 100 },
      { passing_yards: 200 },
      { passing_yards: 50 },
    ];
    expect(getPlayerStatTotal(stats, "passing_yards")).toBe(350);
  });
});
