import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  TrendingUp,
  ArrowLeftRight,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calculator,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Target,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MESSAGE_CONSTANTS, getThemeClasses } from "@/lib/constants";
import useLocalStorage from "@/hooks/useLocalStorage";
import { THEME_CONSTANTS } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/ui/Logo";

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
            "flex items-center justify-center p-3 rounded-xl transition-all duration-200 group relative",
            isActive
              ? `${themeClasses.BG_ACTIVE} ${themeClasses.TEXT_PRIMARY} ${themeClasses.SHADOW}`
              : `${themeClasses.TEXT_TERTIARY} ${themeClasses.BG_HOVER} hover:${themeClasses.TEXT_PRIMARY}`
          )}
          title={label}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
          tabIndex={0}
        >
          <Icon className="h-5 w-5" />
          {comingSoon && (
            <div
              className={`absolute -top-1 -right-1 w-2 h-2 ${THEME_CONSTANTS.THEME.COMMON.BG_ACCENT_WARNING} rounded-full`}
            ></div>
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
            ? `${themeClasses.BG_ACTIVE} ${themeClasses.TEXT_PRIMARY} ${themeClasses.SHADOW}`
            : `${themeClasses.TEXT_TERTIARY} ${themeClasses.BG_HOVER} hover:${themeClasses.TEXT_PRIMARY}`
        )}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        tabIndex={0}
      >
        {/* Hover gradient effect */}
        <div
          className={`absolute inset-0 ${themeClasses.BG_HOVER} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        <Icon className="h-5 w-5 mr-3 flex-shrink-0 relative z-10" />
        <span className="truncate relative z-10">{label}</span>
        {comingSoon && (
          <span
            className={`ml-auto text-xs ${THEME_CONSTANTS.THEME.COMMON.BG_ACCENT_WARNING} ${THEME_CONSTANTS.THEME.COMMON.ACCENT_WARNING} px-2 py-1 rounded-full flex-shrink-0 relative z-10`}
          >
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
              className={`flex items-center justify-center p-2 ${themeClasses.TEXT_MUTED}`}
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
          className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold ${themeClasses.TEXT_MUTED} uppercase tracking-wider hover:${themeClasses.TEXT_TERTIARY} transition-colors`}
          aria-controls={sectionId}
          aria-expanded={isOpen}
        >
          <div className="flex items-center">
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {title}
          </div>
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
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
    icon: Home,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.DASHBOARD,
        icon: Home,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.DASHBOARD,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.ANALYSIS,
    icon: BarChart3,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.PLAYERS,
        icon: Users,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.PLAYERS,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.ANALYTICS,
        icon: TrendingUp,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.ANALYTICS,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.TRADE_ANALYZER,
        icon: ArrowLeftRight,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.TRADE_ANALYZER,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.MANAGEMENT,
    icon: Target,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.ADMIN,
        icon: Shield,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.ADMIN_PANEL,
      },
    ],
  },
  {
    title: MESSAGE_CONSTANTS.NAV_SECTIONS.TOOLS,
    icon: Wrench,
    items: [
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.FANTASY_POINTS_TEST,
        icon: Calculator,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.POINTS_CALCULATOR,
      },
      {
        href: MESSAGE_CONSTANTS.NAV_PATHS.SETTINGS,
        icon: Settings,
        label: MESSAGE_CONSTANTS.NAV_ITEMS.SETTINGS,
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
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
  const navSections = NAV_SECTIONS_CONFIG;

  return (
    <nav
      className={cn(
        `${themeClasses.BG_SIDEBAR} border-r ${themeClasses.BORDER} transition-all duration-300 flex flex-col h-screen flex-shrink-0 relative fixed left-0 top-0 z-30`,
        isCollapsed ? "w-20" : "w-72"
      )}
      role="navigation"
      aria-label="Main sidebar navigation"
    >
      {/* Decorative gradient overlay */}
      <div
        className={`absolute inset-0 ${effectiveTheme === "dark" ? "bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" : "bg-gradient-to-br from-emerald-500/2 via-transparent to-blue-500/2"} pointer-events-none`}
      />
      {/* Header Section */}
      <div
        className={`flex items-center justify-between px-4 py-4 border-b ${themeClasses.BORDER} relative z-10`}
      >
        {!isCollapsed && <Logo size="md" />}
        <button
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className={`p-2 rounded-lg ${themeClasses.BG_HOVER} transition-all duration-200 ${themeClasses.TEXT_TERTIARY} hover:${themeClasses.TEXT_PRIMARY} flex-shrink-0 focus:ring-2 focus:ring-emerald-400 focus:outline-none`}
          tabIndex={0}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
      {/* Navigation */}
      <ul className="flex-1 px-4 py-6 space-y-6 overflow-y-auto relative z-10 sidebar-list">
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
                <ul className="sidebar-nested-list">
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
      {/* Footer Section */}
      <div
        className={`px-4 py-4 border-t ${themeClasses.BORDER} relative z-10`}
      >
        <div className="text-center">
          <p className={`text-xs ${themeClasses.TEXT_MUTED}`}>
            &copy; {new Date().getFullYear()} {MESSAGE_CONSTANTS.APP_NAME}
          </p>
        </div>
      </div>
    </nav>
  );
};

AppSidebar.displayName = "AppSidebar";

export default AppSidebar;
