# Test script for Profile Management API (PowerShell)
# Make sure to replace YOUR_ACCESS_TOKEN with your actual JWT token

$BASE_URL = "http://localhost:54321/functions/v1/profile-management"
$TOKEN = "YOUR_ACCESS_TOKEN"  # Replace with your actual JWT token

Write-Host "🧪 Testing Profile Management API" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Test 1: Get Profile
Write-Host "1. Testing GET /profile" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/profile" -Method GET -Headers @{
        "Authorization" = "Bearer $TOKEN"
    }
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Update Profile
Write-Host "2. Testing POST /update" -ForegroundColor Yellow
$updateData = @{
    displayName = "Test User"
    username = "testuser123"
    bio = "This is a test bio for testing purposes."
    favoriteTeam = "Dallas Cowboys"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/update" -Method POST -Headers @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    } -Body $updateData
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Upload Avatar (using a small test image)
Write-Host "3. Testing POST /avatar" -ForegroundColor Yellow

# Create a small test image (1x1 pixel PNG)
$base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

$avatarData = @{
    file = $base64Image
    fileName = "test-avatar.png"
    contentType = "image/png"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/avatar" -Method POST -Headers @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    } -Body $avatarData
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ API testing completed!" -ForegroundColor Green 