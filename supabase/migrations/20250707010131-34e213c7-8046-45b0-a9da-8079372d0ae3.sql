-- Add metadata column to players table for storing additional Sleeper API data
ALTER TABLE public.players ADD COLUMN metadata jsonb;