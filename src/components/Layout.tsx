import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MESSAGE_CONSTANTS, getThemeClasses } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";

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
  const { user, isLoading, authError } = useAuth();
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);

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
            {/* Main Content - this will scroll independently */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {children}
            </main>

            {/* Site-wide Footer */}
            <footer
              className={`${themeClasses.BG_SECONDARY} border-t ${themeClasses.BORDER} py-4 px-4 sm:px-6 lg:px-8`}
            >
              <div className="text-center">
                <p className={`${themeClasses.TEXT_TERTIARY} text-sm`}>
                  © 2025 FF Meta — All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Public layout for non-authenticated users
  return (
    <div className={`min-h-screen ${themeClasses.BG_PRIMARY}`}>
      {/* Transparent Navbar */}
      <header className="sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 backdrop-blur-md bg-transparent border-b border-b-transparent">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-indigo-500 p-2 rounded-lg group-hover:bg-indigo-400 transition-colors">
                <img src="/logo.svg" alt="FF Meta Logo" className="h-6 w-6" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${themeClasses.TEXT_PRIMARY}`}>{MESSAGE_CONSTANTS.APP_NAME}</h1>
                <p className="text-xs text-indigo-400 -mt-1">{MESSAGE_CONSTANTS.APP_TAGLINE}</p>
              </div>
            </Link>
            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className={`${themeClasses.TEXT_SECONDARY} hover:${themeClasses.TEXT_PRIMARY} px-4 py-2 rounded-full text-sm font-medium transition-colors hover:${themeClasses.BG_HOVER}`}
              >
                Login
              </Link>
              <ThemeToggle variant="icon" size="sm" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Simple Footer (no pill/rounded) */}
      <footer className={`w-full py-6 mt-auto bg-transparent`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center text-sm">
          <span className={`${themeClasses.TEXT_TERTIARY}`}>© 2025 FF Meta</span>
        </div>
      </footer>
    </div>
  );
};

Layout.displayName = "Layout";

const MemoizedLayout = React.memo(Layout);
MemoizedLayout.displayName = "MemoizedLayout";

export default MemoizedLayout;
