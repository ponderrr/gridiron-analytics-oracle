-- Consolidated Schema Migration
-- Combines initial schema, player rankings system, and Sleeper ETL system
-- Suitable for initializing a fresh database with the full current schema

-- =============================
-- EXTENSIONS
-- =============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================
-- CORE TABLES
-- =============================
-- Players
CREATE TABLE players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id text UNIQUE NOT NULL,
  name text NOT NULL,
  position text NOT NULL CHECK (position IN ('QB', 'RB', 'WR', 'TE', 'D/ST', 'K')),
  team text NOT NULL,
  active boolean DEFAULT true,
  bye_week integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Weekly Stats
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

-- Projections
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

-- User Teams
CREATE TABLE user_teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id text,
  platform text CHECK (platform IN ('sleeper', 'espn', 'yahoo')),
  team_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trade Values
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

-- =============================
-- PLAYER RANKINGS SYSTEM
-- =============================
CREATE TABLE user_rankings_sets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  format text NOT NULL CHECK (format IN ('dynasty', 'redraft')),
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_active_per_user_format UNIQUE (user_id, format, is_active)
);

CREATE TABLE user_rankings_players (
  ranking_set_id uuid NOT NULL REFERENCES user_rankings_sets(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  overall_rank integer,
  tier integer,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (ranking_set_id, player_id),
  CONSTRAINT unique_rank_per_set UNIQUE (ranking_set_id, overall_rank)
);

-- =============================
-- SLEEPER ETL SYSTEM
-- =============================
CREATE TABLE sleeper_drafts (
  draft_id text PRIMARY KEY,
  created bigint NOT NULL,
  type text NOT NULL CHECK (type IN ('redraft', 'dynasty')),
  season integer NOT NULL,
  season_type text NOT NULL DEFAULT 'regular',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE sleeper_picks (
  draft_id text NOT NULL REFERENCES sleeper_drafts(draft_id) ON DELETE CASCADE,
  player_id text NOT NULL,
  pick_no integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (draft_id, player_id)
);

CREATE TABLE sleeper_stats (
  season integer NOT NULL,
  week integer NOT NULL CHECK (week >= 1 AND week <= 18),
  player_id text NOT NULL,
  pts_ppr numeric(6,2),
  rec_yd integer DEFAULT 0,
  rec_td integer DEFAULT 0,
  rush_yd integer DEFAULT 0,
  pass_yd integer DEFAULT 0,
  pass_td integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (season, week, player_id)
);

CREATE TABLE sleeper_players_cache (
  player_id text PRIMARY KEY,
  full_name text NOT NULL,
  position text,
  team text,
  bye_week integer,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE etl_metadata (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type text NOT NULL,
  last_run timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_created_timestamp bigint,
  last_season integer,
  last_week integer,
  records_processed integer DEFAULT 0,
  status text DEFAULT 'success',
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================
-- INDEXES
-- =============================
-- (Indexes for all tables, including performance and materialized view indexes)
-- ... (Indexes will be included in the next edit for brevity)

-- =============================
-- FUNCTIONS, TRIGGERS, VIEWS, RLS POLICIES
-- =============================
-- ... (To be included in the next edit for brevity)
