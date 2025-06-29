
-- Create the players table
CREATE TABLE players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id text UNIQUE NOT NULL, -- External API identifier
  name text NOT NULL,
  position text NOT NULL CHECK (position IN ('QB', 'RB', 'WR', 'TE', 'D/ST', 'K')),
  team text NOT NULL, -- 3-letter team code
  active boolean DEFAULT true,
  bye_week integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the weekly_stats table
CREATE TABLE weekly_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  season integer NOT NULL,
  week integer NOT NULL CHECK (week >= 1 AND week <= 18),
  fantasy_points decimal(5,2),
  passing_yards integer DEFAULT 0,
  passing_tds integer DEFAULT 0,
  passing_interceptions integer DEFAULT 0,
  rushing_yards integer DEFAULT 0,
  rushing_tds integer DEFAULT 0,
  receiving_yards integer DEFAULT 0,
  receiving_tds integer DEFAULT 0,
  receptions integer DEFAULT 0,
  fumbles_lost integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(player_id, season, week)
);

-- Create the projections table
CREATE TABLE projections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  season integer NOT NULL,
  week integer NOT NULL,
  projected_points decimal(5,2) NOT NULL,
  projection_type text NOT NULL CHECK (projection_type IN ('weekly', 'rest_of_season')),
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the user_teams table
CREATE TABLE user_teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id text,
  platform text CHECK (platform IN ('sleeper', 'espn', 'yahoo')),
  team_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the trade_values table
CREATE TABLE trade_values (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  season integer NOT NULL,
  week integer NOT NULL,
  trade_value decimal(5,2) NOT NULL,
  tier integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(player_id, season, week)
);

-- Create indexes for performance
CREATE INDEX idx_weekly_stats_player_week ON weekly_stats(player_id, season, week);
CREATE INDEX idx_projections_current ON projections(week, season, created_at DESC);
CREATE INDEX idx_players_position ON players(position, active) WHERE active = true;
CREATE INDEX idx_trade_values_current ON trade_values(player_id, trade_value DESC);

-- Enable Row Level Security
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own teams" ON user_teams
  FOR ALL USING (auth.uid() = user_id);

-- Insert sample players
INSERT INTO players (player_id, name, position, team, bye_week) VALUES
-- QBs
('josh_allen_buf', 'Josh Allen', 'QB', 'BUF', 12),
('patrick_mahomes_kc', 'Patrick Mahomes', 'QB', 'KC', 10),
('lamar_jackson_bal', 'Lamar Jackson', 'QB', 'BAL', 14),
-- RBs
('christian_mccaffrey_sf', 'Christian McCaffrey', 'RB', 'SF', 9),
('derrick_henry_bal', 'Derrick Henry', 'RB', 'BAL', 14),
('saquon_barkley_nyg', 'Saquon Barkley', 'RB', 'NYG', 11),
-- WRs
('tyreek_hill_mia', 'Tyreek Hill', 'WR', 'MIA', 6),
('stefon_diggs_hou', 'Stefon Diggs', 'WR', 'HOU', 14),
('cooper_kupp_lar', 'Cooper Kupp', 'WR', 'LAR', 6),
-- TEs
('travis_kelce_kc', 'Travis Kelce', 'TE', 'KC', 10),
('mark_andrews_bal', 'Mark Andrews', 'TE', 'BAL', 14),
('george_kittle_sf', 'George Kittle', 'TE', 'SF', 9);

-- Insert sample weekly stats for weeks 1-5 of 2024 season
-- Josh Allen stats
INSERT INTO weekly_stats (player_id, season, week, fantasy_points, passing_yards, passing_tds, passing_interceptions, rushing_yards, rushing_tds) VALUES
((SELECT id FROM players WHERE player_id = 'josh_allen_buf'), 2024, 1, 28.5, 317, 3, 0, 39, 1),
((SELECT id FROM players WHERE player_id = 'josh_allen_buf'), 2024, 2, 22.1, 265, 2, 1, 25, 0),
((SELECT id FROM players WHERE player_id = 'josh_allen_buf'), 2024, 3, 31.8, 342, 4, 0, 18, 0),
((SELECT id FROM players WHERE player_id = 'josh_allen_buf'), 2024, 4, 24.7, 291, 2, 0, 36, 1),
((SELECT id FROM players WHERE player_id = 'josh_allen_buf'), 2024, 5, 26.3, 298, 3, 1, 12, 0);

-- Patrick Mahomes stats
INSERT INTO weekly_stats (player_id, season, week, fantasy_points, passing_yards, passing_tds, passing_interceptions, rushing_yards, rushing_tds) VALUES
((SELECT id FROM players WHERE player_id = 'patrick_mahomes_kc'), 2024, 1, 21.4, 291, 1, 1, 23, 1),
((SELECT id FROM players WHERE player_id = 'patrick_mahomes_kc'), 2024, 2, 19.8, 278, 2, 0, 8, 0),
((SELECT id FROM players WHERE player_id = 'patrick_mahomes_kc'), 2024, 3, 25.6, 331, 3, 1, 15, 0),
((SELECT id FROM players WHERE player_id = 'patrick_mahomes_kc'), 2024, 4, 18.2, 245, 1, 0, 37, 1),
((SELECT id FROM players WHERE player_id = 'patrick_mahomes_kc'), 2024, 5, 23.1, 318, 2, 0, 21, 0);

-- Christian McCaffrey stats
INSERT INTO weekly_stats (player_id, season, week, fantasy_points, rushing_yards, rushing_tds, receiving_yards, receiving_tds, receptions) VALUES
((SELECT id FROM players WHERE player_id = 'christian_mccaffrey_sf'), 2024, 1, 24.8, 98, 1, 80, 1, 8),
((SELECT id FROM players WHERE player_id = 'christian_mccaffrey_sf'), 2024, 2, 18.3, 115, 1, 28, 0, 4),
((SELECT id FROM players WHERE player_id = 'christian_mccaffrey_sf'), 2024, 3, 31.2, 147, 2, 55, 1, 6),
((SELECT id FROM players WHERE player_id = 'christian_mccaffrey_sf'), 2024, 4, 22.1, 89, 1, 62, 0, 5),
((SELECT id FROM players WHERE player_id = 'christian_mccaffrey_sf'), 2024, 5, 26.7, 134, 1, 83, 1, 7);

-- Tyreek Hill stats
INSERT INTO weekly_stats (player_id, season, week, fantasy_points, receiving_yards, receiving_tds, receptions) VALUES
((SELECT id FROM players WHERE player_id = 'tyreek_hill_mia'), 2024, 1, 22.3, 123, 1, 8),
((SELECT id FROM players WHERE player_id = 'tyreek_hill_mia'), 2024, 2, 14.7, 87, 0, 6),
((SELECT id FROM players WHERE player_id = 'tyreek_hill_mia'), 2024, 3, 28.9, 149, 2, 9),
((SELECT id FROM players WHERE player_id = 'tyreek_hill_mia'), 2024, 4, 16.2, 92, 0, 7),
((SELECT id FROM players WHERE player_id = 'tyreek_hill_mia'), 2024, 5, 19.8, 108, 1, 5);

-- Travis Kelce stats
INSERT INTO weekly_stats (player_id, season, week, fantasy_points, receiving_yards, receiving_tds, receptions) VALUES
((SELECT id FROM players WHERE player_id = 'travis_kelce_kc'), 2024, 1, 18.4, 84, 1, 7),
((SELECT id FROM players WHERE player_id = 'travis_kelce_kc'), 2024, 2, 12.1, 61, 0, 5),
((SELECT id FROM players WHERE player_id = 'travis_kelce_kc'), 2024, 3, 21.7, 97, 1, 8),
((SELECT id FROM players WHERE player_id = 'travis_kelce_kc'), 2024, 4, 15.3, 73, 0, 6),
((SELECT id FROM players WHERE player_id = 'travis_kelce_kc'), 2024, 5, 19.2, 92, 1, 7);

-- Insert sample projections for week 6
INSERT INTO projections (player_id, season, week, projected_points, projection_type, confidence_score) VALUES
((SELECT id FROM players WHERE player_id = 'josh_allen_buf'), 2024, 6, 26.8, 'weekly', 0.85),
((SELECT id FROM players WHERE player_id = 'patrick_mahomes_kc'), 2024, 6, 22.4, 'weekly', 0.82),
((SELECT id FROM players WHERE player_id = 'christian_mccaffrey_sf'), 2024, 6, 24.2, 'weekly', 0.91),
((SELECT id FROM players WHERE player_id = 'tyreek_hill_mia'), 2024, 6, 18.7, 'weekly', 0.78),
((SELECT id FROM players WHERE player_id = 'travis_kelce_kc'), 2024, 6, 16.9, 'weekly', 0.80);

-- Insert sample trade values
INSERT INTO trade_values (player_id, season, week, trade_value, tier) VALUES
((SELECT id FROM players WHERE player_id = 'josh_allen_buf'), 2024, 5, 28.5, 1),
((SELECT id FROM players WHERE player_id = 'patrick_mahomes_kc'), 2024, 5, 26.2, 1),
((SELECT id FROM players WHERE player_id = 'christian_mccaffrey_sf'), 2024, 5, 32.1, 1),
((SELECT id FROM players WHERE player_id = 'tyreek_hill_mia'), 2024, 5, 24.8, 1),
((SELECT id FROM players WHERE player_id = 'travis_kelce_kc'), 2024, 5, 19.7, 2);
