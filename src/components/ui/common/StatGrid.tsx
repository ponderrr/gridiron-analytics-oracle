import React, { useCallback } from "react";
import { motion } from "framer-motion";
import StatCard from "../cards/StatCard";
import { LucideIcon } from "lucide-react";

export interface StatData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "premium" | "elite" | "champion";
}

export interface StatGridProps {
  stats: StatData[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  animate?: boolean;
}

const StatGrid: React.FC<StatGridProps> = ({
  stats,
  columns = 4,
  className = "",
  animate = true,
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const content = (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>{content}</motion.div>
      </motion.div>
    );
  }

  return content;
};

export default React.memo(StatGrid);
