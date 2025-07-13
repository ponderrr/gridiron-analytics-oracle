-- Migration: Add mapping quality monitoring functions
-- This migration adds comprehensive monitoring and alerting functions for player mapping quality

-- Daily mapping quality check
CREATE OR REPLACE FUNCTION check_mapping_quality()
RETURNS TABLE (
  metric_name text,
  metric_value numeric,
  threshold numeric,
  status text
) AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT 
      'mapping_coverage' as name,
      CASE 
        WHEN (SELECT COUNT(DISTINCT player_id) FROM unmapped_players WHERE source = 'nflverse') = 0 THEN 1.0
        ELSE (SELECT COUNT(*) FROM player_id_mapping)::numeric / 
             (SELECT COUNT(DISTINCT player_id) FROM unmapped_players WHERE source = 'nflverse')::numeric
      END as value,
      0.95 as thresh
    UNION ALL
    SELECT 
      'high_confidence_ratio' as name,
      CASE 
        WHEN (SELECT COUNT(*) FROM player_id_mapping) = 0 THEN 0.0
        ELSE (SELECT COUNT(*) FROM player_id_mapping WHERE confidence_score >= 0.9)::numeric /
             NULLIF((SELECT COUNT(*) FROM player_id_mapping)::numeric, 0)
      END as value,
      0.80 as thresh
    UNION ALL  
    SELECT
      'recent_sync_success' as name,
      (SELECT COUNT(*) FROM etl_metadata 
       WHERE run_type = 'weekly-stats' 
       AND status = 'success' 
       AND last_run > NOW() - INTERVAL '24 hours')::numeric as value,
      1.0 as thresh
  )
  SELECT 
    name,
    value,
    thresh,
    CASE WHEN value >= thresh THEN 'PASS' ELSE 'FAIL' END
  FROM metrics;
END;
$$ LANGUAGE plpgsql;

-- Configuration table for alert thresholds
CREATE TABLE IF NOT EXISTS mapping_alert_config (
  config_key text PRIMARY KEY,
  config_value integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- Insert default configuration values
INSERT INTO mapping_alert_config (config_key, config_value, description) VALUES
  ('unmapped_players_threshold', 50, 'Maximum number of unmapped players before alert'),
  ('low_confidence_mappings_threshold', 20, 'Maximum number of low confidence mappings before alert')
ON CONFLICT (config_key) DO NOTHING;

-- Alert for mapping failures with configurable thresholds
CREATE OR REPLACE FUNCTION alert_mapping_failures(
  p_unmapped_threshold integer DEFAULT NULL,
  p_low_confidence_threshold integer DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  unmapped_count integer;
  low_confidence_count integer;
  recent_failures integer;
  alert_message text := '';
  unmapped_threshold integer;
  low_confidence_threshold integer;
BEGIN
  -- Get thresholds from parameters or configuration table
  IF p_unmapped_threshold IS NOT NULL THEN
    unmapped_threshold := p_unmapped_threshold;
  ELSE
    SELECT config_value INTO unmapped_threshold 
    FROM mapping_alert_config 
    WHERE config_key = 'unmapped_players_threshold';
  END IF;
  
  IF p_low_confidence_threshold IS NOT NULL THEN
    low_confidence_threshold := p_low_confidence_threshold;
  ELSE
    SELECT config_value INTO low_confidence_threshold 
    FROM mapping_alert_config 
    WHERE config_key = 'low_confidence_mappings_threshold';
  END IF;
  
  -- Check unmapped players
  SELECT COUNT(*) INTO unmapped_count
  FROM unmapped_players 
  WHERE source = 'nflverse' AND attempts_count <= 3;
  
  -- Check low confidence mappings
  SELECT COUNT(*) INTO low_confidence_count
  FROM player_id_mapping 
  WHERE confidence_score < 0.8 AND verified = false;
  
  -- Check recent sync failures  
  SELECT COUNT(*) INTO recent_failures
  FROM etl_metadata 
  WHERE run_type = 'weekly-stats' 
  AND status = 'error' 
  AND last_run > NOW() - INTERVAL '24 hours';
  
  -- Build alert message
  IF unmapped_count > unmapped_threshold THEN
    alert_message := alert_message || 'High unmapped player count: ' || unmapped_count || ' (threshold: ' || unmapped_threshold || '). ';
  END IF;
  
  IF low_confidence_count > low_confidence_threshold THEN
    alert_message := alert_message || 'High low-confidence mapping count: ' || low_confidence_count || ' (threshold: ' || low_confidence_threshold || '). ';
  END IF;
  
  IF recent_failures > 0 THEN
    alert_message := alert_message || 'Recent sync failures: ' || recent_failures || '. ';
  END IF;
  
  RETURN COALESCE(NULLIF(alert_message, ''), 'All mapping metrics within normal ranges');
END;
$$ LANGUAGE plpgsql;

-- Helper function to update alert thresholds
CREATE OR REPLACE FUNCTION update_mapping_alert_threshold(
  p_config_key text,
  p_config_value integer,
  p_description text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO mapping_alert_config (config_key, config_value, description, updated_at)
  VALUES (p_config_key, p_config_value, COALESCE(p_description, 
    CASE 
      WHEN p_config_key = 'unmapped_players_threshold' THEN 'Maximum number of unmapped players before alert'
      WHEN p_config_key = 'low_confidence_mappings_threshold' THEN 'Maximum number of low confidence mappings before alert'
      ELSE NULL
    END), NOW())
  ON CONFLICT (config_key) 
  DO UPDATE SET 
    config_value = EXCLUDED.config_value,
    description = COALESCE(EXCLUDED.description, mapping_alert_config.description),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Weekly mapping quality report
CREATE OR REPLACE FUNCTION weekly_mapping_report()
RETURNS TABLE (
  report_date date,
  total_mappings integer,
  new_mappings_this_week integer,
  unmapped_players integer,
  low_confidence_mappings integer,
  sync_success_rate numeric,
  avg_confidence_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CURRENT_DATE as report_date,
    (SELECT COUNT(*) FROM player_id_mapping) as total_mappings,
    (SELECT COUNT(*) FROM player_id_mapping 
     WHERE created_at > NOW() - INTERVAL '7 days') as new_mappings_this_week,
    (SELECT COUNT(*) FROM unmapped_players 
     WHERE source = 'nflverse') as unmapped_players,
    (SELECT COUNT(*) FROM player_id_mapping 
     WHERE confidence_score < 0.8 AND verified = false) as low_confidence_mappings,
    (SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*)::numeric) * 100
      END
     FROM etl_metadata 
     WHERE run_type = 'weekly-stats' 
     AND last_run > NOW() - INTERVAL '7 days') as sync_success_rate,
    (SELECT AVG(confidence_score) FROM player_id_mapping) as avg_confidence_score;
END;
$$ LANGUAGE plpgsql;

-- Monthly mapping trends (optimized with CTEs)
CREATE OR REPLACE FUNCTION monthly_mapping_trends()
RETURNS TABLE (
  month_year text,
  new_mappings integer,
  avg_confidence numeric,
  manual_reviews integer,
  sync_failures integer
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_mappings AS (
    SELECT 
      DATE_TRUNC('month', created_at) as month_start,
      COUNT(*) as new_mappings,
      AVG(confidence_score) as avg_confidence
    FROM player_id_mapping
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', created_at)
  ),
  monthly_manual_reviews AS (
    SELECT 
      DATE_TRUNC('month', performed_at) as month_start,
      COUNT(*) as manual_reviews
    FROM mapping_audit
    WHERE action = 'manual'
      AND performed_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', performed_at)
  ),
  monthly_sync_failures AS (
    SELECT 
      DATE_TRUNC('month', last_run) as month_start,
      COUNT(*) as sync_failures
    FROM etl_metadata
    WHERE run_type = 'weekly-stats'
      AND status = 'error'
      AND last_run >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', last_run)
  )
  SELECT 
    TO_CHAR(m.month_start, 'YYYY-MM') as month_year,
    m.new_mappings,
    m.avg_confidence,
    COALESCE(mr.manual_reviews, 0) as manual_reviews,
    COALESCE(sf.sync_failures, 0) as sync_failures
  FROM monthly_mappings m
  LEFT JOIN monthly_manual_reviews mr ON m.month_start = mr.month_start
  LEFT JOIN monthly_sync_failures sf ON m.month_start = sf.month_start
  ORDER BY month_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring queries
CREATE OR REPLACE FUNCTION mapping_performance_metrics()
RETURNS TABLE (
  metric_name text,
  current_value numeric,
  target_value numeric,
  status text
) AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT 
      'avg_mapping_time_seconds' as name,
      (SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))
      FROM player_id_mapping 
      WHERE created_at > NOW() - INTERVAL '24 hours') as value,
      5.0 as target
    UNION ALL
    SELECT 
      'sync_success_rate' as name,
      (SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE (COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*)::numeric) * 100
        END
       FROM etl_metadata 
       WHERE run_type = 'weekly-stats' 
       AND last_run > NOW() - INTERVAL '24 hours') as value,
      95.0 as target
    UNION ALL
    SELECT 
      'database_query_time_ms' as name,
      (SELECT AVG(execution_time_ms) 
       FROM query_performance_log 
       WHERE query_type LIKE '%mapping%' 
       AND executed_at > NOW() - INTERVAL '1 hour') as value,
      100.0 as target
  )
  SELECT 
    name,
    COALESCE(value, 0),
    target,
    CASE WHEN value <= target OR value IS NULL THEN 'PASS' ELSE 'FAIL' END
  FROM metrics;
END;
$$ LANGUAGE plpgsql;

-- Data quality checks
CREATE OR REPLACE FUNCTION data_quality_checks()
RETURNS TABLE (
  check_name text,
  issue_count integer,
  severity text,
  description text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'duplicate_mappings' as check_name,
    (SELECT COUNT(*) - COUNT(DISTINCT sleeper_id, nflverse_id) 
     FROM player_id_mapping) as issue_count,
    CASE WHEN (SELECT COUNT(*) - COUNT(DISTINCT sleeper_id, nflverse_id) FROM player_id_mapping) > 0 
         THEN 'HIGH' ELSE 'PASS' END as severity,
    'Duplicate sleeper_id/nflverse_id combinations' as description
  UNION ALL
  SELECT 
    'null_canonical_names' as check_name,
    (SELECT COUNT(*) FROM player_id_mapping WHERE canonical_name IS NULL OR canonical_name = '') as issue_count,
    CASE WHEN (SELECT COUNT(*) FROM player_id_mapping WHERE canonical_name IS NULL OR canonical_name = '') > 0 
         THEN 'HIGH' ELSE 'PASS' END as severity,
    'Mappings with null or empty canonical names' as description
  UNION ALL
  SELECT 
    'invalid_confidence_scores' as check_name,
    (SELECT COUNT(*) FROM player_id_mapping WHERE confidence_score < 0 OR confidence_score > 1) as issue_count,
    CASE WHEN (SELECT COUNT(*) FROM player_id_mapping WHERE confidence_score < 0 OR confidence_score > 1) > 0 
         THEN 'HIGH' ELSE 'PASS' END as severity,
    'Confidence scores outside valid range (0-1)' as description
  UNION ALL
  SELECT 
    'stale_unmapped_players' as check_name,
    (SELECT COUNT(*) FROM unmapped_players 
     WHERE source = 'nflverse' 
     AND attempts_count > 10 
     AND last_attempt < NOW() - INTERVAL '7 days') as issue_count,
    CASE WHEN (SELECT COUNT(*) FROM unmapped_players 
               WHERE source = 'nflverse' 
               AND attempts_count > 10 
               AND last_attempt < NOW() - INTERVAL '7 days') > 0 
         THEN 'MEDIUM' ELSE 'PASS' END as severity,
    'Unmapped players with high attempt counts and old last attempt' as description;
END;
$$ LANGUAGE plpgsql; 