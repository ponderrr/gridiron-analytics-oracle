-- Migration to replace draft_picks table with simplified bucket structure
-- This replaces individual picks (1.01, 1.02, etc.) with bucket picks (Mid to Late 1st, etc.)

-- =============================
-- BACKUP EXISTING DATA (optional)
-- =============================

-- Create a backup of the existing draft_picks table
CREATE TABLE IF NOT EXISTS draft_picks_backup AS 
SELECT * FROM draft_picks;

-- =============================
-- DROP AND RECREATE DRAFT_PICKS TABLE
-- =============================

-- Drop the existing draft_picks table
DROP TABLE IF EXISTS draft_picks CASCADE;

-- Create new draft_picks table with simplified structure
CREATE TABLE draft_picks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  year integer NOT NULL,
  pick_type text NOT NULL CHECK (pick_type IN (
    'early_1st', 'mid_late_1st', 'early_2nd', 'mid_late_2nd', '3rd', '4th'
  )),
  display_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(year, pick_type)
);

-- =============================
-- INSERT THE SPECIFIED ROOKIE PICKS
-- =============================

INSERT INTO draft_picks (year, pick_type, display_name, description) VALUES
-- 2025 Picks
(2025, 'early_1st', '2025 Early to Mid 1st', '2025 1st round picks (early to mid)'),
(2025, 'mid_late_1st', '2025 Mid to Late 1st', '2025 1st round picks (mid to late)'),
(2025, 'early_2nd', '2025 Early to Mid 2nd', '2025 2nd round picks (early to mid)'),
(2025, 'mid_late_2nd', '2025 Mid to Late 2nd', '2025 2nd round picks (mid to late)'),
(2025, '3rd', '2025 3rd Round Pick', '2025 3rd round picks'),
(2025, '4th', '2025 4th Round Pick', '2025 4th round picks'),

-- 2026 Picks
(2026, 'early_1st', '2026 Early to Mid 1st', '2026 1st round picks (early to mid)'),
(2026, 'mid_late_1st', '2026 Mid to Late 1st', '2026 1st round picks (mid to late)'),
(2026, 'early_2nd', '2026 Early to Mid 2nd', '2026 2nd round picks (early to mid)'),
(2026, 'mid_late_2nd', '2026 Mid to Late 2nd', '2026 2nd round picks (mid to late)'),
(2026, '3rd', '2026 3rd Round Pick', '2026 3rd round picks'),
(2026, '4th', '2026 4th Round Pick', '2026 4th round picks'),

-- 2027 Picks
(2027, 'early_1st', '2027 Early to Mid 1st', '2027 1st round picks (early to mid)'),
(2027, 'mid_late_1st', '2027 Mid to Late 1st', '2027 1st round picks (mid to late)'),
(2027, 'early_2nd', '2027 Early to Mid 2nd', '2027 2nd round picks (early to mid)'),
(2027, 'mid_late_2nd', '2027 Mid to Late 2nd', '2027 2nd round picks (mid to late)'),
(2027, '3rd', '2027 3rd Round Pick', '2027 3rd round picks'),
(2027, '4th', '2027 4th Round Pick', '2027 4th round picks'),

-- 2028 Picks
(2028, 'early_1st', '2028 Early to Mid 1st', '2028 1st round picks (early to mid)'),
(2028, 'mid_late_1st', '2028 Mid to Late 1st', '2028 1st round picks (mid to late)'),
(2028, 'early_2nd', '2028 Early to Mid 2nd', '2028 2nd round picks (early to mid)'),
(2028, 'mid_late_2nd', '2028 Mid to Late 2nd', '2028 2nd round picks (mid to late)'),
(2028, '3rd', '2028 3rd Round Pick', '2028 3rd round picks'),
(2028, '4th', '2028 4th Round Pick', '2028 4th round picks');

-- =============================
-- ADD INDEXES
-- =============================

CREATE INDEX idx_draft_picks_year ON draft_picks(year);
CREATE INDEX idx_draft_picks_active ON draft_picks(is_active) WHERE is_active = true;
CREATE INDEX idx_draft_picks_year_active ON draft_picks(year, is_active) WHERE is_active = true;

-- =============================
-- ROW LEVEL SECURITY
-- =============================

-- Enable RLS on draft_picks
ALTER TABLE draft_picks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active draft picks
CREATE POLICY "Allow authenticated users to read active draft picks" ON draft_picks
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow service role to manage draft picks (for admin functions)
CREATE POLICY "Allow service role to manage draft picks" ON draft_picks
  FOR ALL USING (auth.role() = 'service_role');

-- =============================
-- UPDATE HELPER FUNCTION
-- =============================

-- Update the function to work with the new structure
CREATE OR REPLACE FUNCTION get_draft_picks_for_year(pick_year integer)
RETURNS TABLE (
  id uuid,
  year integer,
  pick_type text,
  display_name text,
  description text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.year,
    dp.pick_type,
    dp.display_name,
    dp.description
  FROM draft_picks dp
  WHERE dp.year = pick_year 
    AND dp.is_active = true
  ORDER BY 
    CASE dp.pick_type
      WHEN 'early_1st' THEN 1
      WHEN 'mid_late_1st' THEN 2
      WHEN 'early_2nd' THEN 3
      WHEN 'mid_late_2nd' THEN 4
      WHEN '3rd' THEN 5
      WHEN '4th' THEN 6
      ELSE 7
    END;
END;
$$ LANGUAGE plpgsql; 