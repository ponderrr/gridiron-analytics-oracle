-- Fix confidence_score column precision
-- Change from numeric to numeric(3,2) for consistent storage and performance

-- First, check if the table exists and has the column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_id_mapping' 
        AND column_name = 'confidence_score'
        AND data_type = 'numeric'
        AND numeric_precision IS NULL
    ) THEN
        -- Alter the column to add precision and scale
        ALTER TABLE player_id_mapping 
        ALTER COLUMN confidence_score TYPE numeric(3,2);
        
        RAISE NOTICE 'Updated confidence_score column to numeric(3,2)';
    ELSE
        RAISE NOTICE 'confidence_score column already has proper precision or table does not exist';
    END IF;
END $$; 