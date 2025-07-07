import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LucideIcon,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucideArrowRight,
} from "lucide-react";
import { LoadingState } from "@/components/ui/common/LoadingState";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, THEME_CONSTANTS } from "@/lib/constants";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "premium" | "elite" | "champion";
  className?: string;
  loading?: boolean;
}

const cardVariants = (themeClasses: any) => ({
  default: `${themeClasses.BG_CARD} ${themeClasses.BORDER}`,
  premium: `${themeClasses.BG_ACCENT_SECONDARY} border-blue-400`,
  elite: `${themeClasses.BG_ACCENT_TERTIARY} border-purple-400`,
  champion: `${themeClasses.BG_ACCENT_WARNING} border-yellow-400`,
});

const iconBgVariants = (themeClasses: any) => ({
  default: `${themeClasses.BG_ACCENT_PRIMARY}`,
  premium: `${themeClasses.BG_ACCENT_SECONDARY}`,
  elite: `${themeClasses.BG_ACCENT_TERTIARY}`,
  champion: `${themeClasses.BG_ACCENT_WARNING}`,
});

const iconColorVariants = (themeClasses: any) => ({
  default: `${themeClasses.TEXT_ACCENT_PRIMARY}`,
  premium: `${themeClasses.TEXT_ACCENT_SECONDARY}`,
  elite: `${themeClasses.TEXT_ACCENT_TERTIARY}`,
  champion: `${themeClasses.TEXT_ACCENT_WARNING}`,
});

const StatCard: React.FC<StatCardProps> = React.memo(
  ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    variant = "default",
    className,
    loading = false,
  }) => {
    const { effectiveTheme } = useTheme();
    const themeClasses = getThemeClasses(effectiveTheme);
    if (loading) {
      return (
        <div
          className={cn(
            "rounded-2xl border p-6",
            cardVariants(themeClasses)[variant],
            className
          )}
        >
          <LoadingState
            type="skeleton"
            skeletonCount={2}
            skeletonHeight={28}
            skeletonWidth="80%"
          />
        </div>
      );
    }
    const getTrendColor = (trend?: "up" | "down" | "neutral") => {
      switch (trend) {
        case "up":
          return THEME_CONSTANTS.THEME.COMMON.ACCENT_PRIMARY;
        case "down":
          return THEME_CONSTANTS.THEME.COMMON.ACCENT_DANGER;
        default:
          return themeClasses.TEXT_MUTED;
      }
    };
    const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
      switch (trend) {
        case "up":
          return <LucideArrowUpRight className="inline h-4 w-4 mr-1" />;
        case "down":
          return <LucideArrowDownRight className="inline h-4 w-4 mr-1" />;
        default:
          return <LucideArrowRight className="inline h-4 w-4 mr-1" />;
      }
    };
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "rounded-2xl border backdrop-blur-sm transition-all duration-300",
          cardVariants(themeClasses)[variant],
          className
        )}
        role="region"
        aria-label={`Stat card: ${title}, value: ${value}`}
        tabIndex={0}
      >
        <div className="p-6 flex items-start justify-between">
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${themeClasses.TEXT_MUTED} mb-1`}
            >
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className={`text-3xl font-black ${themeClasses.TEXT_PRIMARY}`}>
                {value}
              </p>
              {trendValue && (
                <span
                  className={cn(
                    "text-sm font-bold flex items-center",
                    getTrendColor(trend)
                  )}
                >
                  {getTrendIcon(trend)} {trendValue}
                </span>
              )}
            </div>
            {subtitle && (
              <p className={`text-xs ${themeClasses.TEXT_TERTIARY} mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "p-3 rounded-xl",
                iconBgVariants(themeClasses)[variant]
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  iconColorVariants(themeClasses)[variant]
                )}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

export default StatCard;
