import React, { useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MESSAGE_CONSTANTS, getThemeClasses } from "@/lib/constants";
import { THEME_CONSTANTS } from "@/lib/constants";

interface LayoutProps {
  children: React.ReactNode;
}

// Sidebar skeleton loader - moved outside to prevent recreation on every render
const SidebarSkeleton = React.memo(() => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

  return (
    <div
      className={`${themeClasses.BG_SIDEBAR} border-r ${themeClasses.BORDER} w-64 flex flex-col h-screen animate-pulse fixed left-0 top-0 z-30`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="bg-emerald-500 p-2 rounded-md w-10 h-10" />
        <div className={`rounded-md ${themeClasses.BG_TERTIARY} w-8 h-8`} />
      </div>
      <div className="flex-1 px-4 py-4 space-y-4">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`h-8 ${themeClasses.BG_TERTIARY} rounded-md w-full`}
          />
        ))}
      </div>
      <div className={`px-4 py-3 border-t ${themeClasses.BORDER}`}>
        <div className={`h-4 ${themeClasses.BG_TERTIARY} rounded w-1/2`} />
      </div>
    </div>
  );
});

SidebarSkeleton.displayName = "SidebarSkeleton";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isLoading, authError } = useAuth();
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

  // Error state for auth failures
  if (authError) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${themeClasses.BG_PRIMARY}`}
      >
        <div
          className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} rounded-lg p-8 flex flex-col items-center`}
        >
          <div className="text-red-400 font-bold text-lg mb-2">
            {MESSAGE_CONSTANTS.ERROR_AUTH}
          </div>
          <div className={`${themeClasses.TEXT_TERTIARY} mb-4`}>
            {authError?.message || "An authentication error occurred"}
          </div>
          <button
            className="btn-primary px-6 py-2 rounded font-semibold"
            onClick={() => window.location.reload()}
          >
            {MESSAGE_CONSTANTS.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  // Loading state for auth initialization
  if (isLoading) {
    return (
      <div className={`min-h-screen flex w-full ${themeClasses.BG_PRIMARY}`}>
        <SidebarSkeleton />
        <div
          className="flex-1 flex items-center justify-center"
          style={{ marginLeft: "var(--sidebar-width, 16rem)" }}
        >
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!!user) {
    return (
      <ErrorBoundary>
        <div className={`min-h-screen ${themeClasses.BG_PRIMARY}`}>
          <AppSidebar />

          {/* Main content area with margin to account for fixed sidebar */}
          <div
            className="min-h-screen flex flex-col"
            style={{ marginLeft: "var(--sidebar-width, 18rem)" }}
          >
            {/* Header for authenticated users */}
            <header
              className={`${themeClasses.BG_HEADER} backdrop-blur-lg border-b ${themeClasses.BORDER} sticky top-0 z-40`}
            >
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo */}
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 group"
                  >
                    <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-400 transition-colors">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="hidden sm:block">
                      <h1
                        className={`text-xl font-bold ${themeClasses.TEXT_PRIMARY}`}
                      >
                        {MESSAGE_CONSTANTS.APP_NAME}
                      </h1>
                      <p className="text-xs text-emerald-400 -mt-1">
                        {MESSAGE_CONSTANTS.APP_TAGLINE}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center space-x-4">
                    {/* Theme Toggle */}
                    <ThemeToggle variant="icon" size="sm" />

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={`flex items-center space-x-2 ${themeClasses.BG_TERTIARY} ${themeClasses.BG_HOVER} px-3 py-2 rounded-lg transition-colors`}
                      >
                        <User
                          className={`h-4 w-4 ${themeClasses.TEXT_SECONDARY}`}
                        />
                        <span
                          className={`text-sm ${themeClasses.TEXT_SECONDARY} hidden sm:block`}
                        >
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
                        <DropdownMenuSeparator
                          className={themeClasses.BORDER}
                        />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/settings"
                            className={`${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} cursor-pointer`}
                          >
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator
                          className={themeClasses.BORDER}
                        />
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
              </div>
            </header>

            {/* Main Content - this will scroll independently */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Public layout for non-authenticated users
  return (
    <div className={`min-h-screen ${themeClasses.BG_PRIMARY}`}>
      {/* Header */}
      <header
        className={`${themeClasses.BG_HEADER} backdrop-blur-lg border-b ${themeClasses.BORDER} sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-400 transition-colors">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1
                  className={`text-xl font-bold ${themeClasses.TEXT_PRIMARY}`}
                >
                  {MESSAGE_CONSTANTS.APP_NAME}
                </h1>
                <p className="text-xs text-emerald-400 -mt-1">
                  {MESSAGE_CONSTANTS.APP_TAGLINE}
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className={`${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className={`${themeClasses.BG_SECONDARY} border-t ${themeClasses.BORDER} mt-auto`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className={`${themeClasses.TEXT_TERTIARY} text-sm`}>
              {MESSAGE_CONSTANTS.COPYRIGHT}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

Layout.displayName = "Layout";

const MemoizedLayout = React.memo(Layout);
MemoizedLayout.displayName = "MemoizedLayout";

export default MemoizedLayout;
