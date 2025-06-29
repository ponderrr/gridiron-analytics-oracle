import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type WeeklyStat = Database["public"]["Tables"]["weekly_stats"]["Row"];
export type Projection = Database["public"]["Tables"]["projections"]["Row"];
export type TradeValue = Database["public"]["Tables"]["trade_values"]["Row"];

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase.from("players").select("*");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchPlayers error:", err);
    throw err;
  }
}

export async function fetchWeeklyStats(limit = 10): Promise<WeeklyStat[]> {
  try {
    const { data, error } = await supabase
      .from("weekly_stats")
      .select("*")
      .order("week", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchWeeklyStats error:", err);
    throw err;
  }
}

export async function fetchProjections(): Promise<Projection[]> {
  try {
    const { data, error } = await supabase.from("projections").select("*");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchProjections error:", err);
    throw err;
  }
}

export async function fetchTradeValues(): Promise<TradeValue[]> {
  try {
    const { data, error } = await supabase.from("trade_values").select("*");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("fetchTradeValues error:", err);
    throw err;
  }
}
