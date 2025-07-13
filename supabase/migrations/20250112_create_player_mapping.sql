-- Create the master player ID mapping table
CREATE TABLE player_id_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sleeper_id text NOT NULL,
  nflverse_id text NOT NULL,
  canonical_name text NOT NULL,
  alternate_names text[], -- Array of known variations
  confidence_score numeric(3,2) DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  match_method text NOT NULL CHECK (match_method IN ('exact', 'fuzzy', 'manual', 'community')),
  position text,
  team text, -- For disambiguation, but not used for matching
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verified boolean DEFAULT false,
  notes text,
  UNIQUE(sleeper_id, nflverse_id)
);

-- Create indexes for fast lookups
CREATE INDEX idx_player_mapping_sleeper ON player_id_mapping(sleeper_id);
CREATE INDEX idx_player_mapping_nflverse ON player_id_mapping(nflverse_id);
CREATE INDEX idx_player_mapping_canonical ON player_id_mapping(canonical_name);
CREATE INDEX idx_player_mapping_method ON player_id_mapping(match_method);

-- Create table for tracking unmapped players
CREATE TABLE unmapped_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('sleeper', 'nflverse')),
  player_id text NOT NULL,
  player_name text NOT NULL,
  position text,
  team text,
  first_seen timestamp with time zone DEFAULT now(),
  attempts_count integer DEFAULT 1,
  last_attempt timestamp with time zone DEFAULT now(),
  notes text
);

CREATE INDEX idx_unmapped_source ON unmapped_players(source);
CREATE INDEX idx_unmapped_attempts ON unmapped_players(attempts_count);

-- Create table for mapping audit trail
CREATE TABLE mapping_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mapping_id uuid REFERENCES player_id_mapping(id),
  action text NOT NULL CHECK (action IN ('created', 'updated', 'verified', 'rejected')),
  old_values jsonb,
  new_values jsonb,
  performed_by text,
  performed_at timestamp with time zone DEFAULT now(),
  notes text
);

CREATE INDEX idx_mapping_audit_mapping ON mapping_audit(mapping_id);
CREATE INDEX idx_mapping_audit_action ON mapping_audit(action); 