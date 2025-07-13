-- Add critical missing indexes for performance optimization
-- Player lookup optimization
CREATE INDEX idx_players_position_active ON players(position, active) WHERE active = true;
CREATE INDEX idx_players_team_position ON players(team, position);
CREATE INDEX idx_players_player_id ON players(player_id);

-- Weekly stats performance (most queried table)
CREATE INDEX idx_weekly_stats_player_season_week ON weekly_stats(player_id, season, week);
CREATE INDEX idx_weekly_stats_season_week ON weekly_stats(season, week);
CREATE INDEX idx_weekly_stats_season_week_fantasy_points ON weekly_stats(season, week, fantasy_points DESC);

-- Sleeper stats optimization
CREATE INDEX idx_sleeper_stats_season_week ON sleeper_stats(season, week);
CREATE INDEX idx_sleeper_stats_player_season ON sleeper_stats(player_id, season);

-- Projections lookup
CREATE INDEX idx_projections_player_season_week ON projections(player_id, season, week);
CREATE INDEX idx_projections_season_week_type ON projections(season, week, projection_type);

-- Trade values
CREATE INDEX idx_trade_values_player_season_week ON trade_values(player_id, season, week);

-- User rankings optimization
CREATE INDEX idx_user_rankings_sets_user_active ON user_rankings_sets(user_id, is_active);
CREATE INDEX idx_user_rankings_players_ranking_rank ON user_rankings_players(ranking_set_id, overall_rank);

-- Sync and ETL monitoring
-- The following indexes are commented out because the tables may not exist yet in this migration.
-- If you add these tables in a future migration, move these index statements there.
-- CREATE INDEX idx_sync_logs_sync_type_started ON sync_logs(sync_type, started_at DESC);
-- CREATE INDEX idx_etl_metadata_run_type_last_run ON etl_metadata(run_type, last_run DESC); 