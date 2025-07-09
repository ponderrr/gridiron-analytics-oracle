#!/bin/bash

# Weekly Sleeper ADP & Stats ETL Deployment Script
# This script deploys the weekly_refresh Edge Function and sets up the required configuration

set -e

echo "🚀 Deploying Weekly Sleeper ADP & Stats ETL..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    print_error "Not in a Supabase project directory. Please run this from your project root."
    exit 1
fi

print_status "Supabase CLI found and project detected"

# Deploy the database migration
print_status "Deploying database migration..."
supabase db push

if [ $? -eq 0 ]; then
    print_status "Database migration deployed successfully"
else
    print_error "Database migration failed"
    exit 1
fi

# Deploy the Edge Function
print_status "Deploying weekly_refresh Edge Function..."
supabase functions deploy weekly_refresh

if [ $? -eq 0 ]; then
    print_status "Edge Function deployed successfully"
else
    print_error "Edge Function deployment failed"
    exit 1
fi

# Check if environment variables are set
print_status "Checking environment variables..."

SUPABASE_URL=$(supabase secrets list | grep SUPABASE_URL || echo "")
SUPABASE_SERVICE_KEY=$(supabase secrets list | grep SUPABASE_SERVICE_ROLE_KEY || echo "")

if [ -z "$SUPABASE_URL" ]; then
    print_warning "SUPABASE_URL not set. Please set it with:"
    echo "supabase secrets set SUPABASE_URL=your_supabase_url"
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    print_warning "SUPABASE_SERVICE_ROLE_KEY not set. Please set it with:"
    echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
fi

# Test the function
print_status "Testing the Edge Function..."

# Get the project URL
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')

if [ -n "$PROJECT_URL" ]; then
    echo "Testing function at: ${PROJECT_URL}/functions/v1/weekly_refresh"
    
    # Note: This will fail without proper authentication, but it tests the endpoint
    curl -X POST "${PROJECT_URL}/functions/v1/weekly_refresh" \
         -H "Content-Type: application/json" \
         --max-time 30 \
         --silent \
         --show-error || print_warning "Function test failed (expected without auth)"
else
    print_warning "Could not determine project URL for testing"
fi

# Display next steps
echo ""
print_status "Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables:"
echo "   supabase secrets set SUPABASE_URL=your_supabase_url"
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo ""
echo "2. Test the function manually:"
echo "   curl -X POST https://your-project.supabase.co/functions/v1/weekly_refresh \\"
echo "     -H \"Authorization: Bearer your_anon_key\""
echo ""
echo "3. Monitor the ETL process:"
echo "   SELECT * FROM etl_metadata ORDER BY last_run DESC;"
echo ""
echo "4. View the results:"
echo "   SELECT * FROM top200_redraft LIMIT 10;"
echo "   SELECT * FROM top200_dynasty LIMIT 10;"
echo "   SELECT * FROM weekly_player_summary WHERE season = 2024 ORDER BY week DESC LIMIT 20;"
echo ""
echo "🕐 The function will run automatically every Tuesday at 09:00 UTC"
echo "   (configured in supabase/config.toml)"
echo ""
print_status "Setup complete! 🎉" 