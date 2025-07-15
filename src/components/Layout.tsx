import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import ThemeToggle from "@/components/ui/ThemeToggle";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import FloatingNav from "./FloatingNav";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/ui/Logo";

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarSkeleton = React.memo(() => {
  return (
    <div
      className={`bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] w-64 flex flex-col h-screen animate-pulse fixed left-0 top-0 z-30`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="bg-emerald-500 p-2 rounded-md w-10 h-10" />
        <div className={`rounded-md bg-[var(--color-bg-tertiary)] w-8 h-8`} />
      </div>
      <div className="flex-1 px-4 py-4 space-y-4">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`h-8 bg-[var(--color-bg-tertiary)] rounded-md w-full`}
          />
        ))}
      </div>
      <div className={`px-4 py-3 border-t border-[var(--color-border)`}>
        <div className={`h-4 bg-[var(--color-bg-tertiary)] rounded w-1/2`} />
      </div>
    </div>
  );
});

SidebarSkeleton.displayName = "SidebarSkeleton";

const TopRightActions: React.FC = () => {
  const { user, logout } = useAuth();
  const userDisplayName = user?.email ? user.email.split("@")[0] : "User";
  const userEmail = user?.email || "";
  const { effectiveTheme } = useTheme();

  // Match nav pill style
  const pillBg = "bg-transparent";
  const pillText =
    effectiveTheme === "dark" ? "text-zinc-200" : "text-gray-700";
  const pillOutline =
    effectiveTheme === "dark"
      ? "outline outline-2 outline-white outline-offset-0"
      : "outline outline-2 outline-black outline-offset-0";
  const pillFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]";

  return (
    <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
      {/* Theme Toggle as pill */}
      <ThemeToggle
        variant="button"
        size="sm"
        className={cn(
          "rounded-full px-5 py-3",
          pillBg,
          pillText,
          pillOutline,
          pillFocus,
          "transition-transform duration-200 hover:scale-105 active:scale-95"
        )}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-3 font-medium",
              pillBg,
              pillText,
              pillOutline,
              pillFocus,
              "transition-transform duration-200 hover:scale-105 active:scale-95"
            )}
          >
            <User className="h-4 w-4" />
            <span className={cn("text-sm font-medium", pillText)}>
              {userDisplayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 border shadow bg-white dark:bg-zinc-900 rounded-xl mt-2"
        >
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-300">
            {userEmail}
          </div>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-700" />
          <DropdownMenuItem asChild>
            <a
              href="/profile"
              className="cursor-pointer text-gray-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 rounded transition-all"
            >
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="/settings"
              className="cursor-pointer text-gray-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 rounded transition-all"
            >
              Settings
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-700" />
          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-zinc-800 rounded transition-all"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading, authError } = useAuth();
  // Removed unused: const { effectiveTheme } = useTheme();

  // Persist sidebar collapse state in localStorage
  const [] = useLocalStorage("sidebar-collapsed", false);

  // Error state for auth failures
  if (authError) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]`}
      >
        <div
          className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-8 flex flex-col items-center`}
        >
          <div className="text-red-400 font-bold text-lg mb-2">
            Authentication Error
          </div>
          <div className={`text-[var(--color-text-tertiary)] mb-4`}>
            {authError?.message || "An authentication error occurred"}
          </div>
          <button
            className="btn-primary px-6 py-2 rounded font-semibold"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state for auth initialization
  if (isLoading) {
    return (
      <div className={`min-h-screen flex w-full bg-[var(--color-bg-primary)]`}>
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
        <div className={`min-h-screen bg-[var(--color-bg-primary)]`}>
          {/* Floating vertical nav */}
          <FloatingNav />
          {/* Main content area uses full width */}
          <div className="min-h-screen flex flex-col transition-all duration-300 w-full">
            {/* Floating top right actions */}
            <TopRightActions />
            {/* Main Content - this will scroll independently */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
              {children}
            </main>
            {/* Site-wide Footer - seamless, no border, matches background */}
            <footer className="bg-[var(--color-bg-primary)] py-6 w-full">
              <div className="text-center">
                <p className="text-[var(--color-text-tertiary)] text-sm">
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
    <div className={`min-h-screen bg-[var(--color-bg-primary)]`}>
      {/* Transparent Navbar */}
      <header className="sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 backdrop-blur-md bg-transparent border-b border-b-transparent">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <Logo
                size="sm"
                className="group-hover:scale-105 transition-transform duration-200"
              />
            </Link>
            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/auth"
                className={`text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-[var(--color-bg-hover)]`}
              >
                Sign In
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
          <span className={`text-[var(--color-text-tertiary)]`}>
            © 2025 FF Meta
          </span>
        </div>
      </footer>
    </div>
  );
};

Layout.displayName = "Layout";

const MemoizedLayout = React.memo(Layout);
MemoizedLayout.displayName = "MemoizedLayout";

export default MemoizedLayout;
