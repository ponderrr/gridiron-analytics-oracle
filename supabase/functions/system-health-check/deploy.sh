#!/bin/bash

# Deploy the system-health-check edge function
echo "Deploying system-health-check edge function..."

# Navigate to the function directory
cd "$(dirname "$0")"

# Deploy the function
supabase functions deploy system-health-check

echo "System health check function deployed successfully!" 