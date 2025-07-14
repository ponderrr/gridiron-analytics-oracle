import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProfileUpdateRequest {
  avatarUrl: any;
  displayName?: string;
  bio?: string;
  username?: string;
  favoriteTeam?: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    notifications?: boolean;
  };
}

interface AvatarUploadRequest {
  file: string; // base64 encoded file
  fileName: string;
  contentType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { pathname } = new URL(req.url)
    const method = req.method

    // Handle different endpoints
    if (pathname === '/profile-management/update' && method === 'POST') {
      return await handleProfileUpdate(req, supabase, user.id)
    } else if (pathname === '/profile-management/avatar' && method === 'POST') {
      return await handleAvatarUpload(req, supabase, user.id)
    } else if (pathname === '/profile-management/profile' && method === 'GET') {
      return await handleGetProfile(req, supabase, user.id)
    } else {
      throw new Error('Invalid endpoint')
    }

  } catch (error) {
    console.error('Profile management error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleProfileUpdate(req: Request, supabase: any, userId: string) {
  const body: ProfileUpdateRequest = await req.json()
  
  // Validate input
  if (body.username && (body.username.length < 3 || body.username.length > 20)) {
    throw new Error('Username must be between 3 and 20 characters')
  }

  if (body.displayName && body.displayName.length > 50) {
    throw new Error('Display name must be less than 50 characters')
  }

  if (body.bio && body.bio.length > 500) {
    throw new Error('Bio must be less than 500 characters')
  }

  // Check if username is already taken (if username is being updated)
  if (body.username) {
    let finalUsername = body.username;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existingUsers, error: checkError } = await supabase
        .from('user_profiles')
        .select('user_id, username')
        .eq('username', finalUsername)
        .neq('user_id', userId)

      if (checkError) {
        console.error('Error checking username:', checkError)
        throw new Error('Failed to check username availability')
      }

      if (existingUsers && existingUsers.length > 0) {
        attempts++;
        finalUsername = `${body.username}${attempts}`;
      } else {
        break;
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error(`Username "${body.username}" and variations are already taken. Please choose a different username.`)
    }

    // Use the final username (with suffix if needed)
    body.username = finalUsername;
  }

  // Update profile
  const updateData: any = {}
  if (body.displayName !== undefined) updateData.display_name = body.displayName
  if (body.bio !== undefined) updateData.bio = body.bio
  if (body.username !== undefined) updateData.username = body.username
  if (body.favoriteTeam !== undefined) updateData.favorite_team = body.favoriteTeam
  if (body.preferences) updateData.preferences = body.preferences

  console.log('Updating profile for user_id:', userId, body);
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId, // This must be the same for the logged-in user!
      username: body.username,
      display_name: body.displayName,
      bio: body.bio,
      avatar_url: body.avatarUrl,
      favorite_team: body.favoriteTeam,
      preferences: body.preferences,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }) // <--- THIS IS CRITICAL
    .select()
    .single();

  if (error) {
    console.error('Upsert error:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      profile: data 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleAvatarUpload(req: Request, supabase: any, userId: string) {
  const body: AvatarUploadRequest = await req.json()
  
  if (!body.file || !body.fileName || !body.contentType) {
    throw new Error('Missing required fields: file, fileName, contentType')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(body.contentType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.')
  }

  // Decode base64 file
  const fileBuffer = Uint8Array.from(atob(body.file), c => c.charCodeAt(0))
  
  // Validate file size (max 5MB)
  if (fileBuffer.length > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB')
  }

  // Generate unique filename
  const fileExtension = body.fileName.split('.').pop()
  const uniqueFileName = `${userId}-${Date.now()}.${fileExtension}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(uniqueFileName, fileBuffer, {
      contentType: body.contentType,
      upsert: true
    })

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(uniqueFileName)

  // Update user profile with new avatar URL
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to update profile with avatar: ${updateError.message}`)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      avatarUrl: publicUrl 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleGetProfile(_req: Request, supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(`Failed to get profile: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      profile: data 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}