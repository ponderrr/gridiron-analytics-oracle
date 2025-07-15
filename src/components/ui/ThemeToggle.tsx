import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeSelector } from "@/hooks/useThemeSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const { theme, setTheme, effectiveTheme, toggleTheme } = useThemeSelector();

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
      return <Monitor className={cn(getIconSize(), "text-indigo-400")} />;
    }
    return effectiveTheme === "dark" ? (
      <Moon className={cn(getIconSize(), "text-slate-200")} />
    ) : (
      <Sun className={cn(getIconSize(), "text-slate-700")} />
    );
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={toggleTheme}
        className={cn(
          "relative overflow-hidden transition-all duration-300 origin-center",
          "hover:shadow-lg motion-safe:hover:scale-105 motion-safe:hover:-rotate-1",
          effectiveTheme === "dark"
            ? "bg-transparent border-slate-700/30 text-slate-300 hover:bg-slate-700/20 hover:text-white"
            : "bg-transparent border-slate-200/30 text-slate-600 hover:bg-slate-100/20 hover:text-slate-900",
          className
        )}
        aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
      >
        <div className="relative z-10">{getCurrentIcon()}</div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "p-2 rounded-lg transition-all duration-300 relative overflow-hidden group origin-center",
          "hover:shadow-md motion-safe:hover:scale-105 motion-safe:hover:-rotate-1",
          effectiveTheme === "dark"
            ? "bg-transparent hover:bg-slate-600/20 text-slate-300 hover:text-white"
            : "bg-transparent hover:bg-slate-200/20 text-slate-600 hover:text-slate-900",
          className
        )}
        aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
      >
        <div className="relative z-10">{getCurrentIcon()}</div>
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
          className={cn(
            "relative overflow-hidden transition-all duration-300 origin-center",
            "hover:shadow-lg motion-safe:hover:scale-105 motion-safe:hover:-rotate-1",
            effectiveTheme === "dark"
              ? "bg-transparent border-slate-700/30 text-slate-300 hover:bg-slate-700/20 hover:text-white"
              : "bg-transparent border-slate-200/30 text-slate-600 hover:bg-slate-100/20 hover:text-slate-900",
            className
          )}
          aria-label="Toggle theme"
        >
          <div className="relative z-10">{getCurrentIcon()}</div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "border shadow-xl",
          effectiveTheme === "dark"
            ? "bg-slate-800/95 border-slate-700/50 backdrop-blur-md"
            : "bg-white/95 border-slate-200/50 backdrop-blur-md"
        )}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer transition-colors duration-200",
            effectiveTheme === "dark"
              ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
          )}
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-indigo-400 font-bold">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer transition-colors duration-200",
            effectiveTheme === "dark"
              ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
          )}
        >
          <Moon className="mr-2 h-4 w-4 text-purple-400" />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-indigo-400 font-bold">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer transition-colors duration-200",
            effectiveTheme === "dark"
              ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
          )}
        >
          <Monitor className="mr-2 h-4 w-4 text-indigo-400" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-indigo-400 font-bold">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
