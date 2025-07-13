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
      (SELECT COUNT(*) FROM player_id_mapping)::numeric / 
      (SELECT COUNT(DISTINCT player_id) FROM unmapped_players WHERE source = 'nflverse')::numeric as value,
      0.95 as thresh
    UNION ALL
    SELECT 
      'high_confidence_ratio' as name,
      (SELECT COUNT(*) FROM player_id_mapping WHERE confidence_score >= 0.9)::numeric /
      (SELECT COUNT(*) FROM player_id_mapping)::numeric as value,
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

-- Alert for mapping failures
CREATE OR REPLACE FUNCTION alert_mapping_failures()
RETURNS text AS $$
DECLARE
  unmapped_count integer;
  low_confidence_count integer;
  recent_failures integer;
  alert_message text := '';
BEGIN
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
  IF unmapped_count > 50 THEN
    alert_message := alert_message || 'High unmapped player count: ' || unmapped_count || '. ';
  END IF;
  
  IF low_confidence_count > 20 THEN
    alert_message := alert_message || 'High low-confidence mapping count: ' || low_confidence_count || '. ';
  END IF;
  
  IF recent_failures > 0 THEN
    alert_message := alert_message || 'Recent sync failures: ' || recent_failures || '. ';
  END IF;
  
  RETURN COALESCE(NULLIF(alert_message, ''), 'All mapping metrics within normal ranges');
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

-- Monthly mapping trends
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
  SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month_year,
    COUNT(*) as new_mappings,
    AVG(confidence_score) as avg_confidence,
    (SELECT COUNT(*) FROM mapping_audit 
     WHERE action = 'manual' 
     AND performed_at >= DATE_TRUNC('month', m.created_at)
     AND performed_at < DATE_TRUNC('month', m.created_at) + INTERVAL '1 month') as manual_reviews,
    (SELECT COUNT(*) FROM etl_metadata 
     WHERE run_type = 'weekly-stats' 
     AND status = 'error'
     AND last_run >= DATE_TRUNC('month', m.created_at)
     AND last_run < DATE_TRUNC('month', m.created_at) + INTERVAL '1 month') as sync_failures
  FROM player_id_mapping m
  WHERE created_at >= NOW() - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('month', created_at)
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