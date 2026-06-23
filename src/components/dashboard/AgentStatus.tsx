"use client";

import { Activity, Clock, ListChecks, Database } from "lucide-react";
import Link from "next/link";

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
          color: isRunning ? "text-[var(--virgil-success)]" : "text-gray-500",
        },
        {
          icon: Clock,
          label: "Last Poll",
          value: lastPollText,
          color: "text-gray-900",
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
          color: "text-gray-900",
        },
      ].map((item) => {
        const isClickable = item.label === "Total Records";
        
        const CardContent = (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
              {isClickable && (
                <span className="text-[10px] text-[var(--virgil-accent)] underline">View all</span>
              )}
            </div>
            <span className={`text-lg font-semibold ${item.color}`}>
              {item.value}
            </span>
          </>
        );

        return isClickable ? (
          <Link
            href="/records"
            key={item.label}
            className="bg-white shadow-sm rounded-card border border-[var(--virgil-border-soft)] p-4 hover:shadow-glow transition-shadow block"
          >
            {CardContent}
          </Link>
        ) : (
          <div
            key={item.label}
            className="bg-white shadow-sm rounded-card border border-[var(--virgil-border-soft)] p-4"
          >
            {CardContent}
          </div>
        );
      })}
    </div>
  );
}
