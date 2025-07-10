import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
  variant?: "spinner" | "dots" | "pulse";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  message,
  variant = "spinner",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-current animate-pulse",
                  size === "sm"
                    ? "w-1 h-1"
                    : size === "md"
                      ? "w-1.5 h-1.5"
                      : "w-2 h-2"
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div
            className={cn(
              "rounded-full bg-current animate-pulse",
              sizeClasses[size]
            )}
          />
        );

      default:
        return (
          <div
            className={cn(
              "border-2 border-current border-t-transparent rounded-full animate-spin",
              sizeClasses[size]
            )}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-3",
        className
      )}
    >
      <div className="text-theme-muted">{renderSpinner()}</div>

      {message && (
        <p className="text-sm text-theme-secondary text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
};

export default React.memo(LoadingSpinner);
