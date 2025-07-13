import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarFooter from "@/components/SidebarFooter";
import { SIDEBAR_SECTIONS_CONFIG } from "@/components/layout/SidebarLinks";
import { useTheme } from "@/contexts/ThemeContext";

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
  const allNavItems = SIDEBAR_SECTIONS_CONFIG.flatMap(section => section.items);

  // Theme-based classes
  const sidebarBg = effectiveTheme === "dark" ? "bg-[#18181b]" : "bg-white";
  const borderColor = effectiveTheme === "dark" ? "border-zinc-800" : "border-gray-100";
  const navActiveBg = effectiveTheme === "dark" ? "bg-zinc-800 shadow" : "bg-white shadow-md";
  const navActiveText = effectiveTheme === "dark" ? "text-white" : "text-gray-900";
  const navInactiveText = effectiveTheme === "dark" ? "text-zinc-400" : "text-gray-600";
  const navInactiveHover = effectiveTheme === "dark" ? "hover:bg-zinc-800 hover:text-white" : "hover:bg-gray-50 hover:text-gray-900";
  const iconActive = effectiveTheme === "dark" ? "text-white" : "text-gray-900";
  const iconInactive = effectiveTheme === "dark" ? "text-zinc-500" : "text-gray-400";
  const soonBg = effectiveTheme === "dark" ? "bg-zinc-700 text-zinc-200" : "bg-orange-100 text-orange-600";

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      <nav
        className={cn(
          "flex flex-col h-screen transition-all duration-300 flex-shrink-0 relative fixed left-0 top-0 z-50 border-r",
          sidebarBg,
          borderColor,
          isCollapsed
            ? "w-20 transition-[width] duration-300 ease-in-out"
            : "w-72 transition-[width] duration-300 ease-in-out"
        )}
        role="navigation"
        aria-label="Main sidebar navigation"
        style={{ maxWidth: 320 }}
      >
        {/* Header Section: Only collapse/expand button, right-aligned */}
        <div className="flex items-center justify-end px-6 py-6">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            className={cn(
              "p-2 rounded-lg transition-all",
              effectiveTheme === "dark"
                ? "hover:bg-zinc-800 text-zinc-500 hover:text-white"
                : "hover:bg-gray-200 text-gray-400 hover:text-gray-700"
            )}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                    isActive
                      ? `${navActiveBg} ${navActiveText}`
                      : `${navInactiveText} ${navInactiveHover}`
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={0}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? iconActive : iconInactive)} />
                  <span
                    className={cn(
                      "origin-left transition-all duration-300 ml-1",
                      isCollapsed
                        ? "opacity-0 max-w-0 scale-x-75 pointer-events-none select-none"
                        : "opacity-100 max-w-xs scale-x-100"
                    )}
                    style={{ display: "inline-block", minWidth: isCollapsed ? 0 : 1, whiteSpace: "nowrap" }}
                  >
                    {item.label}
                  </span>
                  {item.comingSoon && !isCollapsed && (
                    <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full font-semibold", soonBg)}>SOON</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        {/* Footer Section - always pinned to bottom */}
        <SidebarFooter isCollapsed={isCollapsed} />
      </nav>
    </>
  );
};

AppSidebar.displayName = "AppSidebar";

export default AppSidebar;
