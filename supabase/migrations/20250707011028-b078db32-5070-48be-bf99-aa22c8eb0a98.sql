-- Create sync status tracking table
CREATE TABLE IF NOT EXISTS public.sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  players_processed INTEGER DEFAULT 0,
  team_changes INTEGER DEFAULT 0,
  retired_players INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create or replace function to log sync status
CREATE OR REPLACE FUNCTION public.log_sync_status(
  sync_type TEXT,
  success BOOLEAN,
  players_processed INTEGER DEFAULT 0,
  team_changes INTEGER DEFAULT 0,
  retired_players INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.sync_status (
    sync_type,
    success,
    players_processed,
    team_changes,
    retired_players,
    error_count,
    error_details
  ) VALUES (
    sync_type,
    success,
    players_processed,
    team_changes,
    retired_players,
    error_count,
    error_details
  );
END;
$$ LANGUAGE plpgsql;