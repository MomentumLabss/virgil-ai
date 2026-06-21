"use client";

import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  height?: number;
  className?: string;
}

export function SkeletonCard({ height = 80, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-card shimmer-bg",
        className
      )}
      style={{ height }}
      role="status"
      aria-label="Loading"
    />
  );
}

interface SkeletonTextProps {
  width?: string;
  height?: number;
  className?: string;
}

export function SkeletonText({
  width = "80%",
  height = 16,
  className,
}: SkeletonTextProps) {
  return (
    <div
      className={cn("shimmer-bg rounded", className)}
      style={{ width, height }}
      role="status"
      aria-label="Loading text"
    />
  );
}

export function SkeletonCertificate() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <SkeletonText width="60%" height={32} />
      <SkeletonText width="40%" height={16} />
      <div className="space-y-4 pt-8">
        <SkeletonCard height={120} />
        <SkeletonCard height={200} />
        <SkeletonCard height={80} />
      </div>
    </div>
  );
}
