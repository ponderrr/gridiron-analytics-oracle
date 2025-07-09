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
      {/* External SVG Logo */}
      <img
        src="/logo.svg"
        alt="FF META Logo"
        className={sizeClasses[size]}
        style={{
          filter: effectiveTheme === "dark" ? "invert(1)" : "none",
        }}
      />

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
