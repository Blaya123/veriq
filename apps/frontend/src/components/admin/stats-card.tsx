import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({
  label,
  value,
  change,
  trend,
  icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-900 p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800">
            {icon}
          </div>
        )}
        {change && trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              trend === "up" && "bg-success-500/10 text-success-400",
              trend === "down" && "bg-error-500/10 text-error-400",
              trend === "neutral" && "bg-neutral-800 text-neutral-400"
            )}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
