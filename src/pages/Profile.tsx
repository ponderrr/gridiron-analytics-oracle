import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Edit
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingSpinner from "@/components/LoadingSpinner";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ProfileContent: React.FC = () => {
  const { user } = useAuth();
  const { profile, isLoading, error } = useUserProfile();

  // Show loading state while profile is being fetched
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  // Show error state if profile failed to load
  if (error || !profile) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Profile Error</h1>
            <p className="text-muted-foreground">
              {error?.message || "Failed to load profile data"}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">PROFILE</h1>
            <p className="text-lg text-muted-foreground">Manage your fantasy football profile</p>
          </motion.div>

          {/* Main Content */}
          <div className="w-full flex flex-col gap-8">
            {/* Profile Info Card */}
            <Card className="bg-[var(--color-bg-card)]/80 backdrop-blur-md border border-[var(--color-border-primary)] rounded-2xl shadow-xl p-8">
              <CardHeader className="text-center pb-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24 border-4 border-[var(--color-border-primary)] shadow-lg">
                    <AvatarImage src={profile.avatarUrl || undefined} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {profile.displayName || profile.username}
                    </CardTitle>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                      Member since {formatDate(profile.memberSince)}
                    </p>
                    {profile.bio && (
                      <p className="text-[var(--color-text-secondary)] mt-2 max-w-2xl">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full" aria-label="Settings">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Profile: React.FC = () => {
  return <ProfileContent />;
};

export default Profile;
