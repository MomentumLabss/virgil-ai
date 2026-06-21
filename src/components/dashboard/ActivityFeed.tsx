"use client";

import { AgentRecord } from "@/types";
import { RecordCard } from "./RecordCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

interface ActivityFeedProps {
  records: AgentRecord[];
  isLoading: boolean;
  isAgentRunning: boolean;
}

export function ActivityFeed({ records, isLoading, isAgentRunning }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[var(--virgil-text)]">
            Agent Activity
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`relative flex h-2.5 w-2.5 ${
                isAgentRunning ? "" : "opacity-40"
              }`}
            >
              {isAgentRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--virgil-success)] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isAgentRunning
                    ? "bg-[var(--virgil-success)]"
                    : "bg-[var(--virgil-text-muted)]"
                }`}
              />
            </span>
            <span className="text-xs text-[var(--virgil-text-muted)]">
              {isAgentRunning ? "Live" : "Idle"}
            </span>
          </div>
        </div>
        <span className="text-xs text-[var(--virgil-text-muted)]">
          {records.length} records
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} height={64} />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-white/40 rounded-card border border-dashed border-[var(--virgil-border-soft)]">
          <p className="text-sm text-[var(--virgil-text-muted)]">
            Your agent has not logged any activity yet.
          </p>
          <p className="text-xs text-[var(--virgil-text-muted)] mt-1">
            Activate an instruction to begin monitoring.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
