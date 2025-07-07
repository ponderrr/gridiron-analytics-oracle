-- Create draft_picks table
CREATE TABLE public.draft_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  round INTEGER NOT NULL,
  pick INTEGER NOT NULL,
  overall_pick INTEGER NOT NULL,
  league_type TEXT NOT NULL CHECK (league_type IN ('dynasty', 'rookie')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_draft_picks_year_round ON public.draft_picks(year, round);
CREATE INDEX idx_draft_picks_league_type ON public.draft_picks(league_type);

-- Enable RLS
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - draft picks are publicly viewable
CREATE POLICY "Draft picks are viewable by everyone" 
ON public.draft_picks 
FOR SELECT 
USING (true);

-- Populate with dynasty rookie draft picks for 2024-2027 (rounds 1-4, 12 picks per round)
DO $$
DECLARE
  year_val INTEGER;
  round_val INTEGER;
  pick_val INTEGER;
  overall_counter INTEGER := 1;
BEGIN
  FOR year_val IN 2024..2027 LOOP
    overall_counter := 1;
    FOR round_val IN 1..4 LOOP
      FOR pick_val IN 1..12 LOOP
        INSERT INTO public.draft_picks (year, round, pick, overall_pick, league_type)
        VALUES (
          year_val,
          round_val,
          pick_val,
          overall_counter,
          'dynasty'
        );
        overall_counter := overall_counter + 1;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;