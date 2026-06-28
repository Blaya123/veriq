import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
  secondary:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300",
  outline:
    "border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300",
  success:
    "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300",
  warning:
    "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300",
  error:
    "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-sm",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
