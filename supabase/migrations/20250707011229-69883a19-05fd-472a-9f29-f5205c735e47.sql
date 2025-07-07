-- Create sync_logs table for comprehensive sync tracking
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN NOT NULL DEFAULT false,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  validation_errors INTEGER DEFAULT 0,
  database_errors INTEGER DEFAULT 0,
  api_errors INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_details JSONB,
  validation_stats JSONB,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_sync_logs_type_started ON public.sync_logs(sync_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_success ON public.sync_logs(success, started_at DESC);

-- Create validation functions
CREATE OR REPLACE FUNCTION public.validate_player_data(
  player_name TEXT,
  player_position TEXT,
  player_team TEXT
) RETURNS JSONB AS $$
DECLARE
  validation_result JSONB := '{"valid": true, "errors": []}'::JSONB;
  errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Validate required fields
  IF player_name IS NULL OR LENGTH(TRIM(player_name)) = 0 THEN
    errors := array_append(errors, 'Player name is required');
  END IF;
  
  IF player_position IS NULL OR LENGTH(TRIM(player_position)) = 0 THEN
    errors := array_append(errors, 'Player position is required');
  END IF;
  
  IF player_team IS NULL OR LENGTH(TRIM(player_team)) = 0 THEN
    errors := array_append(errors, 'Player team is required');
  END IF;
  
  -- Validate position enum
  IF player_position IS NOT NULL AND NOT (player_position = ANY(ARRAY['QB', 'RB', 'WR', 'TE', 'K', 'D/ST'])) THEN
    errors := array_append(errors, 'Invalid position: ' || player_position);
  END IF;
  
  -- Validate team code (3-4 characters, all caps)
  IF player_team IS NOT NULL AND player_team != 'FA' AND (LENGTH(player_team) < 2 OR LENGTH(player_team) > 4 OR player_team != UPPER(player_team)) THEN
    errors := array_append(errors, 'Invalid team code format: ' || player_team);
  END IF;
  
  -- Build result
  IF array_length(errors, 1) > 0 THEN
    validation_result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN validation_result;
END;
$$ LANGUAGE plpgsql;

-- Create function to log sync operations
CREATE OR REPLACE FUNCTION public.log_sync_operation(
  sync_type TEXT,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  validation_errors INTEGER DEFAULT 0,
  database_errors INTEGER DEFAULT 0,
  api_errors INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT NULL,
  error_details JSONB DEFAULT NULL,
  validation_stats JSONB DEFAULT NULL,
  performance_metrics JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
  success_flag BOOLEAN;
BEGIN
  -- Determine success based on error counts
  success_flag := (validation_errors + database_errors + api_errors) = 0 AND processed_records > 0;
  
  INSERT INTO public.sync_logs (
    sync_type,
    success,
    total_records,
    processed_records,
    validation_errors,
    database_errors,
    api_errors,
    duration_ms,
    error_details,
    validation_stats,
    performance_metrics,
    completed_at
  ) VALUES (
    sync_type,
    success_flag,
    total_records,
    processed_records,
    validation_errors,
    database_errors,
    api_errors,
    duration_ms,
    error_details,
    validation_stats,
    performance_metrics,
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;