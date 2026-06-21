"use client";

import { Instruction } from "@/types";
import { InstructionCard } from "./InstructionCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

interface InstructionListProps {
  instructions: Instruction[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function InstructionList({
  instructions,
  isLoading,
  onUpdate,
}: InstructionListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--virgil-text)]">
          Your Instructions
        </h2>
        <span className="text-xs text-[var(--virgil-text-muted)]">
          {instructions.length} active
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} height={80} />
          ))}
        </div>
      ) : instructions.length === 0 ? (
        <div className="text-center py-12 bg-white/40 rounded-card border border-dashed border-[var(--virgil-border-soft)]">
          <p className="text-sm text-[var(--virgil-text-muted)]">
            No active instructions.
          </p>
          <p className="text-xs text-[var(--virgil-text-muted)] mt-1">
            Tell Virgil what to watch using the input above.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {instructions.map((instruction) => (
            <InstructionCard
              key={instruction.id}
              instruction={instruction}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
