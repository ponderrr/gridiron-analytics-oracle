import React from "react";
import { cn } from "@/lib/utils";

interface PlaceholderMessageProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "coming-soon" | "empty";
}

const PlaceholderMessage: React.FC<PlaceholderMessageProps> = ({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}) => {
  const baseStyles =
    "flex flex-col items-center justify-center text-center space-y-6 p-12";

  const variantStyles = {
    default: "min-h-[300px]",
    "coming-soon": "coming-soon-card",
    empty:
      "min-h-[200px] bg-theme-secondary rounded-theme-lg border border-theme-primary",
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      {icon && (
        <div
          className={
            variant === "coming-soon"
              ? "coming-soon-icon"
              : "w-16 h-16 text-theme-muted"
          }
        >
          {icon}
        </div>
      )}

      {title && (
        <h2
          className={
            variant === "coming-soon"
              ? "coming-soon-title"
              : "text-2xl font-semibold text-theme-primary"
          }
        >
          {title}
        </h2>
      )}

      {description && (
        <p
          className={
            variant === "coming-soon"
              ? "coming-soon-description"
              : "text-theme-secondary max-w-md"
          }
        >
          {description}
        </p>
      )}

      {action && (
        <button onClick={action.onClick} className="btn-enhanced btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
};

export default PlaceholderMessage;
