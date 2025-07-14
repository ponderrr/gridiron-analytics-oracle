-- Table for tracking data quality issues
CREATE TABLE IF NOT EXISTS data_quality_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_type text NOT NULL,
  player_id text,
  season integer,
  week integer,
  issues text[] NOT NULL,
  raw_data jsonb,
  resolved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_quality_issues_type ON data_quality_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_data_quality_issues_player ON data_quality_issues(player_id);
CREATE INDEX IF NOT EXISTS idx_data_quality_issues_resolved ON data_quality_issues(resolved) WHERE resolved = false;

-- Enhanced mapping alerts table
CREATE TABLE IF NOT EXISTS mapping_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type text NOT NULL,
  severity text CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  message text NOT NULL,
  metadata jsonb,
  resolved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_mapping_alerts_type ON mapping_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_mapping_alerts_severity ON mapping_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_mapping_alerts_resolved ON mapping_alerts(resolved) WHERE resolved = false;

-- Function to trigger mapping alerts
CREATE OR REPLACE FUNCTION trigger_mapping_alert(
  p_alert_type text,
  p_severity text,
  p_message text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Prevent duplicate alerts within 1 hour
  IF NOT EXISTS (
    SELECT 1 FROM mapping_alerts 
    WHERE alert_type = p_alert_type 
      AND created_at > NOW() - INTERVAL '1 hour'
      AND resolved = false
  ) THEN
    INSERT INTO mapping_alerts (alert_type, severity, message, metadata)
    VALUES (p_alert_type, p_severity, p_message, p_metadata);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate overall mapping quality score
CREATE OR REPLACE FUNCTION calculate_mapping_quality_score()
RETURNS numeric AS $$
DECLARE
  coverage_score numeric;
  confidence_score numeric;
  accuracy_score numeric;
  freshness_score numeric;
  total_score numeric;
BEGIN
  -- Coverage score (40% weight)
  SELECT 
    CASE 
      WHEN total_fantasy_players = 0 THEN 0
      ELSE (mapped_players::numeric / total_fantasy_players::numeric) * 40
    END INTO coverage_score
  FROM (
    SELECT 
      COUNT(*) as total_fantasy_players,
      COUNT(m.id) as mapped_players
    FROM sleeper_players_cache p
    LEFT JOIN player_id_mapping m ON p.player_id = m.sleeper_id
    WHERE p.position IN ('QB', 'RB', 'WR', 'TE')
  ) t;

  -- Confidence score (30% weight)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(*) FILTER (WHERE confidence_score >= 0.9)::numeric / COUNT(*)::numeric) * 30
    END INTO confidence_score
  FROM player_id_mapping;

  -- Accuracy score based on recent validations (20% weight)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 20
      ELSE ((COUNT(*) - COUNT(*) FILTER (WHERE resolved = false))::numeric / COUNT(*)::numeric) * 20
    END INTO accuracy_score
  FROM data_quality_issues
  WHERE created_at > NOW() - INTERVAL '7 days';

  -- Freshness score (10% weight)
  SELECT 
    CASE 
      WHEN MAX(created_at) > NOW() - INTERVAL '7 days' THEN 10
      WHEN MAX(created_at) > NOW() - INTERVAL '30 days' THEN 5
      ELSE 0
    END INTO freshness_score
  FROM player_id_mapping;

  total_score := COALESCE(coverage_score, 0) + 
                 COALESCE(confidence_score, 0) + 
                 COALESCE(accuracy_score, 0) + 
                 COALESCE(freshness_score, 0);

  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to validate fantasy points calculations
CREATE OR REPLACE FUNCTION validate_fantasy_points_batch(
  p_season integer DEFAULT 2024,
  p_week integer DEFAULT NULL
)
RETURNS TABLE (
  player_id text,
  calculated_points numeric,
  stored_points numeric,
  difference numeric,
  validation_status text
) AS $$
BEGIN
  RETURN QUERY
  WITH calculated AS (
    SELECT 
      s.player_id,
      -- Standard PPR calculation
      (COALESCE(s.pass_yd, 0) / 25.0 +
       COALESCE(s.pass_td, 0) * 4 +
       COALESCE(s.rush_yd, 0) / 10.0 +
       COALESCE(s.rush_td, 0) * 6 +
       COALESCE(s.rec_yd, 0) / 10.0 +
       COALESCE(s.rec_td, 0) * 6 +
       COALESCE(s.rec, 0) * 1) as calculated_points,
      s.pts_ppr as stored_points
    FROM sleeper_stats s
    WHERE s.season = p_season
      AND (p_week IS NULL OR s.week = p_week)
  )
  SELECT 
    c.player_id,
    c.calculated_points,
    c.stored_points,
    ABS(c.calculated_points - COALESCE(c.stored_points, 0)) as difference,
    CASE 
      WHEN ABS(c.calculated_points - COALESCE(c.stored_points, 0)) < 1.0 THEN 'VALID'
      WHEN ABS(c.calculated_points - COALESCE(c.stored_points, 0)) < 3.0 THEN 'WARNING'
      ELSE 'ERROR'
    END as validation_status
  FROM calculated c
  ORDER BY difference DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check for trade detection
CREATE OR REPLACE FUNCTION detect_player_team_changes(
  p_season integer
)
RETURNS TABLE (
  player_id text,
  old_team text,
  new_team text,
  detected_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  WITH team_changes AS (
    SELECT 
      s.player_id,
      LAG(m.team) OVER (PARTITION BY s.player_id ORDER BY s.week) as old_team,
      m.team as new_team,
      s.week,
      NOW() as detected_at
    FROM sleeper_stats s
    JOIN player_id_mapping m ON s.player_id = m.sleeper_id
    WHERE s.season = p_season
      AND s.created_at > NOW() - INTERVAL '7 days'
  )
  SELECT 
    tc.player_id,
    tc.old_team,
    tc.new_team,
    tc.detected_at
  FROM team_changes tc
  WHERE tc.old_team IS NOT NULL 
    AND tc.old_team != tc.new_team;
END;
$$ LANGUAGE plpgsql;

-- Function for automated quality checks
CREATE OR REPLACE FUNCTION run_automated_quality_checks()
RETURNS void AS $$
DECLARE
  validation_errors integer;
  mapping_coverage numeric;
BEGIN
  -- Check fantasy points validation
  SELECT COUNT(*) INTO validation_errors
  FROM validate_fantasy_points_batch(2024)
  WHERE validation_status = 'ERROR';
  
  IF validation_errors > 10 THEN
    PERFORM trigger_mapping_alert(
      'fantasy_points_validation_errors',
      'HIGH',
      'Found ' || validation_errors || ' fantasy points calculation errors',
      jsonb_build_object('error_count', validation_errors)
    );
  END IF;

  -- Check mapping coverage
  SELECT calculate_mapping_quality_score() INTO mapping_coverage;
  
  IF mapping_coverage < 70 THEN
    PERFORM trigger_mapping_alert(
      'low_mapping_coverage',
      'CRITICAL',
      'Mapping coverage below 70%: ' || mapping_coverage::text,
      jsonb_build_object('coverage_score', mapping_coverage)
    );
  ELSIF mapping_coverage < 85 THEN
    PERFORM trigger_mapping_alert(
      'degraded_mapping_coverage',
      'MEDIUM',
      'Mapping coverage below 85%: ' || mapping_coverage::text,
      jsonb_build_object('coverage_score', mapping_coverage)
    );
  END IF;
END;
$$ LANGUAGE plpgsql; 