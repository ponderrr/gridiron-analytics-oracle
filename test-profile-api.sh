#!/bin/bash

# Test script for Profile Management API
# Make sure to replace YOUR_ACCESS_TOKEN with your actual JWT token

BASE_URL="http://localhost:54321/functions/v1/profile-management"
TOKEN="YOUR_ACCESS_TOKEN"  # Replace with your actual JWT token

echo "🧪 Testing Profile Management API"
echo "=================================="

# Test 1: Get Profile
echo "1. Testing GET /profile"
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/profile" \
  | jq '.'

echo -e "\n"

# Test 2: Update Profile
echo "2. Testing POST /update"
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "username": "testuser123",
    "bio": "This is a test bio for testing purposes.",
    "favoriteTeam": "Dallas Cowboys"
  }' \
  "$BASE_URL/update" \
  | jq '.'

echo -e "\n"

# Test 3: Upload Avatar (using a small test image)
echo "3. Testing POST /avatar"
# Create a small test image (1x1 pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-avatar.png

# Convert to base64
BASE64_IMAGE=$(base64 -w 0 test-avatar.png)

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"file\": \"$BASE64_IMAGE\",
    \"fileName\": \"test-avatar.png\",
    \"contentType\": \"image/png\"
  }" \
  "$BASE_URL/avatar" \
  | jq '.'

# Clean up
rm -f test-avatar.png

echo -e "\n"
echo "✅ API testing completed!" 