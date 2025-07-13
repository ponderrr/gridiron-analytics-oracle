# Deploy the profile management function
Write-Host "Deploying profile management function..." -ForegroundColor Green

# Deploy the function
supabase functions deploy profile-management --project-ref yhibrugwsqqbujeosxzg

# Run the migration to create the avatars storage bucket
Write-Host "Running migration for avatars storage..." -ForegroundColor Green
supabase db push

Write-Host "Profile management function deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Make sure to set the following environment variables in your Supabase project:" -ForegroundColor Yellow
Write-Host "- SUPABASE_URL" -ForegroundColor Yellow
Write-Host "- SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
Write-Host ""
Write-Host "The function will be available at:" -ForegroundColor Cyan
Write-Host "https://yhibrugwsqqbujeosxzg.supabase.co/functions/v1/profile-management" -ForegroundColor Cyan 