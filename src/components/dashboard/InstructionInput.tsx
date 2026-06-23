"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, AlertCircle, CheckCircle } from "lucide-react";
import { INSTRUCTION_EXAMPLES } from "@/lib/utils/constants";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { showToast } from "@/components/shared/Toast";

interface ParsedResult {
  conditionType: string;
  target: string;
  threshold: number | null;
  thresholdUnit: string | null;
  action: string;
  confidence: number;
  needsClarification: boolean;
  clarificationQuestion: string | null;
}

interface InstructionInputProps {
  walletAddress: string;
  onInstructionCreated: () => void;
}

type InputState = "idle" | "parsing" | "clarifying" | "confirming" | "saving";

export function InstructionInput({
  walletAddress,
  onInstructionCreated,
}: InstructionInputProps) {
  const [instruction, setInstruction] = useState("");
  const [state, setState] = useState<InputState>("idle");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [clarification, setClarification] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);

  const handleParse = async () => {
    if (!instruction.trim()) return;
    setState("parsing");

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, walletAddress }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Parse failed");
      }

      const data = (await res.json()) as { parsed: ParsedResult };
      setParsed(data.parsed);

      if (data.parsed.needsClarification) {
        setState("clarifying");
      } else {
        setState("confirming");
      }
    } catch {
      showToast("Failed to parse instruction. Please try again.", "error");
      setState("idle");
    }
  };

  const handleClarify = async () => {
    const combined = `${instruction}\n\nClarification: ${clarification}`;
    setInstruction(combined);
    setState("parsing");

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: combined, walletAddress }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Parse failed");
      }

      const data = (await res.json()) as { parsed: ParsedResult };
      setParsed(data.parsed);
      setState("confirming");
    } catch {
      showToast("Failed to process clarification. Please try again.", "error");
      setState("clarifying");
    }
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    setState("saving");

    try {
      const res = await fetch("/api/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsed: { ...parsed, raw: instruction },
          walletAddress,
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Save failed");
      }

      showToast("Instruction activated! Virgil is now monitoring.", "success");
      setInstruction("");
      setParsed(null);
      setClarification("");
      setState("idle");
      onInstructionCreated();
    } catch {
      showToast("Failed to save instruction to 0G.", "error");
      setState("confirming");
    }
  };

  const handleReset = () => {
    setInstruction("");
    setParsed(null);
    setClarification("");
    setState("idle");
  };

  const useExample = () => {
    setInstruction(INSTRUCTION_EXAMPLES[exampleIndex] || INSTRUCTION_EXAMPLES[0]);
    setExampleIndex((i) => (i + 1) % INSTRUCTION_EXAMPLES.length);
  };

  return (
    <div className="bg-white shadow-sm rounded-card border border-[var(--virgil-border-soft)] p-6 space-y-4">
      <label className="block text-sm font-medium text-gray-900">
        Tell Virgil what to watch
      </label>

      <div className="relative">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. 'Alert me if wallet 0x... moves more than 5 ETH'"
          disabled={state === "parsing" || state === "saving"}
          rows={3}
          className="w-full px-4 py-3 rounded-button border border-[var(--virgil-border-soft)] bg-black/50 text-white placeholder:text-gray-400 focus:border-[var(--virgil-accent)] focus:ring-1 focus:ring-[var(--virgil-accent)] outline-none resize-none disabled:opacity-50 transition-all text-sm"
          maxLength={500}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {instruction.length}/500
        </div>
      </div>

      {/* Example suggestion */}
      {state === "idle" && !instruction && (
        <button
          onClick={useExample}
          className="text-xs text-[var(--virgil-accent)] hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Try an example
        </button>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {state === "idle" && (
          <button
            onClick={handleParse}
            disabled={!instruction.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-button bg-[var(--virgil-accent)] text-white font-medium text-sm hover:bg-[var(--virgil-accent-warm)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Send className="w-4 h-4" />
            Activate Agent
          </button>
        )}

        {state === "parsing" && (
          <div className="flex items-center gap-2 px-6 py-2.5 rounded-button bg-[var(--virgil-accent)] text-white text-sm opacity-80">
            <LoadingSpinner size="sm" color="white" />
            Parsing...
          </div>
        )}

        {state === "saving" && (
          <div className="flex items-center gap-2 px-6 py-2.5 rounded-button bg-[var(--virgil-accent)] text-white text-sm opacity-80">
            <LoadingSpinner size="sm" color="white" />
            Saving to 0G...
          </div>
        )}
      </div>

      {/* Clarification UI */}
      <AnimatePresence>
        {state === "clarifying" && parsed?.needsClarification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--virgil-blush)]/50 border border-[var(--virgil-blush)] rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Virgil needs clarification
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {parsed.clarificationQuestion}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={clarification}
                onChange={(e) => setClarification(e.target.value)}
                placeholder="Your answer..."
                className="flex-1 px-3 py-2 rounded-button border border-[var(--virgil-border-soft)] bg-white text-sm focus:border-[var(--virgil-accent)] outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleClarify();
                }}
              />
              <button
                onClick={handleClarify}
                disabled={!clarification.trim()}
                className="px-4 py-2 rounded-button bg-[var(--virgil-accent)] text-white text-sm font-medium hover:bg-[var(--virgil-accent-warm)] disabled:opacity-40 transition-all"
              >
                Submit
              </button>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation UI */}
      <AnimatePresence>
        {state === "confirming" && parsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--virgil-glow)]/50 border border-[var(--virgil-pale)] rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--virgil-success)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Virgil understood your instruction
                </p>
                <div className="mt-2 space-y-1.5 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">Watching:</span>{" "}
                    {parsed.target || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Condition:</span>{" "}
                    {parsed.conditionType.replace("_", " ")}
                  </p>
                  {parsed.threshold && (
                    <p>
                      <span className="font-medium">Threshold:</span>{" "}
                      {parsed.threshold} {parsed.thresholdUnit}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Action:</span>{" "}
                    {parsed.action}
                  </p>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-[var(--virgil-accent)]/10 text-[var(--virgil-accent)] text-xs font-medium">
                    {parsed.confidence}% confident
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-button bg-[var(--virgil-accent)] text-white text-sm font-medium hover:bg-[var(--virgil-accent-warm)] active:scale-[0.98] transition-all"
              >
                Confirm & Activate
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-button border border-[var(--virgil-border-soft)] text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Edit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
