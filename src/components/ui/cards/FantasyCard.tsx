import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CARD_TYPES,
  ICON_SIZES,
  PADDING,
  GAP,
  TEXT_SIZES,
  WIDTH,
} from "@/lib/constants";

export type StatCardData = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "premium" | "elite" | "champion";
};

export type PlayerCardData = {
  name: string;
  position: string;
  team: string;
  projection?: number;
  points?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  tier?: string;
  image?: string;
  status?: "active" | "injured" | "bye" | "questionable";
};

export type FeatureCardData = {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: "default" | "premium" | "elite" | "champion";
  comingSoon?: boolean;
};

export type FantasyCardData =
  | StatCardData
  | PlayerCardData
  | FeatureCardData
  | Record<string, any>;

export interface FantasyCardProps {
  cardType: string;
  cardData: FantasyCardData;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
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

const glowVariants = {
  default: "shadow-lg shadow-slate-900/50",
  premium: "shadow-xl shadow-blue-500/20",
  elite: "shadow-xl shadow-purple-500/20",
  champion: "shadow-xl shadow-yellow-500/20",
};

export const FantasyCard: React.FC<FantasyCardProps> = ({
  cardType,
  cardData,
  className,
  hover = true,
  glow = false,
  onClick,
}) => {
  // Helper functions
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
        return "↗";
      case "down":
        return "↘";
      default:
        return "→";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "injured":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "questionable":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "bye":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  const getTierVariant = (
    tier?: string
  ): "default" | "premium" | "elite" | "champion" => {
    if (tier?.toLowerCase().includes("elite")) return "elite";
    if (
      tier?.toLowerCase().includes("wr1") ||
      tier?.toLowerCase().includes("rb1") ||
      tier?.toLowerCase().includes("qb1")
    )
      return "premium";
    if (tier?.toLowerCase().includes("champion")) return "champion";
    return "default";
  };

  // Card rendering logic
  let content: React.ReactNode = null;
  let variant: "default" | "premium" | "elite" | "champion" = "default";

  if (cardType === "stat") {
    const data = cardData as StatCardData;
    variant = data.variant || "default";
    const Icon = data.icon;
    content = (
      <div className="p-6 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">
            {data.title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-black text-white">{data.value}</p>
            {data.trendValue && (
              <span
                className={cn(
                  "text-sm font-bold flex items-center",
                  getTrendColor(data.trend)
                )}
              >
                {getTrendIcon(data.trend)} {data.trendValue}
              </span>
            )}
          </div>
          {data.subtitle && (
            <p className="text-xs text-slate-500 mt-1">{data.subtitle}</p>
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
    );
  } else if (cardType === "player") {
    const data = cardData as PlayerCardData;
    variant = getTierVariant(data.tier);
    content = (
      <div className="p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative z-10">
          {/* Player Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">{data.name}</h3>
              {data.tier && (
                <span
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    getTierVariant(data.tier) === "elite" &&
                      "bg-purple-500/20 text-purple-400",
                    getTierVariant(data.tier) === "premium" &&
                      "bg-blue-500/20 text-blue-400",
                    getTierVariant(data.tier) === "champion" &&
                      "bg-yellow-500/20 text-yellow-400",
                    getTierVariant(data.tier) === "default" &&
                      "bg-emerald-500/20 text-emerald-400"
                  )}
                >
                  {data.tier}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-700 text-white px-2 py-1 rounded text-sm font-medium">
                  {data.position}
                </span>
                <span className="text-slate-400 font-medium">{data.team}</span>
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  getStatusColor(data.status)
                )}
              >
                {(data.status || "active").toUpperCase()}
              </span>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {data.projection && (
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {data.projection}
                </div>
                <div className="text-xs text-slate-400">PROJECTED</div>
              </div>
            )}
            {data.points && (
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {data.points}
                </div>
                <div className="text-xs text-slate-400">LAST WEEK</div>
              </div>
            )}
          </div>
          {/* Trend */}
          {data.trend && data.trendValue && (
            <div className="mt-4 flex items-center justify-center">
              <span
                className={cn(
                  "text-sm font-medium flex items-center px-3 py-1 rounded-lg",
                  data.trend === "up" && "text-emerald-400 bg-emerald-500/20",
                  data.trend === "down" && "text-red-400 bg-red-500/20",
                  data.trend === "neutral" && "text-slate-400 bg-slate-500/20"
                )}
              >
                {data.trendValue} vs Avg
              </span>
            </div>
          )}
        </div>
      </div>
    );
  } else if (cardType === "feature") {
    const data = cardData as FeatureCardData;
    variant = data.variant || "default";
    const Icon = data.icon;
    content = (
      <div className="p-8 text-center relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
              variant === "premium" &&
                "bg-gradient-to-r from-blue-500 to-cyan-500",
              variant === "elite" &&
                "bg-gradient-to-r from-purple-500 to-pink-500",
              variant === "champion" &&
                "bg-gradient-to-r from-yellow-500 to-orange-500",
              variant === "default" &&
                "bg-gradient-to-r from-emerald-500 to-green-500"
            )}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          {/* Content */}
          <h3 className="text-xl font-black text-white mb-4">{data.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {data.description}
          </p>
          {/* Coming Soon Badge */}
          {data.comingSoon && (
            <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">
              🚀 COMING SOON
            </div>
          )}
          {/* Hover indicator */}
          {onClick && (
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              className="absolute top-4 right-4 bg-emerald-500 w-3 h-3 rounded-full"
            />
          )}
        </div>
      </div>
    );
  }

  const cardClass = cn(
    "rounded-2xl border backdrop-blur-sm transition-all duration-300",
    cardVariants[variant],
    glow && glowVariants[variant],
    hover && "hover:scale-[1.02] hover:shadow-2xl",
    onClick && "cursor-pointer",
    className
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: hover ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cardClass}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: hover ? 1.02 : 1 }} className={cardClass}>
      {content}
    </motion.div>
  );
};
