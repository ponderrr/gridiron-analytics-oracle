import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LeagueCardProps {
  name: string;
  type: string;
  record: string;
  standing: string;
  points: string;
  status: string;
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

const LeagueCard: React.FC<LeagueCardProps> = React.memo(
  ({
    name,
    type,
    record,
    standing,
    points,
    status,
    variant = "default",
    className,
  }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "rounded-2xl border backdrop-blur-sm transition-all duration-300",
          cardVariants[variant],
          className
        )}
        role="region"
        aria-label={`League card for ${name}, type: ${type}, record: ${record}, standing: ${standing}, points: ${points}, status: ${status}`}
        tabIndex={0}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium",
                variant === "champion" &&
                  "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                variant === "premium" &&
                  "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                variant === "elite" &&
                  "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                variant === "default" &&
                  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              )}
            >
              {status}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Type:</span>
              <span className="text-white">{type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Record:</span>
              <span className="text-white">{record}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Standing:</span>
              <span className="text-white">{standing}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Points:</span>
              <span className="text-white">{points}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

export default LeagueCard;
