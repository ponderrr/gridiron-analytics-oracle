import React from "react";
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
  // For skeleton: shape of the skeleton block
  skeletonShape?: "rectangle" | "circle";
  // For page: children to show after loading
  children?: React.ReactNode;
  // If true, show children as soon as loading is false
  loading?: boolean;
}

// Spinner size classes
const spinnerSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = "spinner",
  size = "md",
  message,
  className,
  skeletonCount = 3,
  skeletonWidth = "100%",
  skeletonHeight = 20,
  skeletonShape = "rectangle",
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
            "animate-spin rounded-full border-2 border-slate-300 border-t-blue-600",
            spinnerSizes[size]
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
        {Array.from({ length: skeletonCount }).map((_, i) => {
          // Determine border radius for shape
          const shapeStyle =
            skeletonShape === "circle"
              ? {
                  borderRadius: "9999px",
                  width: skeletonWidth || skeletonHeight,
                  height: skeletonHeight || skeletonWidth,
                }
              : {
                  borderRadius: "0.5rem",
                  width: skeletonWidth,
                  height: skeletonHeight,
                };
          return <div key={i} className="skeleton" style={shapeStyle} />;
        })}
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
          "animate-spin rounded-full border-2 border-slate-300 border-t-blue-600",
          spinnerSizes[size]
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
