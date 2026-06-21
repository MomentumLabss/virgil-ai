"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "accent" | "white";
  className?: string;
}

const sizes = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-[2.5px]",
  lg: "w-8 h-8 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  color = "accent",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-transparent animate-spin",
        sizes[size],
        color === "accent"
          ? "border-t-[var(--virgil-accent)] border-r-[var(--virgil-accent)]"
          : "border-t-white border-r-white",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
