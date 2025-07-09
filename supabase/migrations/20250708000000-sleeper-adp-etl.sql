-- ============================================================================
-- Sleeper ADP & Stats ETL System Migration
-- ============================================================================
-- This migration creates the infrastructure for weekly Sleeper ADP and stats ETL
-- supporting both redraft and dynasty formats with materialized views

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: sleeper_drafts
-- ============================================================================
-- Stores Sleeper draft metadata
CREATE TABLE sleeper_drafts (
  draft_id text PRIMARY KEY,
  created bigint NOT NULL, -- Sleeper timestamp
  type text NOT NULL CHECK (type IN ('redraft', 'dynasty')),
  season integer NOT NULL,
  season_type text NOT NULL DEFAULT 'regular',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- Table: sleeper_picks
-- ============================================================================
-- Stores individual draft picks from Sleeper drafts
CREATE TABLE sleeper_picks (
  draft_id text NOT NULL REFERENCES sleeper_drafts(draft_id) ON DELETE CASCADE,
  player_id text NOT NULL, -- Sleeper player ID
  pick_no integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (draft_id, player_id)
);

-- ============================================================================
-- Table: sleeper_stats
-- ============================================================================
-- Stores weekly player stats from Sleeper API
CREATE TABLE sleeper_stats (
  season integer NOT NULL,
  week integer NOT NULL CHECK (week >= 1 AND week <= 18),
  player_id text NOT NULL, -- Sleeper player ID
  pts_ppr numeric(6,2),
  rec_yd integer DEFAULT 0,
  rec_td integer DEFAULT 0,
  rush_yd integer DEFAULT 0,
  pass_yd integer DEFAULT 0,
  pass_td integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (season, week, player_id)
);

-- ============================================================================
-- Table: sleeper_players_cache
-- ============================================================================
-- Caches Sleeper player data with 24-hour TTL
CREATE TABLE sleeper_players_cache (
  player_id text PRIMARY KEY,
  full_name text NOT NULL,
  position text,
  team text,
  bye_week integer,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- Table: etl_metadata
-- ============================================================================
-- Tracks ETL run metadata and last refresh timestamps
CREATE TABLE etl_metadata (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type text NOT NULL, -- 'adp', 'stats', 'players'
  last_run timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_created_timestamp bigint, -- For ADP: last draft created timestamp
  last_season integer, -- For stats: last season processed
  last_week integer, -- For stats: last week processed
  records_processed integer DEFAULT 0,
  status text DEFAULT 'success', -- 'success', 'error', 'partial'
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Indexes for sleeper_drafts
CREATE INDEX idx_sleeper_drafts_type_created ON sleeper_drafts(type, created);
CREATE INDEX idx_sleeper_drafts_season ON sleeper_drafts(season);

-- Indexes for sleeper_picks
CREATE INDEX idx_sleeper_picks_player ON sleeper_picks(player_id);
CREATE INDEX idx_sleeper_picks_draft_type ON sleeper_picks(draft_id, pick_no);

-- Indexes for sleeper_stats
CREATE INDEX idx_sleeper_stats_player ON sleeper_stats(player_id);
CREATE INDEX idx_sleeper_stats_season_week ON sleeper_stats(season, week);

-- Indexes for sleeper_players_cache
CREATE INDEX idx_sleeper_players_cache_updated ON sleeper_players_cache(last_updated);
CREATE INDEX idx_sleeper_players_cache_position ON sleeper_players_cache(position);

-- Indexes for etl_metadata
CREATE INDEX idx_etl_metadata_run_type ON etl_metadata(run_type, last_run DESC);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get last refresh timestamp for a specific run type
CREATE OR REPLACE FUNCTION get_last_refresh(run_type_param text)
RETURNS bigint AS $$
DECLARE
  last_timestamp bigint;
BEGIN
  SELECT last_created_timestamp INTO last_timestamp
  FROM etl_metadata 
  WHERE run_type = run_type_param 
  ORDER BY last_run DESC 
  LIMIT 1;
  
  RETURN COALESCE(last_timestamp, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get last stats refresh info
CREATE OR REPLACE FUNCTION get_last_stats_refresh()
RETURNS TABLE(last_season integer, last_week integer) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(em.last_season, 2024) as last_season,
    COALESCE(em.last_week, 0) as last_week
  FROM etl_metadata em
  WHERE em.run_type = 'stats'
  ORDER BY em.last_run DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh all materialized views concurrently
CREATE OR REPLACE FUNCTION refresh_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY top200_redraft;
  REFRESH MATERIALIZED VIEW CONCURRENTLY top200_dynasty;
  REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_player_summary;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old ETL metadata (keep last 30 days)
CREATE OR REPLACE FUNCTION clean_old_etl_metadata()
RETURNS void AS $$
BEGIN
  DELETE FROM etl_metadata 
  WHERE last_run < (now() - interval '30 days');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Materialized Views
-- ============================================================================

-- Top 200 Redraft ADP
CREATE MATERIALIZED VIEW top200_redraft AS
SELECT 
  sp.player_id,
  spc.full_name,
  spc.position,
  spc.team,
  spc.bye_week,
  ROUND(AVG(sp.pick_no)::numeric, 2) as adp,
  COUNT(*) as samples,
  ROUND(STDDEV(sp.pick_no)::numeric, 2) as adp_stddev,
  MIN(sp.pick_no) as best_pick,
  MAX(sp.pick_no) as worst_pick
FROM sleeper_picks sp
JOIN sleeper_drafts sd ON sp.draft_id = sd.draft_id
LEFT JOIN sleeper_players_cache spc ON sp.player_id = spc.player_id
WHERE sd.type = 'redraft'
  AND sd.season = EXTRACT(year FROM now())::integer
GROUP BY sp.player_id, spc.full_name, spc.position, spc.team, spc.bye_week
HAVING COUNT(*) >= 3
ORDER BY adp ASC
LIMIT 200;

-- Top 200 Dynasty ADP
CREATE MATERIALIZED VIEW top200_dynasty AS
SELECT 
  sp.player_id,
  spc.full_name,
  spc.position,
  spc.team,
  spc.bye_week,
  ROUND(AVG(sp.pick_no)::numeric, 2) as adp,
  COUNT(*) as samples,
  ROUND(STDDEV(sp.pick_no)::numeric, 2) as adp_stddev,
  MIN(sp.pick_no) as best_pick,
  MAX(sp.pick_no) as worst_pick
FROM sleeper_picks sp
JOIN sleeper_drafts sd ON sp.draft_id = sd.draft_id
LEFT JOIN sleeper_players_cache spc ON sp.player_id = spc.player_id
WHERE sd.type = 'dynasty'
  AND sd.season = EXTRACT(year FROM now())::integer
GROUP BY sp.player_id, spc.full_name, spc.position, spc.team, spc.bye_week
HAVING COUNT(*) >= 3
ORDER BY adp ASC
LIMIT 200;

-- Weekly Player Summary with Fantasy Finish Rank
CREATE MATERIALIZED VIEW weekly_player_summary AS
SELECT 
  ss.season,
  ss.week,
  ss.player_id,
  spc.full_name,
  spc.position,
  spc.team,
  ss.pts_ppr,
  ss.rec_yd,
  ss.rec_td,
  ss.rush_yd,
  ss.pass_yd,
  ss.pass_td,
  RANK() OVER (
    PARTITION BY ss.season, ss.week 
    ORDER BY ss.pts_ppr DESC NULLS LAST
  ) as fantasy_finish,
  COUNT(*) OVER (PARTITION BY ss.season, ss.week) as total_players_week
FROM sleeper_stats ss
LEFT JOIN sleeper_players_cache spc ON ss.player_id = spc.player_id
WHERE ss.pts_ppr IS NOT NULL;

-- ============================================================================
-- Materialized View Indexes
-- ============================================================================

-- Indexes for top200_redraft
CREATE UNIQUE INDEX idx_top200_redraft_player ON top200_redraft(player_id);
CREATE INDEX idx_top200_redraft_position ON top200_redraft(position, adp);

-- Indexes for top200_dynasty
CREATE UNIQUE INDEX idx_top200_dynasty_player ON top200_dynasty(player_id);
CREATE INDEX idx_top200_dynasty_position ON top200_dynasty(position, adp);

-- Indexes for weekly_player_summary
CREATE UNIQUE INDEX idx_weekly_player_summary_pk ON weekly_player_summary(season, week, player_id);
CREATE INDEX idx_weekly_player_summary_player ON weekly_player_summary(player_id);
CREATE INDEX idx_weekly_player_summary_week ON weekly_player_summary(season, week);
CREATE INDEX idx_weekly_player_summary_finish ON weekly_player_summary(season, week, fantasy_finish);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on tables that need it (read-only access for authenticated users)
ALTER TABLE sleeper_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleeper_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleeper_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleeper_players_cache ENABLE ROW LEVEL SECURITY;

-- Read-only policies for authenticated users
CREATE POLICY "Allow read access to sleeper_drafts" ON sleeper_drafts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to sleeper_picks" ON sleeper_picks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to sleeper_stats" ON sleeper_stats
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to sleeper_players_cache" ON sleeper_players_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Insert initial ETL metadata records
INSERT INTO etl_metadata (run_type, last_created_timestamp, last_season, last_week) VALUES
('adp', 0, 2024, 0),
('stats', 0, 2024, 0),
('players', 0, 2024, 0);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE sleeper_drafts IS 'Stores Sleeper draft metadata for ADP calculations';
COMMENT ON TABLE sleeper_picks IS 'Stores individual draft picks from Sleeper drafts';
COMMENT ON TABLE sleeper_stats IS 'Stores weekly player stats from Sleeper API';
COMMENT ON TABLE sleeper_players_cache IS 'Caches Sleeper player data with 24-hour TTL';
COMMENT ON TABLE etl_metadata IS 'Tracks ETL run metadata and last refresh timestamps';

COMMENT ON MATERIALIZED VIEW top200_redraft IS 'Top 200 players by redraft ADP with sample size >= 3';
COMMENT ON MATERIALIZED VIEW top200_dynasty IS 'Top 200 players by dynasty ADP with sample size >= 3';
COMMENT ON MATERIALIZED VIEW weekly_player_summary IS 'Weekly player stats with fantasy finish rankings'; 