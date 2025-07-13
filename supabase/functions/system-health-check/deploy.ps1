# Deploy the system-health-check edge function
Write-Host "Deploying system-health-check edge function..." -ForegroundColor Green

# Navigate to the function directory
Set-Location $PSScriptRoot

# Deploy the function
supabase functions deploy system-health-check

Write-Host "System health check function deployed successfully!" -ForegroundColor Green 