# Weekly Sleeper ADP & Stats ETL

This Edge Function runs a weekly ETL process to fetch and process Sleeper ADP (Average Draft Position) data and weekly player stats.

## Features

- **ADP Processing**: Fetches redraft and dynasty mock drafts from Sleeper API
- **Weekly Stats**: Retrieves current NFL week stats for all players
- **Player Cache**: Maintains a 24-hour cache of player data
- **Rate Limiting**: Respects Sleeper API rate limits (≤1 request/0.5s)
- **Materialized Views**: Auto-refreshes ADP and stats views
- **Error Handling**: Comprehensive error tracking and recovery
- **Metadata Tracking**: Logs all ETL runs with timestamps and status

## Database Schema

### Tables
- `sleeper_drafts`: Draft metadata (draft_id, created, type, season)
- `sleeper_picks`: Individual draft picks (draft_id, player_id, pick_no)
- `sleeper_stats`: Weekly player stats (season, week, player_id, pts_ppr, etc.)
- `sleeper_players_cache`: Player data cache with 24-hour TTL
- `etl_metadata`: ETL run tracking and timestamps

### Materialized Views
- `top200_redraft`: Top 200 players by redraft ADP (≥3 samples)
- `top200_dynasty`: Top 200 players by dynasty ADP (≥3 samples)
- `weekly_player_summary`: Weekly stats with fantasy finish rankings

## Setup

### 1. Deploy the Migration

```bash
supabase db push
```

### 2. Deploy the Edge Function

```bash
supabase functions deploy weekly_refresh
```

### 3. Set Environment Variables

```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set Up Cron Job

Add this to your `supabase/config.toml`:

```toml
[cron]
"weekly-sleeper-etl" = "0 9 * * 2"  # Tuesday 09:00 UTC
```

Or manually trigger via:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/weekly_refresh \
  -H "Authorization: Bearer your_anon_key"
```

## API Endpoints

### Sleeper API Endpoints Used

- `GET /v1/drafts/nfl/mock-drafts` - Fetch mock drafts
- `GET /v1/draft/{draft_id}/picks` - Fetch draft picks
- `GET /v1/stats/nfl/{season}/{week}` - Fetch weekly stats
- `GET /v1/players/nfl` - Fetch player data
- `GET /v1/state/nfl` - Get current NFL state

### Function Response

```json
{
  "success": true,
  "message": "Weekly ETL process completed successfully",
  "timestamp": "2024-01-01T09:00:00.000Z"
}
```

## ETL Process Flow

1. **ADP Processing**
   - Get last refresh timestamp
   - Fetch new drafts since last run
   - Insert draft metadata and picks
   - Update last created timestamp

2. **Stats Processing**
   - Get current NFL week from `/state/nfl`
   - Check if new week data available
   - Fetch and insert weekly stats

3. **Player Cache**
   - Check if player cache is >24 hours old
   - Update player data if needed

4. **View Refresh**
   - Refresh all materialized views concurrently
   - Clean old ETL metadata

## Rate Limiting

The function implements rate limiting to respect Sleeper API limits:
- Maximum 1 request per 0.5 seconds
- Automatic throttling between requests
- Graceful handling of rate limit errors

## Error Handling

- Individual draft processing errors don't stop the entire process
- All errors are logged to `etl_metadata` table
- Function returns appropriate HTTP status codes
- Comprehensive error messages for debugging

## Monitoring

### Check ETL Status

```sql
SELECT 
  run_type,
  last_run,
  status,
  records_processed,
  error_message
FROM etl_metadata 
ORDER BY last_run DESC;
```

### View ADP Data

```sql
-- Redraft ADP
SELECT * FROM top200_redraft LIMIT 10;

-- Dynasty ADP  
SELECT * FROM top200_dynasty LIMIT 10;
```

### View Weekly Stats

```sql
-- Latest week stats
SELECT * FROM weekly_player_summary 
WHERE season = 2024 
ORDER BY week DESC, fantasy_finish ASC 
LIMIT 20;
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

2. **Rate Limit Errors**
   - Function automatically handles rate limiting
   - Check logs for specific error messages

3. **Database Connection Issues**
   - Verify service role key has proper permissions
   - Check Supabase project status

4. **Materialized View Refresh Failures**
   - Views require unique indexes for concurrent refresh
   - Check for data consistency issues

### Debug Mode

To run with verbose logging, modify the function to include more detailed console.log statements.

## Performance Considerations

- Materialized views are refreshed concurrently to minimize downtime
- Batch inserts are used for picks and stats data
- Player cache reduces API calls by 24-hour TTL
- Old metadata is automatically cleaned (30-day retention)

## Security

- Uses service role key for database operations
- Row Level Security (RLS) enabled on all tables
- Read-only access for authenticated users
- No sensitive data exposed in logs 