import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Lock,
  Mail,
  ArrowRight,
  Star,
  Trophy,
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { FantasyCard, StatCard } from "../components/ui/cards/FantasyCard";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.email?.split("@")[0] || "",
  );
  const [notifications, setNotifications] = useState({
    trades: true,
    news: true,
    reports: false,
    alerts: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Layout isAuthenticated>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3 text-emerald-400" />
            Settings
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Account Status"
            value="Premium"
            subtitle="Active subscription"
            icon={Star}
            trend="up"
            trendValue="Pro"
            variant="premium"
          />
          <StatCard
            title="Login Streak"
            value="15"
            subtitle="Days active"
            icon={ArrowRight}
            trend="up"
            trendValue="+3"
            variant="elite"
          />
          <StatCard
            title="Leagues"
            value="3"
            subtitle="Active leagues"
            icon={Trophy}
            trend="up"
            trendValue="+1"
            variant="champion"
          />
          <StatCard
            title="Security Score"
            value="92"
            subtitle="Account protection"
            icon={Shield}
            trend="up"
            trendValue="+5"
            variant="default"
          />
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Profile Settings */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="premium" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Profile</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-400"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </FantasyCard>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="elite" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="h-6 w-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">
                  Notifications
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center">
                    <ArrowRight className="h-5 w-5 text-emerald-400 mr-3" />
                    <span className="text-white">Trade Alerts</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.trades}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          trades: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-blue-400 mr-3" />
                    <span className="text-white">Player News</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.news}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          news: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-white">Weekly Reports</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.reports}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          reports: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </FantasyCard>
          </motion.div>

          {/* Security */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="champion" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Security</h3>
              </div>
              <div className="space-y-4">
                <button className="w-full bg-slate-700/50 hover:bg-slate-600 rounded-lg p-4 text-left text-white transition-colors flex items-center justify-between group">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-emerald-400 mr-3" />
                    <span>Change Password</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
                <button className="w-full bg-slate-700/50 hover:bg-slate-600 rounded-lg p-4 text-left text-white transition-colors flex items-center justify-between group">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-purple-400 mr-3" />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </FantasyCard>
          </motion.div>

          {/* Preferences */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="default" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="h-6 w-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Preferences
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Theme
                  </label>
                  <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="dark">Dark (Default)</option>
                    <option value="light">Light</option>
                    <option value="auto">System Default</option>
                  </select>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Default League
                  </label>
                  <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select a league</option>
                    <option value="1">Championship League</option>
                    <option value="2">Work Friends League</option>
                    <option value="3">Family League</option>
                  </select>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Scoring Format
                  </label>
                  <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="ppr">PPR</option>
                    <option value="half">Half PPR</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
              </div>
            </FantasyCard>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Settings;
