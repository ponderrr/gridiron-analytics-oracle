-- ============================================================================
-- Player Rankings System Migration
-- ============================================================================
-- This migration creates the infrastructure for user-customizable player rankings
-- supporting both dynasty and redraft formats with tier-based organization

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: user_rankings_sets
-- ============================================================================
-- Stores collections of player rankings for different formats and users
CREATE TABLE user_rankings_sets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- References auth.users(id) but no foreign key constraint per guidelines
  name text NOT NULL,
  format text NOT NULL CHECK (format IN ('dynasty', 'redraft')),
  is_active boolean DEFAULT false, -- User's currently selected rankings
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure only one active ranking set per user per format
  CONSTRAINT unique_active_per_user_format UNIQUE (user_id, format, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- Table: user_rankings_players
-- ============================================================================
-- Stores individual player rankings within each ranking set
CREATE TABLE user_rankings_players (
  ranking_set_id uuid NOT NULL REFERENCES user_rankings_sets(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  overall_rank integer,
  tier integer,
  notes text, -- User notes about the player
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (ranking_set_id, player_id),
  
  -- Ensure unique overall ranks within each ranking set
  CONSTRAINT unique_rank_per_set UNIQUE (ranking_set_id, overall_rank) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE user_rankings_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rankings_sets
CREATE POLICY "Users can view their own ranking sets" 
ON user_rankings_sets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ranking sets" 
ON user_rankings_sets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ranking sets" 
ON user_rankings_sets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ranking sets" 
ON user_rankings_sets 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for user_rankings_players  
CREATE POLICY "Users can view their own player rankings" 
ON user_rankings_players 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_rankings_sets 
    WHERE id = ranking_set_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own player rankings" 
ON user_rankings_players 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_rankings_sets 
    WHERE id = ranking_set_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own player rankings" 
ON user_rankings_players 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_rankings_sets 
    WHERE id = ranking_set_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own player rankings" 
ON user_rankings_players 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_rankings_sets 
    WHERE id = ranking_set_id AND user_id = auth.uid()
  )
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Index for finding active ranking sets by user
CREATE INDEX idx_user_rankings_sets_user_active 
ON user_rankings_sets(user_id, is_active) 
WHERE is_active = true;

-- Index for ranking order within sets
CREATE INDEX idx_user_rankings_players_rank 
ON user_rankings_players(ranking_set_id, overall_rank);

-- Index for tier-based queries
CREATE INDEX idx_user_rankings_players_tier 
ON user_rankings_players(ranking_set_id, tier, overall_rank);

-- Index for player lookup across ranking sets
CREATE INDEX idx_user_rankings_players_player 
ON user_rankings_players(player_id);

-- ============================================================================
-- Trigger Functions
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to ensure only one active ranking set per user per format
CREATE OR REPLACE FUNCTION ensure_single_active_ranking_set()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a ranking set to active, deactivate others for same user/format
    IF NEW.is_active = true THEN
        UPDATE user_rankings_sets 
        SET is_active = false 
        WHERE user_id = NEW.user_id 
          AND format = NEW.format 
          AND id != NEW.id 
          AND is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create default ranking set for new users
CREATE OR REPLACE FUNCTION create_default_ranking_sets_for_user(user_uuid uuid)
RETURNS void AS $$
DECLARE
    redraft_set_id uuid;
    dynasty_set_id uuid;
    player_record RECORD;
    current_rank integer := 1;
BEGIN
    -- Create default redraft ranking set
    INSERT INTO user_rankings_sets (user_id, name, format, is_active)
    VALUES (user_uuid, 'My Redraft Rankings', 'redraft', true)
    RETURNING id INTO redraft_set_id;
    
    -- Create default dynasty ranking set  
    INSERT INTO user_rankings_sets (user_id, name, format, is_active)
    VALUES (user_uuid, 'My Dynasty Rankings', 'dynasty', true)
    RETURNING id INTO dynasty_set_id;
    
    -- Populate with consensus rankings based on position and trade values
    -- Order by position priority and trade value (if available)
    FOR player_record IN 
        SELECT p.id, p.position,
               COALESCE(tv.trade_value, 0) as trade_value
        FROM players p
        LEFT JOIN trade_values tv ON p.id = tv.player_id 
          AND tv.week = (SELECT MAX(week) FROM trade_values)
          AND tv.season = (SELECT MAX(season) FROM trade_values)
        WHERE p.active = true
        ORDER BY 
            CASE p.position 
                WHEN 'QB' THEN 1
                WHEN 'RB' THEN 2  
                WHEN 'WR' THEN 3
                WHEN 'TE' THEN 4
                WHEN 'K' THEN 5
                WHEN 'D/ST' THEN 6
                ELSE 7
            END,
            COALESCE(tv.trade_value, 0) DESC,
            p.name
        LIMIT 200 -- Limit to top 200 players
    LOOP
        -- Insert into redraft rankings with position-based tiers
        INSERT INTO user_rankings_players (ranking_set_id, player_id, overall_rank, tier)
        VALUES (
            redraft_set_id, 
            player_record.id, 
            current_rank,
            CASE 
                WHEN current_rank <= 12 THEN 1
                WHEN current_rank <= 24 THEN 2
                WHEN current_rank <= 36 THEN 3
                WHEN current_rank <= 60 THEN 4
                WHEN current_rank <= 84 THEN 5
                WHEN current_rank <= 120 THEN 6
                ELSE 7
            END
        );
        
        -- Insert into dynasty rankings (same initial setup, can be customized later)
        INSERT INTO user_rankings_players (ranking_set_id, player_id, overall_rank, tier)
        VALUES (
            dynasty_set_id, 
            player_record.id, 
            current_rank,
            CASE 
                WHEN current_rank <= 12 THEN 1
                WHEN current_rank <= 24 THEN 2
                WHEN current_rank <= 36 THEN 3
                WHEN current_rank <= 60 THEN 4
                WHEN current_rank <= 84 THEN 5
                WHEN current_rank <= 120 THEN 6
                ELSE 7
            END
        );
        
        current_rank := current_rank + 1;
    END LOOP;
    
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE NOTICE 'Error creating default rankings for user %: %', user_uuid, SQLERRM;
END;
$$ language 'plpgsql';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Trigger to auto-update updated_at on user_rankings_sets
CREATE TRIGGER update_user_rankings_sets_updated_at
    BEFORE UPDATE ON user_rankings_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to ensure only one active ranking set per user per format
CREATE TRIGGER ensure_single_active_ranking_set_trigger
    BEFORE INSERT OR UPDATE ON user_rankings_sets
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_ranking_set();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE user_rankings_sets IS 'Stores user-defined collections of player rankings for different fantasy formats';
COMMENT ON COLUMN user_rankings_sets.format IS 'Fantasy format: dynasty (multi-year) or redraft (single season)';
COMMENT ON COLUMN user_rankings_sets.is_active IS 'Indicates the users currently active ranking set for this format';

COMMENT ON TABLE user_rankings_players IS 'Individual player rankings within each ranking set';
COMMENT ON COLUMN user_rankings_players.overall_rank IS 'Player rank within the ranking set (1 = highest)';
COMMENT ON COLUMN user_rankings_players.tier IS 'Grouping tier for players of similar value (1 = elite tier)';
COMMENT ON COLUMN user_rankings_players.notes IS 'User notes about the player for personal reference';

COMMENT ON FUNCTION create_default_ranking_sets_for_user(uuid) IS 'Creates initial ranking sets for new users with consensus rankings';
COMMENT ON FUNCTION ensure_single_active_ranking_set() IS 'Ensures only one ranking set is active per user per format';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION create_default_ranking_sets_for_user(uuid) TO authenticated;

-- Note: Table permissions are handled by RLS policies above