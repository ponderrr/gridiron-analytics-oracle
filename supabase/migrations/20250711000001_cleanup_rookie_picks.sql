-- Cleanup Migration: Remove rookie_picks table if it exists
-- This migration can be run if you accidentally created the rookie_picks table
-- and want to clean it up since we're using the existing draft_picks table instead

-- Drop the rookie_picks table if it exists
DROP TABLE IF EXISTS rookie_picks CASCADE;

-- Drop any related indexes
DROP INDEX IF EXISTS idx_rookie_picks_year;
DROP INDEX IF EXISTS idx_rookie_picks_active;

-- Drop the function that referenced rookie_picks (if it exists)
DROP FUNCTION IF EXISTS get_rookie_picks_for_year(integer);

-- Note: This migration is safe to run multiple times due to IF EXISTS clauses 