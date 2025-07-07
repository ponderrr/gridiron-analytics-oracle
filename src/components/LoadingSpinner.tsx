import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";

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
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          `rounded-full ${themeClasses.BORDER} border-t-emerald-500 animate-spin bg-transparent`,
          sizeClasses[size]
        )}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      />
      {message && (
        <div
          className={`mt-3 text-center text-base ${themeClasses.TEXT_TERTIARY}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default React.memo(LoadingSpinner);
