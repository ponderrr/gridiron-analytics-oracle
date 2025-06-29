import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type WeeklyStat = Database["public"]["Tables"]["weekly_stats"]["Row"];
export type Projection = Database["public"]["Tables"]["projections"]["Row"];
export type TradeValue = Database["public"]["Tables"]["trade_values"]["Row"];

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchWeeklyStats(limit = 10): Promise<WeeklyStat[]> {
  const { data, error } = await supabase
    .from("weekly_stats")
    .select("*")
    .order("week", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchProjections(): Promise<Projection[]> {
  const { data, error } = await supabase
    .from("projections")
    .select("*")
    .order("projected_points", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTradeValues(): Promise<TradeValue[]> {
  const { data, error } = await supabase
    .from("trade_values")
    .select("*")
    .order("trade_value", { ascending: false });
  if (error) throw error;
  return data || [];
}
