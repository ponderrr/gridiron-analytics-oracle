-- Optimize player mapping queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_mapping_sleeper_confidence 
ON player_id_mapping (sleeper_id, confidence_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_mapping_nflverse_method 
ON player_id_mapping (nflverse_id, match_method);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_mapping_created_verified 
ON player_id_mapping (created_at DESC, verified);

-- Optimize stats queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleeper_stats_composite 
ON sleeper_stats (season, week, player_id, pts_ppr DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleeper_stats_player_season 
ON sleeper_stats (player_id, season, week);

-- Optimize unmapped players queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_unmapped_players_priority 
ON unmapped_players (source, attempts_count, last_attempt DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_unmapped_players_position 
ON unmapped_players (position, source) WHERE position IS NOT NULL;

-- Optimize audit queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mapping_audit_mapping_action 
ON mapping_audit (mapping_id, action, performed_at DESC);

-- Optimize ETL metadata queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_etl_metadata_type_status 
ON etl_metadata (run_type, status, last_run DESC);

-- Optimize query performance log
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_performance_type_time 
ON query_performance_log (query_type, created_at DESC, execution_time_ms);

-- Optimize sleeper cache queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleeper_cache_position_team 
ON sleeper_players_cache (position, team) WHERE position IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleeper_cache_updated 
ON sleeper_players_cache (last_updated DESC);

-- Partial indexes for active/important data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_unmapped_active_attempts 
ON unmapped_players (source, player_name) 
WHERE attempts_count <= 5 AND source = 'nflverse';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mapping_unverified_high_confidence 
ON player_id_mapping (confidence_score DESC, created_at DESC) 
WHERE verified = false AND confidence_score >= 0.8;

-- Composite index for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleeper_stats_dashboard 
ON sleeper_stats (season DESC, week DESC, pts_ppr DESC) 
WHERE pts_ppr IS NOT NULL;

-- Add constraints to ensure data integrity
ALTER TABLE player_id_mapping 
ADD CONSTRAINT check_confidence_score_range 
CHECK (confidence_score >= 0 AND confidence_score <= 1);

ALTER TABLE sleeper_stats 
ADD CONSTRAINT check_week_range 
CHECK (week >= 1 AND week <= 22);

ALTER TABLE sleeper_stats 
ADD CONSTRAINT check_reasonable_fantasy_points 
CHECK (pts_ppr IS NULL OR (pts_ppr >= -10 AND pts_ppr <= 100));

-- Update table statistics for better query planning
ANALYZE player_id_mapping;
ANALYZE sleeper_stats;
ANALYZE unmapped_players;
ANALYZE sleeper_players_cache;

-- Create materialized view for dashboard performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_mapping_dashboard_stats AS
SELECT 
  COUNT(*) as total_mappings,
  COUNT(*) FILTER (WHERE match_method = 'exact') as exact_matches,
  COUNT(*) FILTER (WHERE match_method = 'fuzzy') as fuzzy_matches,
  COUNT(*) FILTER (WHERE match_method = 'manual') as manual_matches,
  COUNT(*) FILTER (WHERE confidence_score >= 0.9) as high_confidence,
  COUNT(*) FILTER (WHERE confidence_score >= 0.8 AND confidence_score < 0.9) as medium_confidence,
  COUNT(*) FILTER (WHERE confidence_score < 0.8) as low_confidence,
  COUNT(*) FILTER (WHERE verified = true) as verified_mappings,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as recent_mappings,
  AVG(confidence_score) as avg_confidence_score
FROM player_id_mapping;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_mapping_dashboard_stats_refresh 
ON mv_mapping_dashboard_stats ((1));

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_mapping_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_mapping_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check index usage
CREATE OR REPLACE FUNCTION check_index_usage()
RETURNS TABLE (
  table_name text,
  index_name text,
  index_scans bigint,
  index_size text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    indexname as index_name,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public'
    AND (tablename LIKE '%mapping%' OR tablename LIKE '%sleeper%' OR tablename LIKE '%player%')
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql; 