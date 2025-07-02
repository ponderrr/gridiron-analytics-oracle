import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  TrendingUp,
  ArrowLeftRight,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calculator,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  THEME_CONSTANTS,
  UI_CONSTANTS,
  MESSAGE_CONSTANTS,
} from "@/lib/constants";

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
}

// Icon constants
const ICONS = {
  home: Home,
  users: Users,
  trendingUp: TrendingUp,
  arrowLeftRight: ArrowLeftRight,
  trophy: Trophy,
  settings: Settings,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  shield: Shield,
  calculator: Calculator,
  barChart3: BarChart3,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  zap: Zap,
  target: Target,
  wrench: Wrench,
};

// Custom hook for sidebar width CSS property
function useSidebarWidth(isCollapsed: boolean) {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed
        ? THEME_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH_CSS_PX
        : THEME_CONSTANTS.SIDEBAR_EXPANDED_WIDTH_PX
    );
  }, [isCollapsed]);
}

const NavItem: React.FC<NavItemProps> = React.memo(
  ({ href, icon: Icon, label, comingSoon, isCollapsed }) => {
    const { pathname } = useLocation();
    const isActive = pathname === href;

    if (isCollapsed) {
      return (
        <Link
          to={href}
          className={cn(
            "flex items-center justify-center p-3 rounded-xl transition-all duration-200 group relative",
            isActive
              ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25"
              : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
          )}
          title={label}
        >
          <Icon className="h-5 w-5" />
          {comingSoon && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
          )}
        </Link>
      );
    }

    return (
      <Link
        to={href}
        className={cn(
          "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25"
            : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
        )}
      >
        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <Icon className="h-5 w-5 mr-3 flex-shrink-0 relative z-10" />
        <span className="truncate relative z-10">{label}</span>
        {comingSoon && (
          <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full flex-shrink-0 relative z-10">
            {MESSAGE_CONSTANTS.SOON_LABEL}
          </span>
        )}
      </Link>
    );
  }
);
NavItem.displayName = "NavItem";

const NavSection: React.FC<NavSectionProps> = React.memo(
  ({ title, children, isCollapsed, defaultOpen = true, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const handleToggle = useCallback(() => setIsOpen((open) => !open), []);

    if (isCollapsed) {
      return (
        <div className="space-y-2">
          {Icon && (
            <div className="flex items-center justify-center p-2 text-slate-500">
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
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
        >
          <div className="flex items-center">
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {title}
          </div>
          {isOpen ? (
            <ICONS.chevronUp className="h-3 w-3" />
          ) : (
            <ICONS.chevronDown className="h-3 w-3" />
          )}
        </button>
        <div
          className={cn(
            "space-y-1 transition-all duration-200 overflow-hidden",
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

const NAV_SECTIONS_CONFIG = [
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.MAIN,
    icon: ICONS.home,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.DASHBOARD,
        icon: ICONS.home,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.DASHBOARD,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.ANALYSIS,
    icon: ICONS.barChart3,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.PLAYERS,
        icon: ICONS.users,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.PLAYERS,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.ANALYTICS,
        icon: ICONS.trendingUp,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.ANALYTICS,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.TRADE_ANALYZER,
        icon: ICONS.arrowLeftRight,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.TRADE_ANALYZER,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.MANAGEMENT,
    icon: ICONS.target,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.LEAGUE,
        icon: ICONS.trophy,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.LEAGUE,
        comingSoon: true,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.ADMIN,
        icon: ICONS.shield,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.ADMIN_PANEL,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.TOOLS,
    icon: ICONS.wrench,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.FANTASY_POINTS_TEST,
        icon: ICONS.calculator,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.POINTS_CALCULATOR,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.SETTINGS,
        icon: ICONS.settings,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.SETTINGS,
      },
    ],
  },
];

const AppSidebar: React.FC = React.memo(
  () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    useSidebarWidth(isCollapsed);
    const toggleSidebar = useCallback(() => setIsCollapsed((v) => !v), []);
    const navSections = NAV_SECTIONS_CONFIG;

    return (
      <div
        className={cn(
          "bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 flex flex-col h-screen flex-shrink-0 relative fixed left-0 top-0 z-30",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        {/* Header Section */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50 relative z-10">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div>
                <span className="text-xl font-black text-white">FF META</span>
                <div className="text-xs text-emerald-400 font-medium">
                  {MESSAGE_CONSTANTS.DOMINATE_LEAGUE}
                </div>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link
              to="/dashboard"
              className="flex justify-center w-full group"
            ></Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 text-slate-400 hover:text-white flex-shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ICONS.chevronRight className="h-5 w-5" />
            ) : (
              <ICONS.chevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto relative z-10">
          {navSections.map((section) => (
            <NavSection
              key={section.title}
              title={section.title}
              icon={section.icon}
              isCollapsed={isCollapsed}
            >
              {section.items.map((item) => (
                <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
              ))}
            </NavSection>
          ))}
        </nav>
        {/* Footer Section */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-slate-700/50 relative z-10">
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-2">
                <ICONS.zap className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  {MESSAGE_CONSTANTS.PRO_TIER_TITLE}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {MESSAGE_CONSTANTS.PRO_TIER_DESCRIPTION}
              </p>
              <button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200">
                {MESSAGE_CONSTANTS.UPGRADE_NOW_LABEL}
              </button>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} {MESSAGE_CONSTANTS.APP_NAME}
              </p>
            </div>
          </div>
        )}
        {/* Collapsed footer */}
        {isCollapsed && (
          <div className="px-2 py-4 border-t border-slate-700/50 relative z-10">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-2 rounded-lg">
                <ICONS.zap className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Since AppSidebar has no props, it should never re-render unless internal state changes
    return true;
  }
);

AppSidebar.displayName = "AppSidebar";

export default AppSidebar;
