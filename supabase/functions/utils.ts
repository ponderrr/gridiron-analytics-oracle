// Utility functions for player rankings logic shared across Supabase Edge Functions

// position order mapping for consistent sorting
export const positionOrder: Record<string, number> = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 4,
  K: 5,
  "D/ST": 6,
};

// Sorting comparison function for players based on position and trade value
// Expects player objects with at least { position, trade_values }
export function comparePlayersByPositionAndTradeValue(a: any, b: any): number {
  const posA = positionOrder[a.position as keyof typeof positionOrder] || 7;
  const posB = positionOrder[b.position as keyof typeof positionOrder] || 7;

  if (posA !== posB) {
    return posA - posB;
  }

  // Within the same position, sort by trade value (descending)
  const tradeValueA = a.trade_values?.[0]?.trade_value || 0;
  const tradeValueB = b.trade_values?.[0]?.trade_value || 0;
  return tradeValueB - tradeValueA;
}
