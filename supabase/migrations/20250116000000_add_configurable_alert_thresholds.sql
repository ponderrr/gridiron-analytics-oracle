-- Migration: Add configurable alert thresholds for mapping quality monitoring
-- This migration adds a configuration table and updates the alert function to use configurable thresholds

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

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS alert_mapping_failures();

-- Create the new configurable alert function
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