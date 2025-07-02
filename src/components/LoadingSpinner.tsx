import React from "react";
import styles from "./LoadingSpinner.module.css";

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
    <div className={styles.wrapper + (className ? ` ${className}` : "")}>
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

export default LoadingSpinner;
