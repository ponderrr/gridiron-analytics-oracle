import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";

const ProfileDebug: React.FC = () => {
  const { profile, debugProfile, refreshProfile } = useUserProfile();

  const handleDebug = () => {
    debugProfile();
  };

  const handleRefresh = async () => {
    await refreshProfile();
    console.log("Profile refreshed");
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">Profile Debug</h3>
      <div className="space-y-2 mb-4">
        <p><strong>Username:</strong> {profile?.username || "Not set"}</p>
        <p><strong>Display Name:</strong> {profile?.displayName || "Not set"}</p>
        <p><strong>Bio:</strong> {profile?.bio || "Not set"}</p>
        <p><strong>Favorite Team:</strong> {profile?.favoriteTeam || "Not set"}</p>
        <p><strong>Avatar URL:</strong> {profile?.avatarUrl ? "Set" : "Not set"}</p>
      </div>
      <div className="space-x-2">
        <Button onClick={handleDebug} variant="outline" size="sm">
          Debug Profile
        </Button>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Refresh Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileDebug; 