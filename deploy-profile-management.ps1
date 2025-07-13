# Deploy Profile Management Function
# This script will deploy the profile management functionality to Supabase

Write-Host "🚀 Deploying Profile Management Function" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if Supabase CLI is available
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "See SUPABASE_CLI_INSTALL.md for installation instructions." -ForegroundColor Yellow
    exit 1
}

# Deploy the function
Write-Host "📦 Deploying profile-management function..." -ForegroundColor Yellow
try {
    supabase functions deploy profile-management
    Write-Host "✅ Function deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy function: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
try {
    supabase db push
    Write-Host "✅ Migrations applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to run migrations: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your profile management function is now available at:" -ForegroundColor Cyan
Write-Host "https://your-project-ref.supabase.co/functions/v1/profile-management" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now test:" -ForegroundColor Yellow
Write-Host "- Profile updates" -ForegroundColor Yellow
Write-Host "- Avatar uploads" -ForegroundColor Yellow
Write-Host "- Profile data retrieval" -ForegroundColor Yellow 