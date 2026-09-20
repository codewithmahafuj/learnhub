import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  gradientClassName?: string;
  href?: string;
  actionLabel?: string;
  variant?: "default" | "compact" | "gradient";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  gradientClassName = "from-emerald-500 to-teal-600",
  href,
  actionLabel,
  variant = "default",
  className,
}: StatCardProps) {
  // Gradient Variant (Watermark Image Style)
  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-r p-6 text-white shadow-md",
          gradientClassName,
          className
        )}
      >
        <div className="relative z-10 space-y-1">
          <h3 className="text-3xl font-extrabold tracking-tight">{value}</h3>
          <p className="text-xs font-bold tracking-wider opacity-90 uppercase">
            {title}
          </p>
          {description && (
            <p className="text-[11px] opacity-80">{description}</p>
          )}
        </div>
        {/* Watermark Big Icon */}
        <Icon className="absolute -bottom-4 -right-4 h-28 w-28 text-white/20 pointer-events-none" />
      </div>
    );
  }

  // Compact Variant
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 text-card-foreground shadow-sm",
          className
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
            iconClassName
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          {description && (
            <p className="text-[10px] text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  }

  // Default Variant
  return (
    <div
      className={cn(
        "p-6 bg-background border border-border/60 rounded-xl space-y-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <Icon className={cn("h-4 w-4 text-primary", iconClassName)} />
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {href && actionLabel && (
        <div className="pt-2">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            {actionLabel} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
