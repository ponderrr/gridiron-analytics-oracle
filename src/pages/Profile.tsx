import React from "react";
import { motion } from "framer-motion";
import { User, Settings, Mail } from "lucide-react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";

const Profile: React.FC = () => {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] flex items-center">
            <User className="h-8 w-8 mr-3 text-emerald-500" />
            Profile
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="p-12 bg-[var(--color-bg-card)] border-[var(--color-border-primary)] text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Profile Management
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                Comprehensive profile and account management features are coming
                soon.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-[var(--color-text-tertiary)]">
              <Mail className="h-4 w-4" />
              <span>Contact support for urgent account changes</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default Profile;
