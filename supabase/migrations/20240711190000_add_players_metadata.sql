-- Add missing metadata column to players table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'players') THEN
        ALTER TABLE players ADD COLUMN IF NOT EXISTS metadata jsonb;
        
        -- Add index for metadata queries
        CREATE INDEX IF NOT EXISTS idx_players_metadata ON players USING gin(metadata);
    END IF;
END $$; 