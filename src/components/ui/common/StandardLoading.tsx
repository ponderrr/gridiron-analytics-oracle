import React from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";

export interface StandardLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullHeight?: boolean;
  className?: string;
  showSpinner?: boolean;
  children?: React.ReactNode;
}

const StandardLoading: React.FC<StandardLoadingProps> = ({
  message = "Loading...",
  size = "lg",
  fullHeight = false,
  className = "",
  showSpinner = true,
  children,
}) => {
  const containerClass = fullHeight
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center h-64";

  const content = (
    <div className={`text-center ${className}`}>
      {showSpinner && (
        <div className="mb-4">
          <LoadingSpinner size={size} />
        </div>
      )}
      {message && (
        <p className="text-slate-400 text-lg font-medium">{message}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );

  if (fullHeight) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={containerClass}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={containerClass}
    >
      {content}
    </motion.div>
  );
};

export default StandardLoading;
