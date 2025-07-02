import React from "react";
import styles from "./LoadingSpinner.module.css";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  message,
}) => {
  return (
    <div className={cn(styles.wrapper, className)}>
      <div
        className={`${styles.spinner} ${
          size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md
        }`}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      />
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
};

export default React.memo(LoadingSpinner);
