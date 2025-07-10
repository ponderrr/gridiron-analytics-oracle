import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

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
    <div
      className={cn("flex items-center space-x-3 relative group", className)}
    >
      {/* Enhanced logo container with gradient effect */}
      <div className="relative">
        {/* Gradient background for logo */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            effectiveTheme === "dark"
              ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
              : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
          )}
        />

        {/* External SVG Logo */}
        <img
          src="/logo.svg"
          alt="FF META Logo"
          className={cn(
            sizeClasses[size],
            "relative z-10 transition-transform duration-300 group-hover:scale-110"
          )}
          style={{
            filter: effectiveTheme === "dark" ? "invert(1)" : "none",
          }}
        />
      </div>

      {showText && (
        <div className="relative">
          {/* Text gradient effect */}
          <span
            className={cn(
              textSizes[size],
              "font-black transition-all duration-300",
              effectiveTheme === "dark"
                ? "text-white group-hover:text-indigo-400"
                : "text-slate-900 group-hover:text-indigo-600"
            )}
          >
            FF META
          </span>

          {/* Subtle glow effect on hover */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm",
              effectiveTheme === "dark"
                ? "bg-gradient-to-r from-indigo-400 to-purple-400"
                : "bg-gradient-to-r from-indigo-500 to-purple-500"
            )}
            style={{ zIndex: -1 }}
          />
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
    <Link
      to="/"
      className="group transition-all duration-300 hover:scale-105"
      aria-label="Go to dashboard home"
    >
      {logoContent}
    </Link>
  );
};

export default Logo;
