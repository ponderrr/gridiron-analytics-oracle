# Profile Management Testing Guide

This guide will help you test the profile management functionality thoroughly.

## 🚀 Quick Start Testing

### Prerequisites
1. Supabase CLI installed
2. Node.js and npm installed
3. A test user account created

### Step 1: Start Local Environment

```bash
# Start Supabase locally
supabase start

# Start your React app
npm run dev
```

### Step 2: Get Your JWT Token

1. Open your browser and go to `http://localhost:3000`
2. Sign in to your account
3. Open Developer Tools (F12)
4. Go to Application/Storage tab
5. Look for `sb-` cookies or localStorage
6. Copy the JWT token

### Step 3: Update Test Scripts

Edit either `test-profile-api.sh` (Linux/Mac) or `test-profile-api.ps1` (Windows):
- Replace `YOUR_ACCESS_TOKEN` with your actual JWT token

## 🧪 Manual Testing Checklist

### Frontend Testing

#### Profile Page
- [ ] Navigate to `/profile`
- [ ] Verify profile information displays correctly
- [ ] Check that avatar shows properly (or fallback)
- [ ] Verify "Edit Profile" button is visible

#### Profile Edit Modal
- [ ] Click "Edit Profile" button
- [ ] Modal opens with current profile data
- [ ] All form fields are populated correctly
- [ ] Avatar preview shows current image

#### Form Validation
- [ ] Try username < 3 characters (should show error)
- [ ] Try username > 20 characters (should show error)
- [ ] Try display name > 50 characters (should show error)
- [ ] Try bio > 500 characters (should show error)
- [ ] Try uploading file > 5MB (should show error)
- [ ] Try uploading non-image file (should show error)

#### Avatar Upload
- [ ] Click avatar upload button
- [ ] Select valid image file (JPEG, PNG, GIF, WebP)
- [ ] Verify preview appears
- [ ] Save changes and verify avatar updates
- [ ] Check that avatar persists after page refresh

#### Profile Updates
- [ ] Update username to valid value
- [ ] Update display name
- [ ] Update bio
- [ ] Update favorite team
- [ ] Save changes
- [ ] Verify changes persist after page refresh

### API Testing

#### Using Test Scripts

**Linux/Mac:**
```bash
chmod +x test-profile-api.sh
./test-profile-api.sh
```

**Windows (PowerShell):**
```powershell
.\test-profile-api.ps1
```

#### Manual API Testing with curl

```bash
# Get profile
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:54321/functions/v1/profile-management/profile"

# Update profile
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "username": "testuser123",
    "bio": "Test bio",
    "favoriteTeam": "Dallas Cowboys"
  }' \
  "http://localhost:54321/functions/v1/profile-management/update"

# Upload avatar
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file": "base64_encoded_image",
    "fileName": "test.jpg",
    "contentType": "image/jpeg"
  }' \
  "http://localhost:54321/functions/v1/profile-management/avatar"
```

## 🔍 Database Testing

### Check User Profiles Table

```sql
-- View all user profiles
SELECT * FROM user_profiles;

-- View specific user profile
SELECT * FROM user_profiles WHERE user_id = 'your-user-id';

-- Check avatar URLs
SELECT user_id, avatar_url FROM user_profiles WHERE avatar_url IS NOT NULL;
```

### Check Storage Bucket

```sql
-- List files in avatars bucket
SELECT * FROM storage.objects WHERE bucket_id = 'avatars';
```

## 🐛 Common Issues & Solutions

### Issue: "Function not found"
**Solution:** Make sure the function is deployed:
```bash
supabase functions deploy profile-management
```

### Issue: "Unauthorized" errors
**Solution:** Check your JWT token is valid and not expired

### Issue: "Storage bucket not found"
**Solution:** Run the migration:
```bash
supabase db push
```

### Issue: Avatar not uploading
**Solution:** Check file size and format, ensure storage bucket exists

### Issue: Profile not updating
**Solution:** Check RLS policies and user permissions

## 📊 Performance Testing

### Load Testing (Optional)

```bash
# Install Apache Bench (if available)
# Test profile update endpoint
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -p test-data.json \
  http://localhost:54321/functions/v1/profile-management/update
```

## 🧹 Cleanup

After testing, you may want to clean up:

```sql
-- Remove test data
DELETE FROM user_profiles WHERE username LIKE 'test%';

-- Remove test avatars from storage
DELETE FROM storage.objects WHERE bucket_id = 'avatars' AND name LIKE 'test%';
```

## ✅ Success Criteria

Your testing is successful when:

1. ✅ Profile page loads without errors
2. ✅ Edit modal opens and displays current data
3. ✅ Form validation works correctly
4. ✅ Avatar upload works with preview
5. ✅ Profile updates persist after refresh
6. ✅ API endpoints return correct responses
7. ✅ Error handling works for invalid inputs
8. ✅ Database records are created/updated correctly
9. ✅ Storage bucket contains uploaded files
10. ✅ RLS policies prevent unauthorized access

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check Supabase logs: `supabase logs`
3. Verify environment variables are set
4. Ensure all migrations have been applied
5. Check that the function is deployed and running 