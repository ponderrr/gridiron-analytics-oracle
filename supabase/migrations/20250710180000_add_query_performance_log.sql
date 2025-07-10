-- Create monitoring infrastructure
CREATE TABLE query_performance_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  query_type text NOT NULL,
  execution_time_ms integer NOT NULL,
  rows_affected integer DEFAULT 0,
  query_hash text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_query_performance_type_time 
ON query_performance_log(query_type, created_at DESC); 