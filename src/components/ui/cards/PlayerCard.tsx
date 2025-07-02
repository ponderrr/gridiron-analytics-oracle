import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PlayerCardProps {
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

const PlayerCard: React.FC<PlayerCardProps> = React.memo((props) => {
  const {
    name,
    position,
    team,
    projection,
    points,
    trend,
    trendValue,
    tier,
    image,
    status,
    className,
  } = props;
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
  // Tier precedence order (highest to lowest):
  // 1. "elite" (if present, always takes precedence)
  // 2. "champion"
  // 3. "wr1", "rb1", "qb1" (premium)
  // 4. default
  //
  // If multiple keywords are present in the tier string, the first match in this order is used.
  const getTierVariant = (tier?: string) => {
    if (!tier) return "default";
    const t = tier.toLowerCase();
    if (t.includes("elite")) return "elite";
    if (t.includes("champion")) return "champion";
    if (t.includes("wr1") || t.includes("rb1") || t.includes("qb1"))
      return "premium";
    return "default";
  };
  const variant = getTierVariant(tier);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-2xl border backdrop-blur-sm transition-all duration-300",
        cardVariants[variant],
        className
      )}
      role="region"
      aria-label={`Player card for ${name}, ${position} on ${team}`}
      tabIndex={0}
    >
      <div className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {tier && (
                <span
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    variant === "elite" && "bg-purple-500/20 text-purple-400",
                    variant === "premium" && "bg-blue-500/20 text-blue-400",
                    variant === "champion" &&
                      "bg-yellow-500/20 text-yellow-400",
                    variant === "default" &&
                      "bg-emerald-500/20 text-emerald-400"
                  )}
                >
                  {tier}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-700 text-white px-2 py-1 rounded text-sm font-medium">
                  {position}
                </span>
                <span className="text-slate-400 font-medium">{team}</span>
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  getStatusColor(status)
                )}
              >
                {(status || "active").toUpperCase()}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {projection && (
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {projection}
                </div>
                <div className="text-xs text-slate-400">PROJECTED</div>
              </div>
            )}
            {points && (
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {points}
                </div>
                <div className="text-xs text-slate-400">LAST WEEK</div>
              </div>
            )}
          </div>
          {trend && trendValue && (
            <div className="mt-4 flex items-center justify-center">
              <span
                className={cn(
                  "text-sm font-medium flex items-center px-3 py-1 rounded-lg",
                  trend === "up" && "text-emerald-400 bg-emerald-500/20",
                  trend === "down" && "text-red-400 bg-red-500/20",
                  trend === "neutral" && "text-slate-400 bg-slate-500/20"
                )}
              >
                {trendValue} vs Avg
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default PlayerCard;
