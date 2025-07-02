import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "premium" | "elite" | "champion";
  className?: string;
}

const cardVariants = {
  default: "bg-slate-800/50 border-slate-700/50",
  premium:
    "bg-gradient-to-br from-blue-900/30 to-slate-800/50 border-blue-500/30",
  elite:
    "bg-gradient-to-br from-purple-900/30 to-slate-800/50 border-purple-500/30",
  champion:
    "bg-gradient-to-br from-yellow-900/30 to-slate-800/50 border-yellow-500/30",
};

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
  }) => {
    const getTrendColor = (trend?: "up" | "down" | "neutral") => {
      switch (trend) {
        case "up":
          return "text-emerald-400";
        case "down":
          return "text-red-400";
        default:
          return "text-slate-400";
      }
    };
    const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
      switch (trend) {
        case "up":
          return "\u2197";
        case "down":
          return "\u2198";
        default:
          return "\u2192";
      }
    };
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "rounded-2xl border backdrop-blur-sm transition-all duration-300",
          cardVariants[variant],
          className
        )}
        role="region"
        aria-label={`Stat card: ${title}, value: ${value}`}
        tabIndex={0}
      >
        <div className="p-6 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-black text-white">{value}</p>
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
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "p-3 rounded-xl",
                variant === "premium" && "bg-blue-500/20",
                variant === "elite" && "bg-purple-500/20",
                variant === "champion" && "bg-yellow-500/20",
                variant === "default" && "bg-emerald-500/20"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  variant === "premium" && "text-blue-400",
                  variant === "elite" && "text-purple-400",
                  variant === "champion" && "text-yellow-400",
                  variant === "default" && "text-emerald-400"
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
