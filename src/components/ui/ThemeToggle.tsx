import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getThemeClasses } from "@/lib/constants";

interface ThemeToggleProps {
  variant?: "button" | "icon" | "dropdown";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "dropdown",
  size = "default",
  className = "",
}) => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const getCurrentIcon = () => {
    if (theme === "system") {
      return <Monitor className={getIconSize()} />;
    }
    return effectiveTheme === "dark" ? (
      <Moon className={getIconSize()} />
    ) : (
      <Sun className={getIconSize()} />
    );
  };

  const toggleTheme = () => {
    const newTheme = effectiveTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={toggleTheme}
        className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY} hover:${themeClasses.BG_HOVER} ${className}`}
        aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
      >
        {getCurrentIcon()}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg ${themeClasses.BG_HOVER} transition-colors ${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} ${className}`}
        aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
      >
        {getCurrentIcon()}
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} ${themeClasses.TEXT_PRIMARY} hover:${themeClasses.BG_HOVER} ${className}`}
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER}`}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`${themeClasses.TEXT_PRIMARY} hover:${themeClasses.BG_HOVER} cursor-pointer`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`${themeClasses.TEXT_PRIMARY} hover:${themeClasses.BG_HOVER} cursor-pointer`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`${themeClasses.TEXT_PRIMARY} hover:${themeClasses.BG_HOVER} cursor-pointer`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
