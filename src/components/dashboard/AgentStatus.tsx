"use client";

import { Activity, Clock, ListChecks, Database } from "lucide-react";

interface AgentStatusProps {
  isRunning: boolean;
  lastPollAt: number | null;
  activeInstructions: number;
  totalRecords: number;
}

export function AgentStatusPanel({
  isRunning,
  lastPollAt,
  activeInstructions,
  totalRecords,
}: AgentStatusProps) {
  const lastPollText = lastPollAt
    ? `${Math.floor((Date.now() - lastPollAt * 1000) / 1000)}s ago`
    : "Never";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        {
          icon: Activity,
          label: "Agent Status",
          value: isRunning ? "Running" : "Idle",
          color: isRunning ? "text-[var(--virgil-success)]" : "text-[var(--virgil-text-muted)]",
        },
        {
          icon: Clock,
          label: "Last Poll",
          value: lastPollText,
          color: "text-[var(--virgil-text)]",
        },
        {
          icon: ListChecks,
          label: "Active",
          value: `${activeInstructions}`,
          color: "text-[var(--virgil-accent)]",
        },
        {
          icon: Database,
          label: "Total Records",
          value: `${totalRecords}`,
          color: "text-[var(--virgil-text)]",
        },
      ].map((item) => (
        <div
          key={item.label}
          className="bg-white/60 rounded-card border border-[var(--virgil-border-soft)] p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <item.icon className="w-4 h-4 text-[var(--virgil-text-muted)]" />
            <span className="text-xs text-[var(--virgil-text-muted)]">
              {item.label}
            </span>
          </div>
          <span className={`text-lg font-semibold ${item.color}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
