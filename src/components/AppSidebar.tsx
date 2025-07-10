import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MESSAGE_CONSTANTS, getThemeClasses } from "@/lib/constants";
import useLocalStorage from "@/hooks/useLocalStorage";
import { THEME_CONSTANTS } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/ui/Logo";
import SidebarFooter from "@/components/SidebarFooter";
import { SIDEBAR_SECTIONS_CONFIG } from "@/components/layout/SidebarLinks";
import { SPACING_SCALE } from "@/lib/constants";

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  comingSoon?: boolean;
  isCollapsed?: boolean;
}

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  sectionId: string;
}

interface AppSidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

const NavItem: React.FC<NavItemProps> = React.memo(
  ({ href, icon: Icon, label, comingSoon, isCollapsed }) => {
    const { pathname } = useLocation();
    const { effectiveTheme } = useTheme();
    const themeClasses = getThemeClasses(effectiveTheme);
    const isActive = pathname === href;

    if (isCollapsed) {
      return (
        <Link
          to={href}
          className={cn(
            "flex items-center justify-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
            isActive
              ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/25"
              : `${themeClasses.TEXT_TERTIARY} hover:text-white hover:bg-gradient-to-br hover:from-slate-700/50 hover:to-slate-600/50`
          )}
          title={label}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
          tabIndex={0}
        >
          {/* Active state glow effect */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 animate-pulse rounded-xl" />
          )}
          
          <Icon className="h-5 w-5 relative z-10" />
          
          {comingSoon && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          )}
        </Link>
      );
    }

    return (
      <Link
        to={href}
        className={cn(
          "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-violet-500/15 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/20"
            : `${themeClasses.TEXT_TERTIARY} hover:text-white hover:bg-gradient-to-r hover:from-slate-700/40 hover:via-slate-600/40 hover:to-slate-700/40`
        )}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        tabIndex={0}
      >
        {/* Hover gradient effect */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            effectiveTheme === "dark" 
              ? "bg-gradient-to-r from-slate-700/60 via-slate-600/60 to-slate-700/60"
              : "bg-gradient-to-r from-slate-100/80 via-slate-50/80 to-slate-100/80"
          )}
        />

        {/* Active state glow */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-violet-400/10 animate-pulse rounded-xl" />
        )}

        <Icon className="h-5 w-5 mr-3 flex-shrink-0 relative z-10" />
        <span className="truncate relative z-10 font-medium">{label}</span>
        
        {comingSoon && (
          <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full flex-shrink-0 relative z-10 border border-yellow-500/30">
            {MESSAGE_CONSTANTS.SOON_LABEL}
          </span>
        )}
      </Link>
    );
  }
);
NavItem.displayName = "NavItem";

const NavSection: React.FC<NavSectionProps> = React.memo(
  ({
    title,
    children,
    isCollapsed,
    defaultOpen = true,
    icon: Icon,
    sectionId,
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { effectiveTheme } = useTheme();
    const themeClasses = getThemeClasses(effectiveTheme);
    const handleToggle = () => setIsOpen((open) => !open);

    if (isCollapsed) {
      return (
        <div className="space-y-2">
          {Icon && (
            <div
              className={`flex items-center justify-center p-2 ${themeClasses.TEXT_MUTED} opacity-60`}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
          {children}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <button
          onClick={handleToggle}
          className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold ${themeClasses.TEXT_MUTED} uppercase tracking-wider hover:${themeClasses.TEXT_TERTIARY} transition-all duration-200 group`}
          aria-controls={sectionId}
          aria-expanded={isOpen}
        >
          <div className="flex items-center">
            {Icon && (
              <Icon className={`h-4 w-4 mr-2 transition-colors duration-200 group-hover:text-indigo-400 ${isOpen ? 'text-indigo-400' : ''}`} />
            )}
            <span className={cn(
              "transition-colors duration-200",
              isOpen ? "text-indigo-400" : ""
            )}>
              {title}
            </span>
          </div>
          <div className={cn(
            "transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}>
            <ChevronDown className="h-3 w-3" />
          </div>
        </button>
        <div
          className={cn(
            "space-y-1 transition-all duration-300 overflow-hidden",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
NavSection.displayName = "NavSection";

const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen = false,
  setIsMobileOpen,
}) => {
  const { effectiveTheme } = useTheme();
  const themeClasses = getThemeClasses(effectiveTheme);
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    "sidebar-collapsed",
    false
  );
  
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed
        ? THEME_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH_CSS_PX
        : THEME_CONSTANTS.SIDEBAR_EXPANDED_WIDTH_PX
    );
  }, [isCollapsed]);
  
  const toggleSidebar = () => setIsCollapsed((v: boolean) => !v);
  const navSections = SIDEBAR_SECTIONS_CONFIG;

  return (
    <>
      {/* Enhanced overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      
      {/*
        Sidebar structure:
        <nav class="flex flex-col h-screen">
          ...header...
          <ul class="flex-1 min-h-0 overflow-y-auto">...</ul>
          <SidebarFooter />
        </nav>
      */}
      <nav
        className={cn(
          "flex flex-col h-screen transition-all duration-300 flex-shrink-0 relative fixed left-0 top-0 z-50",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "block" : "hidden md:block",
          // Enhanced background with gradient
          effectiveTheme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50"
            : "bg-gradient-to-b from-white via-slate-50 to-white border-r border-slate-200/50"
        )}
        role="navigation"
        aria-label="Main sidebar navigation"
        style={{ maxWidth: 320 }}
      >
        {/* Enhanced decorative gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            effectiveTheme === "dark"
              ? "bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5"
              : "bg-gradient-to-br from-indigo-500/3 via-transparent to-purple-500/3"
          )}
        />
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 md:hidden bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg touch-target hover:shadow-xl transition-all duration-200"
          style={{ minWidth: 44, minHeight: 44, padding: 12 }}
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          aria-label="Close menu"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {/* Header Section */}
        <div
          className={cn(
            "flex items-center justify-between relative z-10",
            effectiveTheme === "dark" 
              ? "border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
              : "border-b border-slate-200/50 bg-white/50 backdrop-blur-sm"
          )}
          style={{ padding: `${SPACING_SCALE.md} ${SPACING_SCALE.md}` }}
        >
          {isCollapsed ? (
            <Logo size="md" showText={false} />
          ) : (
            <Logo size="md" />
          )}
          <button
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            className={cn(
              "ml-2 p-2 rounded-lg transition-all duration-200 hover:shadow-md",
              effectiveTheme === "dark"
                ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
                : "bg-slate-100/50 hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
            )}
            style={{ marginLeft: SPACING_SCALE.xs }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* Navigation - scrollable area */}
        <ul className="flex-1 min-h-0 px-4 py-6 space-y-6 overflow-y-auto relative z-10 sidebar-list">
          {navSections.map((section, sectionIdx) => {
            const sectionId = `sidebar-section-${sectionIdx}`;
            return (
              <li key={section.title}>
                <NavSection
                  title={section.title}
                  icon={section.icon}
                  isCollapsed={isCollapsed}
                  defaultOpen={true}
                  sectionId={sectionId}
                >
                  <ul className="sidebar-nested-list space-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <NavItem {...item} isCollapsed={isCollapsed} />
                      </li>
                    ))}
                  </ul>
                </NavSection>
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
