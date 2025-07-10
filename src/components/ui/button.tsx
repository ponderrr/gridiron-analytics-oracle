import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-border-accent)] text-white hover:opacity-90 shadow-[var(--shadow-sm)]",
        secondary:
          "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover-bg)] border border-[var(--color-border-primary)]",
        outline:
          "border border-[var(--color-border-primary)] bg-transparent hover:bg-[var(--color-hover-bg)] text-[var(--color-text-primary)]",
        ghost:
          "hover:bg-[var(--color-hover-bg)] text-[var(--color-text-primary)]",
        success:
          "bg-[var(--color-semantic-success)] text-white hover:opacity-90",
        warning:
          "bg-[var(--color-semantic-warning)] text-white hover:opacity-90",
        danger: "bg-[var(--color-semantic-error)] text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      loading = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
