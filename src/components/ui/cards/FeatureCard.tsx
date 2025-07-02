import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: "default" | "premium" | "elite" | "champion";
  comingSoon?: boolean;
  onClick?: () => void;
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

const FeatureCard: React.FC<FeatureCardProps> = React.memo(
  ({
    title,
    description,
    icon: Icon,
    variant = "default",
    comingSoon,
    onClick,
    className,
  }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "rounded-2xl border backdrop-blur-sm transition-all duration-300",
          cardVariants[variant],
          onClick && "cursor-pointer",
          className
        )}
        role={onClick ? "button" : "region"}
        aria-label={
          onClick
            ? `Feature card: ${title}. ${
                comingSoon ? "Coming soon." : description
              }`
            : `Feature card: ${title}`
        }
        tabIndex={0}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        <div className="p-8 text-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative z-10">
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
            <h3 className="text-xl font-black text-white mb-4">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {description}
            </p>
            {comingSoon && (
              <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">
                🚀 COMING SOON
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

export default FeatureCard;
