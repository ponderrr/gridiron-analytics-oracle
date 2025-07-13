import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  
  // Form states
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    email: user?.email || "",
    username: user?.email?.split("@")[0] || "",
    displayName: user?.email?.split("@")[0] || ""
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profile updated successfully!");
      setProfileForm(prev => ({ ...prev }));
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast.error("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* Remove the gear icon and center the header */}
            <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">SETTINGS</h1>
            <p className="text-lg text-muted-foreground text-center mb-8">Manage your account and security</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full bg-[var(--color-bg-card)]/80 backdrop-blur-md border border-[var(--color-border-primary)] rounded-2xl shadow-xl p-8 flex flex-col items-center"
          >
            {/* Centered tab navigation with animated indicator */}
            <div className="relative flex justify-center w-full mb-8 border-b border-slate-200 dark:border-slate-200/10">
              <button
                className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 text-center ${
                  activeTab === "profile"
                    ? "text-primary border-primary"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                } focus:outline-none`}
                onClick={() => handleTabChange("profile")}
                type="button"
                style={{ zIndex: 1 }}
              >
                Profile
              </button>
              <button
                className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 text-center ${
                  activeTab === "security"
                    ? "text-primary border-primary"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                } focus:outline-none`}
                onClick={() => handleTabChange("security")}
                type="button"
                style={{ zIndex: 1 }}
              >
                Security
              </button>
              {/* Animated underline indicator */}
              <motion.span
                layout
                className="absolute bottom-0 left-0 h-0.5 bg-primary rounded"
                initial={false}
                animate={{
                  x: activeTab === "profile" ? 0 : "100%",
                  width: "50%"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ width: "50%" }}
              />
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[var(--color-text-primary)]">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-[var(--color-text-primary)]">
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter your username"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-[var(--color-text-primary)]">
                        Display Name
                      </Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Enter your display name"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-full"
                      />
                    </div>
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                      className="w-full rounded-full"
                    >
                      {isLoading ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                )}
                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-[var(--color-text-primary)]">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-[var(--color-text-primary)]">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[var(--color-text-primary)]">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-full"
                      />
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                      className="w-full rounded-full"
                    >
                      {isLoading ? "Saving..." : "Change Password"}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
