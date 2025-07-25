// This file is automatically generated. Do not edit it directly.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Optional: Test Supabase connection in development
if (import.meta.env.DEV) {
  supabase
    .from("players") // Use an existing table for the connection test
    .select("*")
    .limit(1)
    .then(({ error }) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.warn("Supabase connection test failed:", error.message);
      } else {
        // eslint-disable-next-line no-console
        console.info("Supabase connection test succeeded.");
      }
    });
}
