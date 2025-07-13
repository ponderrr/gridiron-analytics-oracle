# System Health Check Function

This edge function provides real-time health monitoring for the Gridiron Analytics Oracle system components.

## Features

- **Database Health**: Checks connectivity and basic query performance
- **Edge Functions Health**: Verifies edge function deployment and response times
- **NFLVerse API Health**: Monitors external API accessibility
- **Sleeper Cache Health**: Checks cache availability and data freshness

## Health Status Levels

- **Healthy**: Service is fully operational
- **Degraded**: Service is partially functional but may have issues
- **Down**: Service is unavailable or experiencing critical issues

## Response Format

```json
{
  "success": true,
  "data": {
    "database": {
      "service": "database",
      "status": "healthy",
      "responseTime": 45,
      "details": { "recordCount": 1 }
    },
    "edgeFunctions": {
      "service": "edgeFunctions",
      "status": "healthy",
      "responseTime": 120
    },
    "nflverseApi": {
      "service": "nflverseApi",
      "status": "healthy",
      "responseTime": 200
    },
    "sleeperCache": {
      "service": "sleeperCache",
      "status": "healthy",
      "responseTime": 30,
      "details": {
        "hasData": true,
        "isRecent": true,
        "lastUpdate": "2024-01-15T10:30:00Z"
      }
    },
    "overall": "healthy",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Deployment

### Using PowerShell (Windows)

```powershell
.\deploy.ps1
```

### Using Bash (Linux/Mac)

```bash
./deploy.sh
```

### Manual Deployment

```bash
supabase functions deploy system-health-check
```

## Usage

The function is automatically called by the AdminMapping page every 30 seconds and can be manually refreshed using the "Refresh" button in the UI.
