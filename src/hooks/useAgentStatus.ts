"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AgentStatus } from "@/types";
import { POLL_INTERVAL_MS } from "@/lib/utils/constants";

export function useAgentStatus(
  walletAddress: string | undefined,
  activeInstructionsCount: number
) {
  const [status, setStatus] = useState<AgentStatus>({
    isRunning: false,
    lastPollAt: null,
    activeInstructions: 0,
    totalRecords: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!walletAddress) return;

    setStatus((prev) => ({
      ...prev,
      isRunning: activeInstructionsCount > 0,
      activeInstructions: activeInstructionsCount,
      lastPollAt: Math.floor(Date.now() / 1000),
    }));
  }, [walletAddress, activeInstructionsCount]);

  useEffect(() => {
    if (!walletAddress) {
      setStatus((prev) => ({ ...prev, isRunning: false }));
      return;
    }

    // Initial poll
    poll();

    // Set up interval
    if (activeInstructionsCount > 0) {
      intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [walletAddress, activeInstructionsCount, poll]);

  return { status, setStatus };
}
