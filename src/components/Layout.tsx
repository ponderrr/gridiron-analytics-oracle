import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import AppSidebar from "@/components/AppSidebar";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  MESSAGE_CONSTANTS,
  getThemeClasses,
  SPACING_SCALE,
} from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (authError) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${themeClasses.BG_PRIMARY}`}
      >
        <div
          className={`${themeClasses.BG_CARD} border ${themeClasses.BORDER} rounded-lg flex flex-col items-center`}
          style={{ padding: SPACING_SCALE.xl }}
        >
          <div className="text-red-400 font-bold text-lg mb-2">
            {MESSAGE_CONSTANTS.ERROR_AUTH}
          </div>
          <div
            className={`${themeClasses.TEXT_TERTIARY}`}
            style={{ marginBottom: SPACING_SCALE.md }}
          >
            {authError?.message || "An authentication error occurred"}
          </div>
          <button
            className="btn-primary rounded font-semibold"
            style={{ padding: `${SPACING_SCALE.sm} ${SPACING_SCALE.md}` }}
            onClick={() => window.location.reload()}
          >
            {MESSAGE_CONSTANTS.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

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

  if (user) {
    return (
      <ErrorBoundary>
        <div
          className={`min-h-screen ${themeClasses.BG_PRIMARY} relative`}
          style={{ overflowX: "hidden" }}
        >
          <AppSidebar
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
          <button
            className="fixed z-40 top-4 left-4 md:hidden bg-emerald-500 text-white rounded-full shadow-lg touch-target"
            style={{ minWidth: 44, minHeight: 44, padding: 12 }}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div
            className="min-h-screen flex flex-col"
            style={{ marginLeft: "var(--sidebar-width, 18rem)" }}
          >
            <main
              className="flex-1 overflow-y-auto"
              style={{ padding: SPACING_SCALE.xl, paddingBottom: "5rem" }}
            >
              {children}
            </main>
            <nav
              className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-around items-center md:hidden z-50"
              style={{ height: "4rem", paddingBottom: "env(safe-area-inset-bottom, 0)" }}
            >
              <Link to="/dashboard" className="flex flex-col items-center justify-center touch-target" aria-label="Dashboard">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 13h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z" />
                </svg>
                <span className="text-xs mt-1">Dashboard</span>
              </Link>
              <Link to="/players" className="flex flex-col items-center justify-center touch-target" aria-label="Players">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="text-xs mt-1">Players</span>
              </Link>
              <Link to="/trade-analyzer" className="flex flex-col items-center justify-center touch-target" aria-label="Trade Analyzer">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                <span className="text-xs mt-1">Trade</span>
              </Link>
              <Link to="/settings" className="flex flex-col items-center justify-center touch-target" aria-label="Settings">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .66.38 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .66.38 1.26 1 1.51a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09c-.66 0-1.26.38-1.51 1z" />
                </svg>
                <span className="text-xs mt-1">Settings</span>
              </Link>
            </nav>
            <footer className={`${themeClasses.BG_SECONDARY} border-t ${themeClasses.BORDER}`} style={{ padding: `${SPACING_SCALE.md} ${SPACING_SCALE.xl}` }}>
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

  // Public layout
  return (
    <div className={`min-h-screen ${themeClasses.BG_PRIMARY} flex flex-col`}>
      <header className={`${themeClasses.BG_HEADER} backdrop-blur-lg border-b ${themeClasses.BORDER} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-400 transition-colors">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${themeClasses.TEXT_PRIMARY}`}>{MESSAGE_CONSTANTS.APP_NAME}</h1>
                <p className="text-xs text-emerald-400 -mt-1">{MESSAGE_CONSTANTS.APP_TAGLINE}</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
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
      <main className="flex-1">{children}</main>
      <footer className="w-full py-6 mt-auto bg-transparent">
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
