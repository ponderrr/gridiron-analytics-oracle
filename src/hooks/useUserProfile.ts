import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  createAppError,
  AppError,
  withErrorHandling,
} from "@/lib/errorHandling";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  memberSince: string;
  avatarUrl: string | null;
  displayName: string | null;
  favoriteTeam: string | null;
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
  } | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: AppError | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as Error).message;
  }
  return String(error);
};

// Default profile data when user profile is not available
const createDefaultProfile = (user: any): UserProfile => ({
  id: user.id,
  email: user.email || "",
  username: user.email?.split('@')[0] || "User",
  bio: null,
  memberSince: user.created_at || new Date().toISOString(),
  avatarUrl: null,
  displayName: null,
  favoriteTeam: null,
  preferences: {
    theme: "system",
    notifications: true,
  },
});

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch profile from database first
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw profileError;
      }

      if (profileData) {
        // Use database profile data
        const dbProfile: UserProfile = {
          id: profileData.user_id, // Use user_id as the id
          email: user.email || "",
          username: user.email?.split('@')[0] || "User", // Generate from email since username isn't in DB
          bio: profileData.bio,
          memberSince: profileData.created_at || user.created_at || new Date().toISOString(),
          avatarUrl: profileData.avatar_url,
          displayName: profileData.display_name,
          favoriteTeam: profileData.favorite_team,
          preferences: {
            theme: "system",
            notifications: true,
          }, // Default preferences since not in DB
        };
        setProfile(dbProfile);
      } else {
        // Fallback to default profile if no database record exists
        const defaultProfile = createDefaultProfile(user);
        setProfile(defaultProfile);
      }
    } catch (error) {
      const appError = createAppError(
        extractErrorMessage(error),
        "data",
        undefined,
        "fetchProfile",
        error as any
      );
      setError(appError);
      
      // Fallback to default profile on error
      if (user) {
        setProfile(createDefaultProfile(user));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateProfile = withErrorHandling(
    async (updates: Partial<UserProfile>): Promise<void> => {
      if (!user || !profile) {
        throw createAppError("No user or profile available", "data");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Handle avatar upload if there's a new avatar
        let avatarUrl = updates.avatarUrl;
        if (updates.avatarUrl && updates.avatarUrl !== profile.avatarUrl && updates.avatarUrl.startsWith('data:')) {
          // This is a base64 image that needs to be uploaded
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile-management/avatar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              file: updates.avatarUrl.split(',')[1], // Remove data:image/...;base64, prefix
              fileName: `avatar-${Date.now()}.jpg`,
              contentType: 'image/jpeg',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to upload avatar');
          }

          const result = await response.json();
          avatarUrl = result.avatarUrl;
        }

        // Update the user_profiles table
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            display_name: updates.displayName,
            bio: updates.bio,
            avatar_url: avatarUrl,
            favorite_team: updates.favoriteTeam,
            username: updates.username,
          })
          .eq('user_id', user.id);
        
        if (error) throw error;

        // Update local state
        const updatedProfile = { 
          ...profile, 
          ...updates,
          avatarUrl: avatarUrl || updates.avatarUrl || null
        };
        setProfile(updatedProfile);
      } catch (error) {
        const appError = createAppError(
          extractErrorMessage(error),
          "data",
          undefined,
          "updateProfile",
          error as any
        );
        setError(appError);
        throw appError;
      } finally {
        setIsLoading(false);
      }
    },
    "updateProfile"
  );

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
  };
}; 