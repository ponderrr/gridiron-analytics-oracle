import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, User, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserProfile } from "@/hooks/useUserProfile";
import { ProfileAPI } from "@/lib/api/profile";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || "",
    username: profile.username || "",
    bio: profile.bio || "",
    favoriteTeam: profile.favoriteTeam || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates: Partial<UserProfile> = {
        displayName: formData.displayName || null,
        username: formData.username || null,
        bio: formData.bio || null,
        favoriteTeam: formData.favoriteTeam || null,
      };

      // If there's a new avatar preview, handle file upload
      if (avatarPreview && avatarPreview !== profile.avatarUrl && avatarPreview.startsWith('data:')) {
        // Convert base64 to file and upload
        const response = await fetch(avatarPreview);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        
        try {
          const avatarUrl = await ProfileAPI.uploadAvatar(file);
          updates.avatarUrl = avatarUrl;
        } catch (uploadError) {
          toast.error('Failed to upload avatar. Please try again.');
          console.error('Avatar upload error:', uploadError);
          return;
        }
      }

      await onSave(updates);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl mx-4 bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-primary)]">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Edit Profile
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-[var(--color-border-primary)] shadow-lg">
                    <AvatarImage src={avatarPreview || undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                      {formData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-sm text-[var(--color-text-secondary)] text-center">
                  Click the upload button to change your profile picture
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-[var(--color-text-primary)]">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                    maxLength={20}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Username must be between 3-20 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="displayName" className="text-[var(--color-text-primary)]">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Enter your display name"
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="favoriteTeam" className="text-[var(--color-text-primary)]">
                    Favorite Team
                  </Label>
                  <Input
                    id="favoriteTeam"
                    value={formData.favoriteTeam}
                    onChange={(e) => handleInputChange('favoriteTeam', e.target.value)}
                    placeholder="Enter your favorite NFL team"
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-[var(--color-text-primary)]">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    rows={3}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-[var(--color-border-primary)]">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileEditModal; 