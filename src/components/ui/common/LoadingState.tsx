import React from "react";
import styles from "../../LoadingSpinner.module.css";
import { cn } from "@/lib/utils";

// Types for loading variants
export type LoadingStateType = "spinner" | "skeleton" | "page";
export type LoadingSpinnerSize = "sm" | "md" | "lg";

export interface LoadingStateProps {
  type?: LoadingStateType;
  size?: LoadingSpinnerSize;
  message?: string;
  className?: string;
  // For skeleton: how many lines/blocks
  skeletonCount?: number;
  // For skeleton: custom width/height
  skeletonWidth?: string | number;
  skeletonHeight?: string | number;
  // For page: children to show after loading
  children?: React.ReactNode;
  // If true, show children as soon as loading is false
  loading?: boolean;
}

const skeletonBase = "bg-slate-700/50 rounded animate-pulse mb-2 last:mb-0";

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = "spinner",
  size = "md",
  message,
  className,
  skeletonCount = 3,
  skeletonWidth = "100%",
  skeletonHeight = 20,
  children,
  loading = true,
}) => {
  if (!loading) return <>{children}</>;

  if (type === "page") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[60vh]",
          className
        )}
      >
        <div
          className={cn(
            styles.spinner,
            size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md
          )}
          role="status"
          aria-live="polite"
          aria-label="Loading"
        />
        {message && (
          <div className="mt-4 text-slate-400 text-lg">{message}</div>
        )}
      </div>
    );
  }

  if (type === "skeleton") {
    return (
      <div className={className} aria-busy="true" aria-live="polite">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className={skeletonBase}
            style={{
              width: skeletonWidth,
              height: skeletonHeight,
            }}
          />
        ))}
        {message && (
          <div className="mt-2 text-slate-400 text-sm">{message}</div>
        )}
      </div>
    );
  }

  // Default: spinner (inline/block)
  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          styles.spinner,
          size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md
        )}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      />
      {message && (
        <span className="ml-3 text-slate-400 text-sm">{message}</span>
      )}
    </div>
  );
};

export default LoadingState;
