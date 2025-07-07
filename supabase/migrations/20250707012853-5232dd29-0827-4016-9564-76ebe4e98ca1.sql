-- Add pick_id column to user_rankings_players table to support both players and draft picks
ALTER TABLE public.user_rankings_players 
ADD COLUMN pick_id UUID NULL;

-- Add foreign key constraint to draft_picks table
ALTER TABLE public.user_rankings_players 
ADD CONSTRAINT fk_user_rankings_players_pick_id 
FOREIGN KEY (pick_id) REFERENCES public.draft_picks(id) ON DELETE CASCADE;

-- Add constraint to ensure either player_id or pick_id is set, but not both
ALTER TABLE public.user_rankings_players 
ADD CONSTRAINT chk_player_or_pick 
CHECK (
  (player_id IS NOT NULL AND pick_id IS NULL) OR 
  (player_id IS NULL AND pick_id IS NOT NULL)
);

-- Create index for efficient querying of picks in rankings
CREATE INDEX idx_user_rankings_players_pick_id ON public.user_rankings_players(pick_id);

-- Update RLS policies to work with both players and picks
-- The existing policies should work since they check ranking_set_id ownership