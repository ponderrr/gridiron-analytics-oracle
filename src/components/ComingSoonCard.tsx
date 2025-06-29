import React from "react";

interface ComingSoonCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  icon,
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center ${className}`}
    >
      <div className="mb-4 flex justify-center">{icon}</div>
      <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
      <p className="text-slate-400 max-w-md mx-auto">{description}</p>
    </div>
  );
};

export default ComingSoonCard;
