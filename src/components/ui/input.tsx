import * as React from "react";

import { cn } from "@/lib/utils";
import "./input.css"; // Import the CSS for form input styling

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { error?: string; success?: boolean }
>(({ className, type, error, success, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        error && "form-input-error",
        success && "form-input-success",
        className, // Move this before the defaults so it can override
        "form-input flex h-12 min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm touch-target"
      )}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.id || props.name}-error` : undefined}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
