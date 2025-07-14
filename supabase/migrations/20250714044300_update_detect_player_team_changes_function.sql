-- Migration to update detect_player_team_changes to accept a season parameter

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
