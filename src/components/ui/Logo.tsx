import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/constants";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  showText = true,
  size = "md",
}) => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const logoContent = (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Football SVG Logo */}
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="16"
          cy="16"
          rx="14"
          ry="8"
          fill="#10B981"
          stroke="#059669"
          strokeWidth="2"
        />
        <rect x="14" y="10" width="4" height="12" rx="2" fill="#fff" />
        <rect
          x="15.25"
          y="11"
          width="1.5"
          height="10"
          rx="0.75"
          fill="#10B981"
        />
      </svg>

      {showText && (
        <div>
          <span
            className={`${textSizes[size]} font-black ${themeClasses.TEXT_PRIMARY}`}
          >
            FF META
          </span>
        </div>
      )}
    </div>
  );

  // If showText is false, just return the logo without link
  if (!showText) {
    return logoContent;
  }

  // Return with link to home
  return (
    <Link to="/" className="group" aria-label="Go to dashboard home">
      {logoContent}
    </Link>
  );
};

export default Logo;
