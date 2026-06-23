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
  // Show all records, but limit to the 50 most recent to prevent UI lag
  const displayRecords = records.slice(0, 50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
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
            <span className="text-xs text-gray-500">
              {isAgentRunning ? "Live" : "Idle"}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {displayRecords.length} records
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} height={64} />
          ))}
        </div>
      ) : displayRecords.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-sm rounded-card border border-dashed border-[var(--virgil-border-soft)]">
          <p className="text-sm text-gray-500">
            Your agent has not logged any activity yet.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Activate an instruction and wait for the agent to check it.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {displayRecords.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
