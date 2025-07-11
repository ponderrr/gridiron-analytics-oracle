-- Add missing metadata column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Add index for metadata queries
CREATE INDEX IF NOT EXISTS idx_players_metadata ON players USING gin(metadata); 