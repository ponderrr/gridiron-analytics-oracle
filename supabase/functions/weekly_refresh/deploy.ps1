# Weekly Sleeper ADP & Stats ETL Deployment Script (PowerShell)
# This script deploys the weekly_refresh Edge Function and sets up the required configuration

param(
    [switch]$SkipTests
)

Write-Host "🚀 Deploying Weekly Sleeper ADP & Stats ETL..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Status "Supabase CLI found"
} catch {
    Write-Error "Supabase CLI is not installed. Please install it first:"
    Write-Host "npm install -g supabase" -ForegroundColor Cyan
    exit 1
}

# Check if we're in a Supabase project
if (-not (Test-Path "supabase/config.toml")) {
    Write-Error "Not in a Supabase project directory. Please run this from your project root."
    exit 1
}

Write-Status "Supabase project detected"

# Deploy the database migration
Write-Status "Deploying database migration..."
try {
    supabase db push
    Write-Status "Database migration deployed successfully"
} catch {
    Write-Error "Database migration failed"
    exit 1
}

# Deploy the Edge Function
Write-Status "Deploying weekly_refresh Edge Function..."
try {
    supabase functions deploy weekly_refresh
    Write-Status "Edge Function deployed successfully"
} catch {
    Write-Error "Edge Function deployment failed"
    exit 1
}

# Check if environment variables are set
Write-Status "Checking environment variables..."

$secrets = supabase secrets list 2>$null
$supabaseUrl = $secrets | Select-String "SUPABASE_URL"
$supabaseServiceKey = $secrets | Select-String "SUPABASE_SERVICE_ROLE_KEY"

if (-not $supabaseUrl) {
    Write-Warning "SUPABASE_URL not set. Please set it with:"
    Write-Host "supabase secrets set SUPABASE_URL=your_supabase_url" -ForegroundColor Cyan
}

if (-not $supabaseServiceKey) {
    Write-Warning "SUPABASE_SERVICE_ROLE_KEY not set. Please set it with:"
    Write-Host "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" -ForegroundColor Cyan
}

# Test the function (optional)
if (-not $SkipTests) {
    Write-Status "Testing the Edge Function..."
    
    try {
        $status = supabase status
        $projectUrl = ($status | Select-String "API URL").ToString().Split(" ")[-1]
        
        if ($projectUrl) {
            Write-Host "Testing function at: ${projectUrl}/functions/v1/weekly_refresh" -ForegroundColor Cyan
            
            # Note: This will fail without proper authentication, but it tests the endpoint
            try {
                Invoke-RestMethod -Uri "${projectUrl}/functions/v1/weekly_refresh" `
                    -Method POST `
                    -ContentType "application/json" `
                    -TimeoutSec 30 | Out-Null
            } catch {
                Write-Warning "Function test failed (expected without auth)"
            }
        } else {
            Write-Warning "Could not determine project URL for testing"
        }
    } catch {
        Write-Warning "Could not test function (this is normal)"
    }
}

# Display next steps
Write-Host ""
Write-Status "Deployment completed!"
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variables:" -ForegroundColor White
Write-Host "   supabase secrets set SUPABASE_URL=your_supabase_url" -ForegroundColor Gray
Write-Host "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the function manually:" -ForegroundColor White
Write-Host "   curl -X POST https://your-project.supabase.co/functions/v1/weekly_refresh \" -ForegroundColor Gray
Write-Host "     -H \"Authorization: Bearer your_anon_key\"" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Monitor the ETL process:" -ForegroundColor White
Write-Host "   SELECT * FROM etl_metadata ORDER BY last_run DESC;" -ForegroundColor Gray
Write-Host ""
Write-Host "4. View the results:" -ForegroundColor White
Write-Host "   SELECT * FROM top200_redraft LIMIT 10;" -ForegroundColor Gray
Write-Host "   SELECT * FROM top200_dynasty LIMIT 10;" -ForegroundColor Gray
Write-Host "   SELECT * FROM weekly_player_summary WHERE season = 2024 ORDER BY week DESC LIMIT 20;" -ForegroundColor Gray
Write-Host ""
Write-Host "🕐 The function will run automatically every Tuesday at 09:00 UTC" -ForegroundColor White
Write-Host "   (configured in supabase/config.toml)" -ForegroundColor Gray
Write-Host ""
Write-Status "Setup complete! 🎉" 