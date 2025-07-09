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
import { MESSAGE_CONSTANTS, getThemeClasses } from "@/lib/constants";
import { THEME_CONSTANTS } from "@/lib/constants";

interface SidebarFooterProps {
  isCollapsed?: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isCollapsed = false,
}) => {
  const { user, logout } = useAuth();
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();
  const themeClasses = getThemeClasses(effectiveTheme);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  // Helper function to safely get user display name - memoized
  const getUserDisplayName = useMemo(() => {
    if (!user?.email) return "User";
    try {
      return user.email.split("@")[0] || "User";
    } catch (error) {
      console.error("Error parsing user email:", error);
      return "User";
    }
  }, [user?.email]);

  // Helper function to safely get user email - memoized
  const getUserEmail = useMemo(() => {
    if (!user?.email) return "";
    return String(user.email);
  }, [user?.email]);

  if (isCollapsed) {
    return (
      <div
        className={`px-4 py-4 border-t ${themeClasses.BORDER} relative z-10`}
      >
        <div className="flex flex-col items-center space-y-3">
          {/* Theme Toggle */}
          <ThemeToggle variant="icon" size="sm" />

          {/* Profile Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center justify-center p-2 rounded-lg ${themeClasses.BG_HOVER} transition-all duration-200 ${themeClasses.TEXT_TERTIARY} hover:${themeClasses.TEXT_PRIMARY} focus:ring-2 focus:ring-emerald-400 focus:outline-none`}
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`w-56 ${themeClasses.BG_CARD} border ${themeClasses.BORDER}`}
            >
              <div
                className={`px-2 py-1.5 text-sm ${themeClasses.TEXT_TERTIARY}`}
              >
                {getUserEmail}
              </div>
              <DropdownMenuSeparator className={themeClasses.BORDER} />
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className={`${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} cursor-pointer`}
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  className={`${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} cursor-pointer`}
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className={themeClasses.BORDER} />
              <DropdownMenuItem
                onClick={handleLogout}
                className={`${themeClasses.TEXT_SECONDARY} hover:${THEME_CONSTANTS.THEME.COMMON.ACCENT_DANGER} cursor-pointer`}
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
    <div className={`px-4 py-4 border-t ${themeClasses.BORDER} relative z-10`}>
      <div className="flex items-center justify-between">
        {/* Theme Toggle */}
        <ThemeToggle variant="icon" size="sm" />

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex items-center space-x-2 ${themeClasses.BG_TERTIARY} ${themeClasses.BG_HOVER} px-3 py-2 rounded-lg transition-colors`}
          >
            <User className={`h-4 w-4 ${themeClasses.TEXT_SECONDARY}`} />
            <span className={`text-sm ${themeClasses.TEXT_SECONDARY}`}>
              {getUserDisplayName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={`w-56 ${themeClasses.BG_CARD} border ${themeClasses.BORDER}`}
          >
            <div
              className={`px-2 py-1.5 text-sm ${themeClasses.TEXT_TERTIARY}`}
            >
              {getUserEmail}
            </div>
            <DropdownMenuSeparator className={themeClasses.BORDER} />
            <DropdownMenuItem asChild>
              <Link
                to="/profile"
                className={`${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} cursor-pointer`}
              >
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className={`${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} cursor-pointer`}
              >
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={themeClasses.BORDER} />
            <DropdownMenuItem
              onClick={handleLogout}
              className={`${themeClasses.TEXT_SECONDARY} hover:${THEME_CONSTANTS.THEME.COMMON.ACCENT_DANGER} cursor-pointer`}
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
