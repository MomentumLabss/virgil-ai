"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AgentRecord } from "@/types";
import { formatRelativeTime } from "@/lib/utils/format";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { HashDisplay } from "@/components/shared/HashDisplay";

interface RecordCardProps {
  record: AgentRecord;
}

export function RecordCard({ record }: RecordCardProps) {
  const [expanded, setExpanded] = useState(false);

  const status: "triggered" | "checked" =
    record.outcome === "triggered" ? "triggered" : "checked";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 rounded-card border border-[var(--virgil-border-soft)] overflow-hidden hover:shadow-glow transition-shadow"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <StatusBadge variant={status} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--virgil-text)] truncate">
            {record.conditionChecked}
          </p>
          <p className="text-xs text-[var(--virgil-text-muted)] mt-1">
            {formatRelativeTime(record.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={record.verificationUrl}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[var(--virgil-accent)] hover:underline flex items-center gap-1 shrink-0"
          >
            View proof
            <ExternalLink className="w-3 h-3" />
          </Link>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[var(--virgil-text-muted)]" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[var(--virgil-border-soft)]">
              <div className="pt-3">
                <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
                  AI Reasoning
                </span>
                <p className="text-sm text-[var(--virgil-text)] mt-1 leading-relaxed">
                  {record.reasoning}
                </p>
              </div>

              {record.dataObserved && Object.keys(record.dataObserved).length > 0 && (
                <div>
                  <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
                    Data Observed
                  </span>
                  <pre className="mt-1 p-3 rounded-lg bg-[var(--virgil-bg-alt)] text-xs font-mono text-[var(--virgil-text-muted)] overflow-auto max-h-40">
                    {JSON.stringify(record.dataObserved, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-badge bg-[#7B68EE]/10 text-[#7B68EE] text-xs font-medium">
                  Stored on 0G
                </span>
              </div>

              <HashDisplay hash={record.recordHash} label="Record Hash" />
              {record.ogStorageKey && (
                <HashDisplay hash={record.ogStorageKey} label="0G Storage Key" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
