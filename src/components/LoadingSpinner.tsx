import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  message,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full border-slate-600 border-t-emerald-500 animate-spin bg-transparent",
          sizeClasses[size]
        )}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      />
      {message && (
        <div className="mt-3 text-center text-base text-slate-500">
          {message}
        </div>
      )}
    </div>
  );
};

export default React.memo(LoadingSpinner);
