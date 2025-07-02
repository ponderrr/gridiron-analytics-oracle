import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Palette,
  Save,
  Lock,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { FantasyCard } from "../components/ui/cards/FantasyCard";
import { ICON_SIZES, TEXT_SIZES, GAP, PADDING } from "@/lib/constants";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.email?.split("@")[0] || ""
  );

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
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1
            className={`${TEXT_SIZES.FOUR_XL} font-bold text-white flex items-center`}
          >
            <SettingsIcon
              className={`${ICON_SIZES.XL} mr-3 text-emerald-400`}
            />
            Settings
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          variants={itemVariants}
          className={`grid grid-cols-1 lg:grid-cols-2 ${GAP.LG}`}
        >
          {/* Profile Settings */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="premium" className={PADDING.XL}>
              <div className="flex items-center space-x-3 mb-6">
                <User className={`${ICON_SIZES.LG} text-emerald-400`} />
                <h3 className="text-lg font-semibold text-white">Profile</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${ICON_SIZES.MD} text-slate-400`}
                  />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-400"
                  />
                </div>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${ICON_SIZES.MD} text-slate-400`}
                  />
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
                  <Save className={`${ICON_SIZES.SM} mr-2`} />
                  Save Changes
                </button>
              </div>
            </FantasyCard>
          </motion.div>

          {/* Security Settings */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="elite" className={PADDING.XL}>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className={`${ICON_SIZES.LG} text-blue-400`} />
                <h3 className="text-lg font-semibold text-white">Security</h3>
              </div>
              <div className="space-y-4">
                <button className="w-full bg-slate-700/50 hover:bg-slate-600 rounded-lg p-4 text-left text-white transition-colors flex items-center">
                  <Lock className={`${ICON_SIZES.MD} text-emerald-400 mr-3`} />
                  <span>Change Password</span>
                </button>
              </div>
            </FantasyCard>
          </motion.div>

          {/* League Connection */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="champion" className={PADDING.XL}>
              <div className="flex items-center space-x-3 mb-6">
                <LinkIcon className={`${ICON_SIZES.LG} text-purple-400`} />
                <h3 className="text-lg font-semibold text-white">
                  League Connection
                </h3>
              </div>
              <div className="space-y-4">
                <div className={`bg-slate-800/50 ${PADDING.LG} rounded-lg`}>
                  <p className="text-slate-300 mb-4">
                    Connect your fantasy leagues to enable advanced features and
                    tracking.
                  </p>
                  <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Connect League
                  </button>
                </div>
              </div>
            </FantasyCard>
          </motion.div>

          {/* Theme Settings */}
          <motion.div variants={itemVariants}>
            <FantasyCard variant="default" className={PADDING.XL}>
              <div className="flex items-center space-x-3 mb-6">
                <Palette className={`${ICON_SIZES.LG} text-emerald-400`} />
                <h3 className="text-lg font-semibold text-white">Theme</h3>
              </div>
              <div className="space-y-4">
                <div className={`bg-slate-800/50 ${PADDING.LG} rounded-lg`}>
                  <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="dark">Dark (Default)</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
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
