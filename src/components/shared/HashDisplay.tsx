"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncateHash, copyToClipboard } from "@/lib/utils/format";

interface HashDisplayProps {
  hash: string;
  label?: string;
  className?: string;
}

export function HashDisplay({ hash, label, className }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <span className="text-xs text-[var(--virgil-text-muted)] font-medium">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="font-mono text-xs bg-[var(--virgil-bg-alt)] px-2.5 py-1.5 rounded-button text-white hover:bg-gray-800 transition-colors cursor-pointer"
          title={expanded ? "Click to collapse" : "Click to expand"}
        >
          {expanded ? hash : truncateHash(hash)}
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-button hover:bg-[var(--virgil-glow)] transition-colors"
          aria-label={copied ? "Copied" : "Copy hash"}
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[var(--virgil-success)]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-[var(--virgil-text-muted)]" />
          )}
        </button>
      </div>
    </div>
  );
}
