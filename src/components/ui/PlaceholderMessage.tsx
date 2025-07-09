import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PlaceholderMessageProps {
  message: string;
  className?: string;
}

const PlaceholderMessage: React.FC<PlaceholderMessageProps> = ({
  message,
  className,
}) => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[200px] p-8",
        className
      )}
    >
      <div className="text-center">
        <p
          className={`text-lg ${themeClasses.TEXT_MUTED} font-medium tracking-wide`}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderMessage; 