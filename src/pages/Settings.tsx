import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Save,
  Lock,
  Eye,
  EyeOff,
  Key
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Settings
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">
            Manage your account and security
          </p>
        </motion.div>

        {/* Animated Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] rounded-xl shadow-lg p-6"
        >
          {/* Tab Navigation */}
          <div className="relative flex mb-8 border-b border-slate-200 dark:border-slate-200/10">
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "profile" 
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400" 
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("profile")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </div>
            </button>
            <button
              className={`text-lg font-semibold pb-3 px-4 transition-colors border-b-2 flex-1 ${
                activeTab === "security" 
                  ? "text-indigo-500 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400" 
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              } focus:outline-none`}
              onClick={() => handleTabChange("security")}
              type="button"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </div>
            </button>
            
            {/* Animated Indicator */}
            <motion.span
              className="absolute bottom-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded"
              initial={false}
              animate={{
                left: activeTab === "profile" ? "0%" : "50%",
                width: "50%"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profile Information */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-500" />
                        <span>Profile Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]"
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
                          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]"
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
                          className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)]"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleProfileUpdate}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Save className="h-4 w-4" />
                            <span>Save Changes</span>
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Account Overview */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                        Account Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src="" alt={profileForm.displayName} />
                          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-secondary text-white">
                            {profileForm.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            {profileForm.displayName}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {profileForm.email}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            Active Account
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--color-text-secondary)]">Member Since</span>
                          <span className="text-[var(--color-text-primary)] font-medium">
                            {user?.created_at ? formatDate(user.created_at) : "Jan 2024"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--color-text-secondary)]">Last Login</span>
                          <span className="text-[var(--color-text-primary)] font-medium">
                            {formatDate(new Date().toISOString())}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--color-text-secondary)]">Account Status</span>
                          <Badge className="bg-green-500 text-white">Verified</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Change Password */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <Lock className="h-5 w-5 text-red-500" />
                        <span>Change Password</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-[var(--color-text-primary)]">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Enter current password"
                            className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-[var(--color-text-primary)]">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Enter new password"
                            className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-[var(--color-text-primary)]">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                            className="bg-[var(--color-bg-card)] border-[var(--color-border-primary)] pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Changing Password...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Key className="h-4 w-4" />
                            <span>Change Password</span>
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span>Security Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">Two-Factor Authentication</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">Add an extra layer of security</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">Login Notifications</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">Get notified of new logins</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">Session Management</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">Manage active sessions</p>
                          </div>
                          <Button variant="outline" size="sm">
                            View Sessions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Settings;
