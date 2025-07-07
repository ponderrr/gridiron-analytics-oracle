import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Save,
  Lock,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card } from "../components/ui/card";
import { THEME_CONSTANTS, getThemeClasses } from "@/lib/constants";
import DOMPurify from "dompurify";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);
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
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1
            className={`${THEME_CONSTANTS.TEXT_SIZES.FOUR_XL} font-bold ${themeClasses.TEXT_PRIMARY} flex items-center`}
          >
            <SettingsIcon
              className={`${THEME_CONSTANTS.ICON_SIZES.XL} mr-3 text-emerald-400`}
            />
            Settings
          </h1>
          <p className={`${themeClasses.TEXT_TERTIARY} mt-1`}>
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          variants={itemVariants}
          className={`grid grid-cols-1 lg:grid-cols-2 ${THEME_CONSTANTS.GAP.LG}`}
        >
          {/* Profile Settings */}
          <motion.div variants={itemVariants}>
            <Card
              className={`${THEME_CONSTANTS.PADDING.XL} ${themeClasses.BG_CARD} border ${themeClasses.BORDER}`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <User
                  className={`${THEME_CONSTANTS.ICON_SIZES.LG} text-emerald-400`}
                />
                <h3
                  className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
                >
                  Profile
                </h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${THEME_CONSTANTS.ICON_SIZES.MD} ${themeClasses.TEXT_TERTIARY}`}
                  />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} rounded-lg ${themeClasses.TEXT_TERTIARY}`}
                  />
                </div>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${THEME_CONSTANTS.ICON_SIZES.MD} ${themeClasses.TEXT_TERTIARY}`}
                  />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) =>
                      setDisplayName(DOMPurify.sanitize(e.target.value))
                    }
                    placeholder="Enter your display name"
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.BG_SECONDARY} border ${themeClasses.BORDER} rounded-lg ${themeClasses.TEXT_PRIMARY} placeholder-${themeClasses.TEXT_TERTIARY} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Save className={`${THEME_CONSTANTS.ICON_SIZES.SM} mr-2`} />
                  Save Changes
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div variants={itemVariants}>
            <Card
              className={`${THEME_CONSTANTS.PADDING.XL} ${themeClasses.BG_CARD} border ${themeClasses.BORDER}`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Shield
                  className={`${THEME_CONSTANTS.ICON_SIZES.LG} text-blue-400`}
                />
                <h3
                  className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
                >
                  Security
                </h3>
              </div>
              <div className="space-y-4">
                <button
                  className={`w-full ${themeClasses.BG_TERTIARY} ${themeClasses.BG_HOVER} rounded-lg p-4 text-left ${themeClasses.TEXT_PRIMARY} transition-colors flex items-center`}
                >
                  <Lock
                    className={`${THEME_CONSTANTS.ICON_SIZES.MD} text-emerald-400 mr-3`}
                  />
                  <span>Change Password</span>
                </button>
              </div>
            </Card>
          </motion.div>

          {/* League Connection */}
          <motion.div variants={itemVariants}>
            <Card
              className={`${THEME_CONSTANTS.PADDING.XL} ${themeClasses.BG_CARD} border ${themeClasses.BORDER}`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <LinkIcon
                  className={`${THEME_CONSTANTS.ICON_SIZES.LG} text-purple-400`}
                />
                <h3
                  className={`text-lg font-semibold ${themeClasses.TEXT_PRIMARY}`}
                >
                  League Connection
                </h3>
              </div>
              <div className="space-y-4">
                <div
                  className={`${themeClasses.BG_SECONDARY} ${THEME_CONSTANTS.PADDING.LG} rounded-lg`}
                >
                  <p className={`${themeClasses.TEXT_SECONDARY} mb-4`}>
                    Connect your fantasy leagues to enable advanced features and
                    tracking.
                  </p>
                  <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Connect League
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Settings;
