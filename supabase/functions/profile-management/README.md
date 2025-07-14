# Profile Management Function

This Supabase Edge Function provides comprehensive profile management capabilities including avatar uploads and profile updates.

## Features

- **Profile Updates**: Update username, display name, bio, favorite team, and preferences
- **Avatar Upload**: Upload and manage profile pictures with automatic storage
- **Input Validation**: Comprehensive validation for all profile fields
- **Security**: JWT authentication and Row Level Security (RLS) policies

## Endpoints

### Update Profile
- **URL**: `/profile-management/update`
- **Method**: `POST`
- **Authentication**: Required (JWT token)
- **Body**:
  ```json
  {
    "displayName": "string (max 50 chars)",
    "username": "string (3-20 chars, unique)",
    "bio": "string (max 500 chars)",
    "favoriteTeam": "string (max 50 chars)",
    "preferences": {
      "theme": "light" | "dark" | "system",
      "notifications": boolean
    }
  }
  ```

### Upload Avatar
- **URL**: `/profile-management/avatar`
- **Method**: `POST`
- **Authentication**: Required (JWT token)
- **Body**:
  ```json
  {
    "file": "base64_encoded_file",
    "fileName": "string",
    "contentType": "image/jpeg|image/png|image/gif|image/webp"
  }
  ```

### Get Profile
- **URL**: `/profile-management/profile`
- **Method**: `GET`
- **Authentication**: Required (JWT token)

## File Upload Requirements

- **Supported formats**: JPEG, PNG, GIF, WebP
- **Maximum size**: 5MB
- **Storage**: Files are stored in Supabase Storage bucket `avatars`

## Validation Rules

- **Username**: 3-20 characters, must be unique
- **Display Name**: Maximum 50 characters
- **Bio**: Maximum 500 characters
- **Favorite Team**: Maximum 50 characters

## Database Schema

The function works with the `user_profiles` table:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  favorite_team TEXT,
  preferences JSONB DEFAULT '{"theme": "system", "notifications": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Storage Configuration

The function uses the `avatars` storage bucket with the following configuration:

- **Public access**: Yes (for reading avatars)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/gif, image/webp
- **RLS policies**: Users can only upload/update/delete their own avatars

## Deployment

1. Run the migration to create the storage bucket:
   ```bash
   supabase db push
   ```

2. Deploy the function:
   ```bash
   supabase functions deploy profile-management
   ```

3. Ensure environment variables are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Error Handling

The function returns appropriate HTTP status codes and error messages:

- `400`: Bad request (validation errors, missing fields)
- `401`: Unauthorized (invalid or missing JWT token)
- `500`: Internal server error

## Security

- JWT token validation for all endpoints
- Row Level Security (RLS) policies on the `user_profiles` table
- File type and size validation for avatar uploads
- Username uniqueness validation
- Users can only access and modify their own profile data 