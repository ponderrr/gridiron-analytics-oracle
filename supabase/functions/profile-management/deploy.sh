#!/bin/bash

# Deploy the profile management function
echo "Deploying profile management function..."

# Deploy the function
supabase functions deploy profile-management --project-ref yhibrugwsqqbujeosxzg

# Run the migration to create the avatars storage bucket
echo "Running migration for avatars storage..."
supabase db push

echo "Profile management function deployed successfully!"
echo ""
echo "Make sure to set the following environment variables in your Supabase project:"
echo "- SUPABASE_URL"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "The function will be available at:"
echo "https://yhibrugwsqqbujeosxzg.supabase.co/functions/v1/profile-management" 