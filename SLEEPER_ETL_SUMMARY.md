# Sleeper ADP & Stats ETL System - Complete Implementation

This document provides a complete overview of the weekly Sleeper ADP and stats ETL system implemented for your Supabase project.

## 🎯 Overview

The system automatically fetches and processes:
- **ADP Data**: Redraft and dynasty mock drafts from Sleeper API
- **Weekly Stats**: Current NFL week player statistics
- **Player Data**: Player information with 24-hour caching
- **Materialized Views**: Auto-refreshed ADP rankings and weekly summaries

## 📁 File Structure

```
supabase/
├── migrations/
│   └── 20250708000000-sleeper-adp-etl.sql    # Database schema
├── functions/
│   └── weekly_refresh/
│       ├── index.ts                          # Main Edge Function
│       ├── README.md                         # Function documentation
│       ├── test.ts                           # Test suite
│       ├── deploy.sh                         # Linux/Mac deployment script
│       └── deploy.ps1                        # Windows deployment script
└── config.toml                               # Updated with cron configuration
```

## 🗄️ Database Schema

### Tables Created

1. **`sleeper_drafts`** - Draft metadata
   ```sql
   draft_id text PRIMARY KEY,
   created bigint NOT NULL,
   type text NOT NULL CHECK (type IN ('redraft', 'dynasty')),
   season integer NOT NULL,
   season_type text NOT NULL DEFAULT 'regular'
   ```

2. **`sleeper_picks`** - Individual draft picks
   ```sql
   draft_id text REFERENCES sleeper_drafts(draft_id),
   player_id text NOT NULL,
   pick_no integer NOT NULL,
   PRIMARY KEY (draft_id, player_id)
   ```

3. **`sleeper_stats`** - Weekly player stats
   ```sql
   season integer NOT NULL,
   week integer NOT NULL CHECK (week >= 1 AND week <= 18),
   player_id text NOT NULL,
   pts_ppr numeric(6,2),
   rec_yd integer DEFAULT 0,
   rec_td integer DEFAULT 0,
   rush_yd integer DEFAULT 0,
   pass_yd integer DEFAULT 0,
   pass_td integer DEFAULT 0,
   PRIMARY KEY (season, week, player_id)
   ```

4. **`sleeper_players_cache`** - Player data cache (24-hour TTL)
   ```sql
   player_id text PRIMARY KEY,
   full_name text NOT NULL,
   position text,
   team text,
   bye_week integer,
   last_updated timestamp with time zone
   ```

5. **`etl_metadata`** - ETL run tracking
   ```sql
   id uuid PRIMARY KEY,
   run_type text NOT NULL,
   last_run timestamp with time zone,
   last_created_timestamp bigint,
   last_season integer,
   last_week integer,
   records_processed integer,
   status text,
   error_message text
   ```

### Materialized Views

1. **`top200_redraft`** - Top 200 redraft ADP (≥3 samples)
2. **`top200_dynasty`** - Top 200 dynasty ADP (≥3 samples)
3. **`weekly_player_summary`** - Weekly stats with fantasy finish rankings

### Helper Functions

- `get_last_refresh(run_type)` - Get last refresh timestamp
- `get_last_stats_refresh()` - Get last stats refresh info
- `refresh_views()` - Refresh all materialized views concurrently
- `clean_old_etl_metadata()` - Clean old metadata (30-day retention)

## 🔧 Edge Function Features

### Core Components

1. **RateLimiter Class**
   - Enforces ≤1 request/0.5s to respect Sleeper API limits
   - Automatic throttling between requests

2. **SleeperAPI Class**
   - Handles all Sleeper API interactions
   - Rate-limited requests
   - Error handling and retries

3. **DatabaseOps Class**
   - Manages all database operations
   - Batch inserts for performance
   - Upsert operations with conflict resolution

4. **ETLProcessor Class**
   - Orchestrates the entire ETL process
   - Handles ADP, stats, and player processing
   - Error tracking and recovery

### API Endpoints Used

- `GET /v1/drafts/nfl/mock-drafts` - Fetch mock drafts
- `GET /v1/draft/{draft_id}/picks` - Fetch draft picks
- `GET /v1/stats/nfl/{season}/{week}` - Fetch weekly stats
- `GET /v1/players/nfl` - Fetch player data
- `GET /v1/state/nfl` - Get current NFL state

## 🚀 Deployment

### Quick Start

1. **Deploy Database Schema**
   ```bash
   supabase db push
   ```

2. **Deploy Edge Function**
   ```bash
   supabase functions deploy weekly_refresh
   ```

3. **Set Environment Variables**
   ```bash
   supabase secrets set SUPABASE_URL=your_supabase_url
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run Deployment Script** (Windows)
   ```powershell
   .\supabase\functions\weekly_refresh\deploy.ps1
   ```

### Automated Scheduling

The function is configured to run every Tuesday at 09:00 UTC via cron:

```toml
[cron]
"weekly-sleeper-etl" = "0 9 * * 2"
```

## 📊 Data Flow

### Weekly ETL Process

1. **ADP Processing**
   - Get last refresh timestamp from `etl_metadata`
   - Fetch new drafts since last run for both redraft and dynasty
   - Insert draft metadata into `sleeper_drafts`
   - Fetch and insert picks into `sleeper_picks`
   - Update last created timestamp

2. **Stats Processing**
   - Get current NFL week from `/state/nfl`
   - Check if new week data is available
   - Fetch weekly stats and insert into `sleeper_stats`

3. **Player Cache Update**
   - Check if player cache is >24 hours old
   - Update `sleeper_players_cache` if needed

4. **View Refresh**
   - Refresh all materialized views concurrently
   - Clean old ETL metadata

### ADP Calculation

- Average `pick_no` for each player
- Filter players with ≥3 samples
- Order by ADP ascending
- Limit to top 200 players

## 🔍 Monitoring & Querying

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
-- Latest week stats with fantasy finish
SELECT * FROM weekly_player_summary 
WHERE season = 2024 
ORDER BY week DESC, fantasy_finish ASC 
LIMIT 20;
```

### Performance Metrics
```sql
-- Draft counts by type
SELECT type, COUNT(*) as draft_count 
FROM sleeper_drafts 
WHERE season = 2024 
GROUP BY type;

-- Stats coverage
SELECT season, week, COUNT(*) as player_count 
FROM sleeper_stats 
GROUP BY season, week 
ORDER BY season DESC, week DESC;
```

## 🛡️ Error Handling & Reliability

### Rate Limiting
- Automatic throttling (≤1 request/0.5s)
- Graceful handling of rate limit errors
- Exponential backoff for retries

### Error Recovery
- Individual draft processing errors don't stop the entire process
- All errors logged to `etl_metadata` table
- Partial success tracking
- Automatic retry mechanisms

### Data Integrity
- Upsert operations prevent duplicates
- Foreign key constraints maintain referential integrity
- Check constraints validate data ranges
- Unique indexes ensure data consistency

## 🔒 Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Read-only access for authenticated users
- Service role key used for ETL operations

### Environment Variables
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database operations

## 📈 Performance Optimizations

### Database
- Materialized views for fast ADP queries
- Concurrent view refresh to minimize downtime
- Batch inserts for picks and stats
- Proper indexing on all query patterns

### API
- 24-hour player cache reduces API calls
- Incremental processing (only new data)
- Rate limiting prevents API throttling
- Efficient pagination for large datasets

### Storage
- 30-day metadata retention
- Automatic cleanup of old records
- Optimized data types and constraints

## 🧪 Testing

### Test Suite
```bash
# Run tests (requires Deno)
deno test --allow-net --allow-env supabase/functions/weekly_refresh/test.ts
```

### Manual Testing
```bash
# Test function endpoint
curl -X POST https://your-project.supabase.co/functions/v1/weekly_refresh \
  -H "Authorization: Bearer your_anon_key"
```

## 🔧 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
   - Check with `supabase secrets list`

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
Add more detailed logging to the Edge Function for troubleshooting:

```typescript
console.log('Processing draft:', draft.draft_id);
console.log('Records processed:', recordsProcessed);
```

## 📋 Maintenance

### Regular Tasks
- Monitor ETL metadata for errors
- Check materialized view refresh status
- Review API rate limit usage
- Clean old data as needed

### Updates
- Update Sleeper API endpoints if needed
- Modify ADP calculation logic if requirements change
- Adjust rate limiting parameters
- Update cron schedule if timing changes

## 🎉 Success Metrics

The system is working correctly when:
- ETL runs complete with `status = 'success'`
- Materialized views refresh without errors
- ADP data shows ≥3 samples for most players
- Weekly stats are updated for current NFL week
- Player cache updates every 24 hours

---

**Ready to deploy!** 🚀

Run the deployment script and the system will automatically start collecting Sleeper ADP and stats data every Tuesday at 09:00 UTC. 