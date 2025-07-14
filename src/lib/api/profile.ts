import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useUserProfile";

export interface ProfileUpdateRequest {
  displayName?: string;
  username?: string;
  bio?: string;
  favoriteTeam?: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    notifications?: boolean;
  };
}

export interface AvatarUploadRequest {
  file: string; // base64 encoded file
  fileName: string;
  contentType: string;
}

export class ProfileAPI {

  static async updateProfile(updates: ProfileUpdateRequest): Promise<UserProfile> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile-management/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    const result = await response.json();
    return result.profile;
  }

  static async uploadAvatar(file: File): Promise<string> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile-management/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        file: base64.split(',')[1], // Remove data:image/...;base64, prefix
        fileName: file.name,
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload avatar');
    }

    const result = await response.json();
    return result.avatarUrl;
  }

  static async getProfile(): Promise<UserProfile> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile-management/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    const result = await response.json();
    return result.profile;
  }
} 