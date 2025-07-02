import { Users, TrendingUp, Target, Activity } from "lucide-react";

export const MOCK_TOP_PLAYERS = [
  {
    name: "Josh Allen",
    position: "QB",
    team: "BUF",
    projection: 24.8,
    points: 28.4,
    trend: "up" as const,
    trendValue: "+12%",
    tier: "Elite",
    status: "active" as const,
  },
  {
    name: "Christian McCaffrey",
    position: "RB",
    team: "SF",
    projection: 18.4,
    points: 22.1,
    trend: "up" as const,
    trendValue: "+8%",
    tier: "RB1",
    status: "active" as const,
  },
  {
    name: "Cooper Kupp",
    position: "WR",
    team: "LAR",
    projection: 16.2,
    points: 19.7,
    trend: "up" as const,
    trendValue: "+15%",
    tier: "WR1",
    status: "questionable" as const,
  },
];

export const MOCK_FEATURED_PLAYERS = [
  ...MOCK_TOP_PLAYERS,
  {
    name: "Travis Kelce",
    position: "TE",
    team: "KC",
    projection: 14.8,
    points: 17.3,
    trend: "up" as const,
    trendValue: "+6%",
    tier: "Elite",
    status: "active" as const,
  },
  {
    name: "Stefon Diggs",
    position: "WR",
    team: "HOU",
    projection: 15.9,
    points: 18.2,
    trend: "up" as const,
    trendValue: "+9%",
    tier: "WR1",
    status: "active" as const,
  },
  {
    name: "Derrick Henry",
    position: "RB",
    team: "BAL",
    projection: 16.7,
    points: 20.1,
    trend: "up" as const,
    trendValue: "+14%",
    tier: "RB1",
    status: "active" as const,
  },
];

export const MOCK_AVAILABLE_PLAYERS = [
  { name: "Josh Allen", position: "QB", team: "BUF", value: 95 },
  { name: "Christian McCaffrey", position: "RB", team: "SF", value: 92 },
  { name: "Cooper Kupp", position: "WR", team: "LAR", value: 88 },
  { name: "Travis Kelce", position: "TE", team: "KC", value: 85 },
  { name: "Stefon Diggs", position: "WR", team: "HOU", value: 82 },
  { name: "Derrick Henry", position: "RB", team: "BAL", value: 80 },
];
