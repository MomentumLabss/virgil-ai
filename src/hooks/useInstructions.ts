"use client";

import { useState, useCallback } from "react";
import { Instruction } from "@/types";

export function useInstructions(walletAddress: string | undefined) {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructions = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/instructions?wallet=${walletAddress}`);
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Failed to fetch instructions");
      }
      const data = (await res.json()) as { instructions: Instruction[] };
      setInstructions(data.instructions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  return {
    instructions,
    isLoading,
    error,
    fetchInstructions,
    setInstructions,
  };
}
