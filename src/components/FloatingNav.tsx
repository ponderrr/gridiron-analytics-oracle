import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { SIDEBAR_SECTIONS_CONFIG } from "@/components/layout/SidebarLinks";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";

const FloatingNav: React.FC = () => {
  const { pathname } = useLocation();
  const { effectiveTheme } = useTheme();
  const allNavItems = useMemo(
    () => SIDEBAR_SECTIONS_CONFIG.flatMap((section) => section.items),
    []
  );

  const themeClasses = useMemo(
    () => ({
      navBg:
        effectiveTheme === "dark"
          ? "bg-[var(--color-bg-primary)]"
          : "bg-gray-50",
      navText: effectiveTheme === "dark" ? "text-zinc-200" : "text-gray-700",
      navActiveBg:
        effectiveTheme === "dark"
          ? "bg-transparent outline outline-2 outline-white outline-offset-0"
          : "bg-transparent outline outline-2 outline-black outline-offset-0",
      navActiveText: effectiveTheme === "dark" ? "text-white" : "text-gray-900",
      navInactiveText:
        effectiveTheme === "dark" ? "text-zinc-400" : "text-gray-600",
      navInactiveHover:
        effectiveTheme === "dark"
          ? "hover:bg-zinc-800 hover:text-white"
          : "hover:bg-white hover:text-gray-900",
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

  return (
    <nav className="fixed top-6 left-6 z-40 flex flex-col gap-4">
      {/* Logo at the top */}
      <div className="mb-4">
        <Logo size="sm" className="drop-shadow-lg" />
      </div>

      {allNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-5 py-3 rounded-full shadow-lg font-medium",
              "transition-transform duration-200 hover:scale-105 active:scale-95",
              themeClasses.navBg,
              themeClasses.navText,
              isActive
                ? `${themeClasses.navActiveBg} ${themeClasses.navActiveText}`
                : `${themeClasses.navInactiveText} ${themeClasses.navInactiveHover}`
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            tabIndex={0}
            style={{ minWidth: 0 }}
          >
            <item.icon
              className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? themeClasses.iconActive : themeClasses.iconInactive
              )}
            />
            <span
              className={cn(
                "truncate",
                isActive
                  ? themeClasses.navActiveText
                  : themeClasses.navInactiveText
              )}
            >
              {item.label}
            </span>
            {item.comingSoon && (
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
        );
      })}
    </nav>
  );
};

export default React.memo(FloatingNav);
