-- Add missing unique constraints for data integrity
-- Prevent duplicate weekly stats for same player/season/week
ALTER TABLE weekly_stats 
ADD CONSTRAINT weekly_stats_player_season_week_unique 
UNIQUE (player_id, season, week);

-- Prevent duplicate projections of same type
ALTER TABLE projections 
ADD CONSTRAINT projections_player_season_week_type_unique 
UNIQUE (player_id, season, week, projection_type);

-- Prevent duplicate trade values
ALTER TABLE trade_values 
ADD CONSTRAINT trade_values_player_season_week_unique 
UNIQUE (player_id, season, week);

-- Ensure unique active ranking sets per user/format
CREATE UNIQUE INDEX idx_user_rankings_sets_user_format_active 
ON user_rankings_sets(user_id, format) 
WHERE is_active = true;

-- Prevent duplicate ETL runs of same type at same time
CREATE UNIQUE INDEX idx_etl_metadata_run_type_last_run 
ON etl_metadata(run_type, last_run); 