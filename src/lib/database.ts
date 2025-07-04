import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type WeeklyStat = Database["public"]["Tables"]["weekly_stats"]["Row"];
export type Projection = Database["public"]["Tables"]["projections"]["Row"];
export type TradeValue = Database["public"]["Tables"]["trade_values"]["Row"];
