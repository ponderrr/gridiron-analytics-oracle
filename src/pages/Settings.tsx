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
import DOMPurify from "dompurify";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
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
            className={`${
              effectiveTheme === "dark" ? "text-primary" : "text-primary"
            } flex items-center`}
          >
            <SettingsIcon
              className={`${
                effectiveTheme === "dark"
                  ? "text-emerald-400"
                  : "text-emerald-400"
              } mr-3`}
            />
            Settings
          </h1>
          <p className="text-tertiary mt-1">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          variants={itemVariants}
          className={`grid grid-cols-1 lg:grid-cols-2 ${
            effectiveTheme === "dark" ? "gap-6" : "gap-6"
          }`}
        >
          {/* Profile Settings */}
          <motion.div variants={itemVariants}>
            <Card
              className={`${
                effectiveTheme === "dark"
                  ? "bg-card border border-border"
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <User
                  className={`${
                    effectiveTheme === "dark"
                      ? "text-emerald-400"
                      : "text-emerald-400"
                  }`}
                />
                <h3 className="text-lg font-semibold text-primary">Profile</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Mail
                    className={`${
                      effectiveTheme === "dark"
                        ? "text-tertiary"
                        : "text-tertiary"
                    } absolute left-3 top-1/2 transform -translate-y-1/2`}
                  />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-tertiary"
                  />
                </div>
                <div className="relative">
                  <User
                    className={`${
                      effectiveTheme === "dark"
                        ? "text-tertiary"
                        : "text-tertiary"
                    } absolute left-3 top-1/2 transform -translate-y-1/2`}
                  />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) =>
                      setDisplayName(DOMPurify.sanitize(e.target.value))
                    }
                    placeholder="Enter your display name"
                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Save
                    className={`${
                      effectiveTheme === "dark"
                        ? "text-emerald-400"
                        : "text-emerald-400"
                    } mr-2`}
                  />
                  Save Changes
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div variants={itemVariants}>
            <Card
              className={`${
                effectiveTheme === "dark"
                  ? "bg-card border border-border"
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Shield
                  className={`${
                    effectiveTheme === "dark"
                      ? "text-blue-400"
                      : "text-blue-400"
                  }`}
                />
                <h3 className="text-lg font-semibold text-primary">Security</h3>
              </div>
              <div className="space-y-4">
                <button className="w-full bg-tertiary hover:bg-hover rounded-lg p-4 text-left text-primary transition-colors flex items-center">
                  <Lock
                    className={`${
                      effectiveTheme === "dark"
                        ? "text-emerald-400"
                        : "text-emerald-400"
                    } mr-3`}
                  />
                  <span>Change Password</span>
                </button>
              </div>
            </Card>
          </motion.div>

          {/* League Connection */}
          <motion.div variants={itemVariants}>
            <Card
              className={`${
                effectiveTheme === "dark"
                  ? "bg-card border border-border"
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <LinkIcon
                  className={`${
                    effectiveTheme === "dark"
                      ? "text-purple-400"
                      : "text-purple-400"
                  }`}
                />
                <h3 className="text-lg font-semibold text-primary">
                  League Connection
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-secondary mb-4">
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
