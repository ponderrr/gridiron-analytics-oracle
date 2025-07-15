import React, { useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIDEBAR_SECTIONS_CONFIG } from "@/components/layout/SidebarLinks";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/ui/Logo";

interface AppSidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen = false,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { pathname } = useLocation();
  const { effectiveTheme } = useTheme();
  const allNavItems = useMemo(
    () => SIDEBAR_SECTIONS_CONFIG.flatMap((section) => section.items),
    []
  );

  // Memoize theme-based classes
  const themeClasses = useMemo(
    () => ({
      sidebarBg: effectiveTheme === "dark" ? "bg-[#18181b]" : "bg-white",
      borderColor:
        effectiveTheme === "dark" ? "border-zinc-800" : "border-gray-100",
      navActiveBg:
        effectiveTheme === "dark" ? "bg-zinc-800 shadow" : "bg-white shadow-md",
      navActiveText: effectiveTheme === "dark" ? "text-white" : "text-gray-900",
      navInactiveText:
        effectiveTheme === "dark" ? "text-zinc-400" : "text-gray-600",
      navInactiveHover:
        effectiveTheme === "dark"
          ? "hover:bg-zinc-800 hover:text-white"
          : "hover:bg-gray-50 hover:text-gray-900",
      iconActive: effectiveTheme === "dark" ? "text-white" : "text-gray-900",
      iconInactive:
        effectiveTheme === "dark" ? "text-zinc-500" : "text-gray-400",
      soonBg:
        effectiveTheme === "dark"
          ? "bg-zinc-700 text-zinc-200"
          : "bg-orange-100 text-orange-600",
    }),
    [effectiveTheme]
  );

  // Memoize event handlers
  const handleMobileOverlayClick = useCallback(() => {
    setIsMobileOpen && setIsMobileOpen(false);
  }, [setIsMobileOpen]);

  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [setIsCollapsed, isCollapsed]);

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={handleMobileOverlayClick}
          aria-label="Close sidebar overlay"
        />
      )}
      <nav
        className={cn(
          "flex flex-col h-screen transition-all duration-300 flex-shrink-0 relative fixed left-0 top-0 z-50 border-r",
          themeClasses.sidebarBg,
          themeClasses.borderColor,
          isCollapsed
            ? "w-20 transition-[width] duration-300 ease-in-out"
            : "w-72 transition-[width] duration-300 ease-in-out"
        )}
        role="navigation"
        aria-label="Main sidebar navigation"
        style={{ maxWidth: 320 }}
      >
        {/* Header Section: Logo and collapse/expand button */}
        <div className="flex items-center justify-between px-6 py-6">
          <Logo
            size="sm"
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "opacity-0 scale-75" : "opacity-100 scale-100"
            )}
          />
          <button
            onClick={handleCollapseToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            className={cn(
              "p-2 rounded-lg transition-all",
              effectiveTheme === "dark"
                ? "hover:bg-zinc-800 text-zinc-500 hover:text-white"
                : "hover:bg-gray-200 text-gray-400 hover:text-gray-700"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* Navigation - single list, no categories */}
        <ul className="flex-1 min-h-0 px-4 py-2 space-y-2 overflow-y-auto">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? `${themeClasses.navActiveBg} ${themeClasses.navActiveText}`
                      : `${themeClasses.navInactiveText} ${themeClasses.navInactiveHover}`
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={0}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive
                        ? themeClasses.iconActive
                        : themeClasses.iconInactive
                    )}
                  />
                  <span
                    className={cn(
                      "origin-left transition-all duration-300 ml-1",
                      isCollapsed
                        ? "opacity-0 max-w-0 scale-x-75 pointer-events-none select-none"
                        : "opacity-100 max-w-xs scale-x-100"
                    )}
                    style={{
                      display: "inline-block",
                      minWidth: isCollapsed ? 0 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.comingSoon && !isCollapsed && (
                    <span
                      className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold",
                        themeClasses.soonBg
                      )}
                    >
                      SOON
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        {/* Footer Section - always pinned to bottom */}
        <div className="py-4" />
      </nav>
    </>
  );
};

function areSidebarPropsEqual(prev: AppSidebarProps, next: AppSidebarProps) {
  return (
    prev.isMobileOpen === next.isMobileOpen &&
    prev.isCollapsed === next.isCollapsed &&
    prev.setIsMobileOpen === next.setIsMobileOpen &&
    prev.setIsCollapsed === next.setIsCollapsed
  );
}

AppSidebar.displayName = "AppSidebar";

export default React.memo(AppSidebar, areSidebarPropsEqual);
