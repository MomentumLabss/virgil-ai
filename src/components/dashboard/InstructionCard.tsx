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
          instruction,
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Evaluation failed");
      }

      const data = await res.json() as { record?: any };
      
      if (data.record && instruction.walletAddress) {
        const localKey = `virgil_records_${instruction.walletAddress}`;
        const existing = localStorage.getItem(localKey);
        const records = existing ? JSON.parse(existing) : [];
        localStorage.setItem(localKey, JSON.stringify([data.record, ...records]));
      }

      showToast("Agent checked the condition!", "success");
      onUpdate();
    } catch {
      showToast("Check failed. Agent will retry automatically.", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTogglePause = () => {
    if (!instruction.walletAddress) return;
    const localKey = `virgil_instructions_${instruction.walletAddress}`;
    const existing = localStorage.getItem(localKey);
    if (existing) {
      let instructions: Instruction[] = JSON.parse(existing);
      instructions = instructions.map(i => {
        if (i.id === instruction.id) {
          return { ...i, status: instruction.status === "paused" ? "active" : "paused" };
        }
        return i;
      });
      localStorage.setItem(localKey, JSON.stringify(instructions));
      onUpdate();
      showToast(`Instruction ${instruction.status === "paused" ? "resumed" : "paused"}`, "success");
    }
  };

  const handleDelete = () => {
    if (!instruction.walletAddress) return;
    const localKey = `virgil_instructions_${instruction.walletAddress}`;
    const existing = localStorage.getItem(localKey);
    if (existing) {
      let instructions: Instruction[] = JSON.parse(existing);
      instructions = instructions.filter(i => i.id !== instruction.id);
      localStorage.setItem(localKey, JSON.stringify(instructions));
      onUpdate();
      showToast("Instruction deleted", "success");
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
      className="bg-white shadow-sm rounded-card border border-[var(--virgil-border-soft)] p-5 hover:shadow-glow transition-shadow"
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
            onClick={handleTogglePause}
            className="p-1.5 rounded-button hover:bg-[var(--virgil-glow)] text-gray-500 transition-colors"
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
            onClick={handleDelete}
            className="p-1.5 rounded-button hover:bg-red-50 text-gray-500 hover:text-[var(--virgil-danger)] transition-colors"
            title="Delete"
            aria-label="Delete instruction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-900 mb-3 leading-relaxed">
        {instruction.parsed.raw}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Target</span>
          <span className="font-mono">
            {instruction.parsed.target.startsWith("0x")
              ? truncateAddress(instruction.parsed.target)
              : instruction.parsed.target}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
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
