import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullPage?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  fullPage = false,
  message,
}) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-2 border-slate-600 border-t-emerald-500 ${sizeClasses[size]}`}
    />
  );

  if (fullPage) {
    return (
      <div
        className="min-h-screen bg-slate-900 flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className={`flex flex-col items-center ${className}`}>
          {spinner}
          {message && <p className="text-slate-400 mt-4">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {spinner}
    </div>
  );
};

function areEqual(
  prevProps: LoadingSpinnerProps,
  nextProps: LoadingSpinnerProps
) {
  return (
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className &&
    prevProps.fullPage === nextProps.fullPage &&
    prevProps.message === nextProps.message
  );
}

export default React.memo(LoadingSpinner, areEqual);
