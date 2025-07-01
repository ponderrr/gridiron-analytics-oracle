import { supabase } from "../../integrations/supabase/client";
import { Player, WeeklyStat, Projection, TradeValue } from "../database";

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
