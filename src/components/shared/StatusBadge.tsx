"use client";

import { cn } from "@/lib/utils";

type StatusVariant = "monitoring" | "triggered" | "paused" | "error" | "checked";

interface StatusBadgeProps {
  variant: StatusVariant;
  className?: string;
}

const config: Record<StatusVariant, { bg: string; dot?: string; label: string }> = {
  monitoring: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500 animate-pulse-dot",
    label: "Monitoring",
  },
  triggered: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Triggered",
  },
  paused: {
    bg: "bg-slate-100 text-slate-600 border-slate-200",
    label: "Paused",
  },
  error: {
    bg: "bg-red-50 text-red-700 border-red-200",
    label: "Error",
  },
  checked: {
    bg: "bg-slate-100 text-slate-600 border-slate-200",
    label: "Checked",
  },
};

export function StatusBadge({ variant, className }: StatusBadgeProps) {
  const c = config[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge text-xs font-medium border",
        c.bg,
        className
      )}
    >
      {c.dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", c.dot)}
          aria-hidden="true"
        />
      )}
      {c.label}
    </span>
  );
}
