-- Fantasy Football App Rebuild Schema Migration
-- Implements centralized Top 200 player pool and format-specific improvements

-- =============================
-- CENTRALIZED TOP 200 PLAYER POOL
-- =============================

-- Shared global player pool for Top 200 players
CREATE TABLE IF NOT EXISTS top_players_pool (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week integer NOT NULL,
  season integer NOT NULL,
  format text NOT NULL CHECK (format IN ('dynasty', 'redraft')),
  player_data jsonb NOT NULL,
  consensus_rank integer NOT NULL CHECK (consensus_rank >= 1 AND consensus_rank <= 200),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(week, season, format, consensus_rank)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_top_players_pool_format_season_week ON top_players_pool(format, season, week);
CREATE INDEX IF NOT EXISTS idx_top_players_pool_active ON top_players_pool(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_top_players_pool_rank ON top_players_pool(consensus_rank);

-- =============================
-- DRAFT PICKS MANAGEMENT
-- =============================

-- Note: The draft_picks table will be replaced by the separate migration
-- 20250711000002_replace_draft_picks.sql which creates the simplified bucket structure

-- =============================
-- UPDATE USER RANKINGS TO LINK TO POOL
-- =============================

-- Add pool reference columns to user rankings
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_rankings_players' AND column_name = 'pool_week') THEN
    ALTER TABLE user_rankings_players ADD COLUMN pool_week integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_rankings_players' AND column_name = 'pool_season') THEN
    ALTER TABLE user_rankings_players ADD COLUMN pool_season integer;
  END IF;
END $$;

-- Add index for pool lookups
CREATE INDEX IF NOT EXISTS idx_user_rankings_pool_ref ON user_rankings_players(pool_week, pool_season);

-- =============================
-- HELPER FUNCTIONS
-- =============================

-- Function to get the latest active pool for a format
CREATE OR REPLACE FUNCTION get_latest_player_pool(format_type text)
RETURNS TABLE (
  week integer,
  season integer,
  format text,
  player_data jsonb,
  consensus_rank integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tpp.week,
    tpp.season,
    tpp.format,
    tpp.player_data,
    tpp.consensus_rank
  FROM top_players_pool tpp
  WHERE tpp.format = format_type 
    AND tpp.is_active = true
  ORDER BY tpp.season DESC, tpp.week DESC, tpp.consensus_rank ASC
  LIMIT 200;
END;
$$ LANGUAGE plpgsql;

-- Function to get active draft picks for a specific year
-- Note: This function will be updated by the draft_picks replacement migration
-- to work with the new simplified structure

-- Function to deactivate old pools when new ones are created
CREATE OR REPLACE FUNCTION deactivate_old_pools()
RETURNS void AS $$
BEGIN
  UPDATE top_players_pool 
  SET is_active = false 
  WHERE id NOT IN (
    SELECT DISTINCT ON (format) id 
    FROM top_players_pool 
    WHERE is_active = true 
    ORDER BY format, season DESC, week DESC
  );
END;
$$ LANGUAGE plpgsql;

-- =============================
-- ROW LEVEL SECURITY
-- =============================

-- Enable RLS on top_players_pool
ALTER TABLE top_players_pool ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active pools
CREATE POLICY "Allow authenticated users to read active player pools" ON top_players_pool
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow service role to manage pools (for admin functions)
CREATE POLICY "Allow service role to manage player pools" ON top_players_pool
  FOR ALL USING (auth.role() = 'service_role');

-- Note: draft_picks table already has RLS policies from your existing setup
-- No additional RLS policies needed for draft_picks

-- =============================
-- TRIGGERS
-- =============================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_top_players_pool_updated_at
  BEFORE UPDATE ON top_players_pool
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: draft_picks table doesn't need the updated_at trigger since it doesn't have that column 