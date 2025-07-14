# Frontend-Only Testing Guide

Since Supabase CLI installation is having issues, here's how to test the frontend functionality without it.

## 🚀 Quick Start

1. **Start your React app** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to `http://localhost:3000`

3. **Sign in** to your account

4. **Navigate to the Profile page**: `http://localhost:3000/profile`

## 🧪 What You Can Test (Frontend Only)

### ✅ Profile Page Display
- [ ] Profile page loads without errors
- [ ] Current profile information displays
- [ ] Avatar shows (or fallback if no avatar)
- [ ] "Edit Profile" button is visible

### ✅ Profile Edit Modal
- [ ] Click "Edit Profile" button
- [ ] Modal opens with current data
- [ ] All form fields are populated
- [ ] Avatar preview shows current image

### ✅ Form Validation (Frontend)
- [ ] Try username < 3 characters (should show error)
- [ ] Try username > 20 characters (should show error)
- [ ] Try display name > 50 characters (should show error)
- [ ] Try bio > 500 characters (should show error)
- [ ] Try uploading file > 5MB (should show error)
- [ ] Try uploading non-image file (should show error)

### ✅ Avatar Upload Preview
- [ ] Click avatar upload button
- [ ] Select valid image file
- [ ] Preview appears in modal
- [ ] Preview shows correct image

### ✅ Form Interactions
- [ ] Type in username field
- [ ] Type in display name field
- [ ] Type in bio field
- [ ] Type in favorite team field
- [ ] Character counters work correctly

## 🔧 Manual Backend Setup (Optional)

If you want to test the full functionality, you can set up the backend manually:

### 1. Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatars bucket
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add favorite_team column if not exists
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS favorite_team TEXT;
```

### 2. Deploy Function Manually

1. Go to your Supabase Dashboard → Functions
2. Create a new function called `profile-management`
3. Copy the code from `supabase/functions/profile-management/index.ts`
4. Deploy the function

### 3. Test Full Functionality

After manual setup, you can test:
- [ ] Profile updates save to database
- [ ] Avatar uploads work
- [ ] Changes persist after page refresh

## 🐛 Troubleshooting Frontend Issues

### Issue: Modal doesn't open
**Check**: Browser console for JavaScript errors

### Issue: Form validation not working
**Check**: Make sure all validation rules are properly implemented

### Issue: Avatar preview not showing
**Check**: File input and FileReader implementation

### Issue: Page not loading
**Check**: 
- React app is running on correct port
- No JavaScript errors in console
- Network connectivity

## 📊 Expected Behavior

### Profile Page
- Should display current user information
- Should show avatar or fallback
- Should have working "Edit Profile" button

### Edit Modal
- Should open when button is clicked
- Should display current profile data
- Should have working form validation
- Should show avatar preview on file selection
- Should have working save/cancel buttons

### Form Validation
- Username: 3-20 characters
- Display Name: max 50 characters
- Bio: max 500 characters
- File upload: max 5MB, image types only

## ✅ Success Criteria (Frontend)

Your frontend testing is successful when:

1. ✅ Profile page loads without errors
2. ✅ Edit modal opens and displays current data
3. ✅ Form validation prevents invalid inputs
4. ✅ Avatar preview works for valid files
5. ✅ Form fields are properly populated
6. ✅ Character counters work correctly
7. ✅ Modal can be opened and closed
8. ✅ No JavaScript errors in console
9. ✅ UI is responsive and accessible
10. ✅ Loading states work correctly

## 🎯 Next Steps

Once frontend testing is complete:

1. **Install Supabase CLI** using the manual methods in `SUPABASE_CLI_INSTALL.md`
2. **Deploy the backend** using the CLI
3. **Test full functionality** with the complete testing guide

## 🆘 Getting Help

If you encounter issues:

1. Check browser console for errors
2. Verify React app is running correctly
3. Check that all components are properly imported
4. Ensure TypeScript compilation is successful
5. Test on different browsers if needed 