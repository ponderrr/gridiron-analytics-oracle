import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, User, LogOut, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  APP_NAME,
  APP_TAGLINE,
  COPYRIGHT,
  LOADING_MESSAGE,
  ERROR_AUTH,
  RETRY_LABEL,
} from "@/lib/constants";
import { appConfig } from "@/config/app";

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

// Sidebar skeleton loader - moved outside to prevent recreation on every render
const SidebarSkeleton = React.memo(() => (
  <div className="bg-slate-800 border-r border-slate-700 w-64 flex flex-col h-screen animate-pulse">
    <div className="flex items-center justify-between px-4 py-3">
      <div className="bg-emerald-500 p-2 rounded-md w-10 h-10" />
      <div className="rounded-md bg-slate-700 w-8 h-8" />
    </div>
    <div className="flex-1 px-4 py-4 space-y-4">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-8 bg-slate-700 rounded-md w-full" />
      ))}
    </div>
    <div className="px-4 py-3 border-t border-slate-700">
      <div className="h-4 bg-slate-700 rounded w-1/2" />
    </div>
  </div>
));

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated }) => {
  const { user, logout, isLoading, authError } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated || !!user;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Error state for auth failures
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 flex flex-col items-center">
          <div className="text-red-400 font-bold text-lg mb-2">
            {ERROR_AUTH}
          </div>
          <div className="text-slate-400 mb-4">{authError.message}</div>
          <button
            className="btn-primary px-6 py-2 rounded font-semibold"
            onClick={() => window.location.reload()}
          >
            {RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  // Loading state for auth initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full bg-slate-900">
        <SidebarSkeleton />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" message={LOADING_MESSAGE} />
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex w-full bg-slate-900">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            {/* Header for authenticated users */}
            <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40">
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
                      <h1 className="text-xl font-bold text-white">
                        {APP_NAME}
                      </h1>
                      <p className="text-xs text-emerald-400 -mt-1">
                        {APP_TAGLINE}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center space-x-4">
                    {/* Search Bar */}
                    <div className="hidden md:block relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search players, teams..."
                        className="bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
                      />
                    </div>

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
                        <User className="h-4 w-4 text-slate-300" />
                        <span className="text-sm text-slate-300 hidden sm:block">
                          {user?.email?.split("@")[0] || "User"}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-slate-800 border-slate-700"
                      >
                        <div className="px-2 py-1.5 text-sm text-slate-400">
                          {user?.email}
                        </div>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/settings"
                            className="text-slate-300 hover:text-white"
                          >
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white">
                          Help & Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
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

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Public layout for non-authenticated users
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-400 transition-colors">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
                <p className="text-xs text-emerald-400 -mt-1">{APP_TAGLINE}</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
      <footer className="bg-slate-800/50 border-t border-slate-700/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm">{COPYRIGHT}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const areEqual = (prev: LayoutProps, next: LayoutProps) =>
  prev.isAuthenticated === next.isAuthenticated &&
  prev.children === next.children;

export default React.memo(Layout, areEqual);
