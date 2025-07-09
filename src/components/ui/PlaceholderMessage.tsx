import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PlaceholderMessageProps {
  icon?: React.ReactNode;
  headline?: string;
  subtext?: string;
  actionLabel?: string;
  onAction?: () => void;
  message?: string; // fallback for legacy usage
  className?: string;
}

const PlaceholderMessage: React.FC<PlaceholderMessageProps> = ({
  icon,
  headline,
  subtext,
  actionLabel,
  onAction,
  message,
  className,
}) => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[200px] p-8 gap-4",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && <div className="mb-2 text-4xl opacity-70">{icon}</div>}
      {headline && (
        <h2
          className={`text-xl font-semibold mb-1 ${themeClasses.TEXT_PRIMARY}`}
        >
          {headline}
        </h2>
      )}
      {subtext && (
        <p className={`text-base mb-2 ${themeClasses.TEXT_TERTIARY}`}>
          {subtext}
        </p>
      )}
      {actionLabel && onAction && (
        <button className="btn-primary mt-2" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {/* Fallback for legacy usage */}
      {!headline && message && (
        <p
          className={`text-lg ${themeClasses.TEXT_MUTED} font-medium tracking-wide`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default PlaceholderMessage;
