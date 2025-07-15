import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const { effectiveTheme } = useTheme();

  const sizeClasses = {
    sm: "h-16 w-auto",
    md: "h-24 w-auto",
    lg: "h-32 w-auto",
  };

  const logoSrc =
    effectiveTheme === "dark"
      ? "/ff-meta-dark-logo.svg"
      : "/ff-meta-light-logo.svg";

  return (
    <img
      src={logoSrc}
      alt="FF Meta Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
