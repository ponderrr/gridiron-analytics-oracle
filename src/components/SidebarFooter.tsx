import React, { useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  isCollapsed?: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isCollapsed = false,
}) => {
  const { user, logout } = useAuth();
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  const userDisplayName = useMemo(() => {
    if (!user?.email) return "User";
    try {
      return user.email.split("@")[0] || "User";
    } catch (error) {
      console.error("Error parsing user email:", error);
      return "User";
    }
  }, [user?.email]);

  const userEmail = useMemo(() => {
    if (!user?.email) return "";
    return String(user.email);
  }, [user?.email]);

  if (isCollapsed) {
    return (
      <div
        className={cn(
          "px-4 py-4 relative z-10",
          effectiveTheme === "dark"
            ? "border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
            : "border-t border-slate-200/50 bg-white/50 backdrop-blur-sm"
        )}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <ThemeToggle variant="icon" size="sm" />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center justify-center p-2 rounded-lg transition-all duration-300 relative group overflow-hidden",
                effectiveTheme === "dark"
                  ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
                  : "bg-slate-100/50 hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
              )}
              aria-label="User menu"
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  effectiveTheme === "dark"
                    ? "bg-gradient-to-br from-slate-600/60 to-slate-500/60"
                    : "bg-gradient-to-br from-slate-200/80 to-slate-100/80"
                )}
              />
              <User className="h-5 w-5 relative z-10" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(
                "w-56 border shadow-xl",
                effectiveTheme === "dark"
                  ? "bg-slate-800/95 border-slate-700/50 backdrop-blur-md"
                  : "bg-white/95 border-slate-200/50 backdrop-blur-md"
              )}
            >
              <div
                className={cn(
                  "px-2 py-1.5 text-sm",
                  effectiveTheme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                )}
              >
                {userEmail}
              </div>
              <DropdownMenuSeparator
                className={
                  effectiveTheme === "dark"
                    ? "bg-slate-700/50"
                    : "bg-slate-200/50"
                }
              />
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className={cn(
                    "cursor-pointer transition-colors duration-200",
                    effectiveTheme === "dark"
                      ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
                  )}
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  className={cn(
                    "cursor-pointer transition-colors duration-200",
                    effectiveTheme === "dark"
                      ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
                  )}
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator
                className={
                  effectiveTheme === "dark"
                    ? "bg-slate-700/50"
                    : "bg-slate-200/50"
                }
              />
              <DropdownMenuItem
                onClick={handleLogout}
                className={cn(
                  "cursor-pointer transition-colors duration-200",
                  effectiveTheme === "dark"
                    ? "text-slate-300 hover:text-red-400 hover:bg-red-500/10"
                    : "text-slate-700 hover:text-red-600 hover:bg-red-50/50"
                )}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-4 py-4 relative z-10",
        effectiveTheme === "dark"
          ? "border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
          : "border-t border-slate-200/50 bg-white/50 backdrop-blur-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <ThemeToggle variant="icon" size="sm" />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 relative group overflow-hidden",
              effectiveTheme === "dark"
                ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
                : "bg-slate-100/50 hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                effectiveTheme === "dark"
                  ? "bg-gradient-to-r from-slate-600/60 via-slate-500/60 to-slate-600/60"
                  : "bg-gradient-to-r from-slate-200/80 via-slate-100/80 to-slate-200/80"
              )}
            />
            <User
              className={`h-4 w-4 relative z-10 ${effectiveTheme === "dark" ? "text-slate-300" : "text-slate-600"}`}
            />
            <span
              className={cn(
                "text-sm font-medium relative z-10",
                effectiveTheme === "dark" ? "text-slate-300" : "text-slate-600"
              )}
            >
              {userDisplayName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              "w-56 border shadow-xl",
              effectiveTheme === "dark"
                ? "bg-slate-800/95 border-slate-700/50 backdrop-blur-md"
                : "bg-white/95 border-slate-200/50 backdrop-blur-md"
            )}
          >
            <div
              className={cn(
                "px-2 py-1.5 text-sm",
                effectiveTheme === "dark" ? "text-slate-400" : "text-slate-500"
              )}
            >
              {userEmail}
            </div>
            <DropdownMenuSeparator
              className={
                effectiveTheme === "dark"
                  ? "bg-slate-700/50"
                  : "bg-slate-200/50"
              }
            />
            <DropdownMenuItem asChild>
              <Link
                to="/profile"
                className={cn(
                  "cursor-pointer transition-colors duration-200",
                  effectiveTheme === "dark"
                    ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
                )}
              >
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className={cn(
                  "cursor-pointer transition-colors duration-200",
                  effectiveTheme === "dark"
                    ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
                )}
              >
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator
              className={
                effectiveTheme === "dark"
                  ? "bg-slate-700/50"
                  : "bg-slate-200/50"
              }
            />
            <DropdownMenuItem
              onClick={handleLogout}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                effectiveTheme === "dark"
                  ? "text-slate-300 hover:text-red-400 hover:bg-red-500/10"
                  : "text-slate-700 hover:text-red-600 hover:bg-red-50/50"
              )}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SidebarFooter;
