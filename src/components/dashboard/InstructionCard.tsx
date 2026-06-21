"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Trash2, Zap } from "lucide-react";
import { Instruction } from "@/types";
import { formatRelativeTime, truncateAddress } from "@/lib/utils/format";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { showToast } from "@/components/shared/Toast";

interface InstructionCardProps {
  instruction: Instruction;
  onUpdate: () => void;
}

export function InstructionCard({ instruction, onUpdate }: InstructionCardProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleCheckNow = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructionId: instruction.id,
          walletAddress: instruction.walletAddress,
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Evaluation failed");
      }

      showToast("Agent checked the condition!", "success");
      onUpdate();
    } catch {
      showToast("Check failed. Agent will retry automatically.", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const status: "monitoring" | "triggered" | "paused" | "error" =
    instruction.status === "active"
      ? "monitoring"
      : instruction.status === "triggered"
      ? "triggered"
      : instruction.status === "paused"
      ? "paused"
      : "error";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 rounded-card border border-[var(--virgil-border-soft)] p-5 hover:shadow-glow transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <StatusBadge variant={status} />
        <div className="flex items-center gap-1">
          <button
            onClick={handleCheckNow}
            disabled={isEvaluating || instruction.status !== "active"}
            className="p-1.5 rounded-button hover:bg-[var(--virgil-glow)] text-[var(--virgil-accent)] disabled:opacity-40 transition-colors"
            title="Check now"
            aria-label="Check condition now"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-button hover:bg-[var(--virgil-glow)] text-[var(--virgil-text-muted)] transition-colors"
            title={instruction.status === "paused" ? "Resume" : "Pause"}
            aria-label={instruction.status === "paused" ? "Resume monitoring" : "Pause monitoring"}
          >
            {instruction.status === "paused" ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-1.5 rounded-button hover:bg-red-50 text-[var(--virgil-text-muted)] hover:text-[var(--virgil-danger)] transition-colors"
            title="Delete"
            aria-label="Delete instruction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--virgil-text)] mb-3 leading-relaxed">
        {instruction.parsed.raw}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--virgil-text-muted)]">
          <span>Target</span>
          <span className="font-mono">
            {instruction.parsed.target.startsWith("0x")
              ? truncateAddress(instruction.parsed.target)
              : instruction.parsed.target}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--virgil-text-muted)]">
          <span>Last checked</span>
          <span>
            {instruction.lastCheckedAt
              ? formatRelativeTime(instruction.lastCheckedAt)
              : "Never"}
          </span>
        </div>
        {instruction.ogStorageKey && (
          <HashDisplay
            hash={instruction.ogStorageKey}
            label="0G Storage Key"
          />
        )}
      </div>
    </motion.div>
  );
}
