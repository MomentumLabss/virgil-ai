"use client";

import { useState, useCallback } from "react";
import { AgentRecord, Instruction } from "@/types";

export function useRecords() {
  const [records, setRecords] = useState<AgentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (walletAddress?: string) => {
    if (!walletAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get all instructions for this wallet
      const instRes = await fetch(`/api/instructions?wallet=${walletAddress}`);
      if (!instRes.ok) {
        throw new Error("Failed to fetch instructions for records");
      }
      const { instructions } = (await instRes.json()) as { instructions: Instruction[] };

      // 2. For each instruction, fetch its records
      const allRecords: AgentRecord[] = [];
      
      await Promise.all(
        instructions.map(async (inst) => {
          try {
            const recRes = await fetch(`/api/records/${inst.id}`);
            if (recRes.ok) {
              const { records } = (await recRes.json()) as { records: AgentRecord[] };
              allRecords.push(...records);
            }
          } catch (e) {
            console.error(`Failed to fetch records for instruction ${inst.id}`, e);
          }
        })
      );

      // 3. Sort by timestamp descending
      allRecords.sort((a, b) => b.timestamp - a.timestamp);

      // 4. Set state
      setRecords(allRecords);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    records,
    isLoading,
    error,
    fetchRecords,
    setRecords,
  };
}
