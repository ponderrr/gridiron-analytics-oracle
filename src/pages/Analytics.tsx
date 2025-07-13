import React from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";

const SadFace = () => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    className="flex items-center justify-center mb-6"
  >
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="#e5e7eb" strokeWidth="4" fill="#f3f4f6" />
      <ellipse cx="28" cy="36" rx="5" ry="7" fill="#9ca3af" />
      <ellipse cx="52" cy="36" rx="5" ry="7" fill="#9ca3af" />
      <path d="M28 58c4-6 20-6 24 0" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  </motion.div>
);

const Analytics: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <SadFace />
        <h1 className="text-3xl font-bold mb-2 text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-lg text-[var(--color-text-tertiary)] mb-4">Coming Soon</p>
      </div>
    </Layout>
  );
};

export default Analytics;
