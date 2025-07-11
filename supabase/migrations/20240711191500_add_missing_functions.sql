-- Function to get last refresh timestamp for a run type
CREATE OR REPLACE FUNCTION get_last_refresh(run_type_param text)
RETURNS bigint AS $$
DECLARE
  last_timestamp bigint;
BEGIN
  SELECT COALESCE(MAX(last_created_timestamp), 0)
  INTO last_timestamp
  FROM etl_metadata
  WHERE run_type = run_type_param
    AND status = 'success'
    AND last_created_timestamp IS NOT NULL;
  
  RETURN last_timestamp;
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
    AND em.status = 'success'
    AND em.last_season IS NOT NULL
    AND em.last_week IS NOT NULL
  ORDER BY em.last_run DESC
  LIMIT 1;
  
  -- If no records found, return default
  IF NOT FOUND THEN
    RETURN QUERY SELECT 2024::integer, 0::integer;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views (placeholder)
CREATE OR REPLACE FUNCTION refresh_views()
RETURNS void AS $$
BEGIN
  -- Add materialized view refreshes here when you create them
  -- Example: REFRESH MATERIALIZED VIEW CONCURRENTLY top200_redraft;
  -- Example: REFRESH MATERIALIZED VIEW CONCURRENTLY top200_dynasty;
  
  -- For now, just log that views would be refreshed
  INSERT INTO etl_metadata (run_type, status, records_processed)
  VALUES ('view_refresh', 'success', 0);
END;
$$ LANGUAGE plpgsql;

-- Function to clean old ETL metadata (keep last 30 days)
CREATE OR REPLACE FUNCTION clean_old_etl_metadata()
RETURNS void AS $$
BEGIN
  DELETE FROM etl_metadata 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql; 