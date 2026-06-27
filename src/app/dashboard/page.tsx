"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Instruction, AgentRecord, AgentStatus } from "@/types";
import { POLL_INTERVAL_MS } from "@/lib/utils/constants";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer, showToast } from "@/components/shared/Toast";
import { InstructionInput } from "@/components/dashboard/InstructionInput";
import { InstructionList } from "@/components/dashboard/InstructionList";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { OGUnavailableBanner } from "@/components/shared/OGUnavailableBanner";
import { AgentStatusPanel } from "@/components/dashboard/AgentStatus";
import { TelegramConnect } from "@/components/dashboard/TelegramConnect";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [records, setRecords] = useState<AgentRecord[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    isRunning: false,
    lastPollAt: null,
    activeInstructions: 0,
    totalRecords: 0,
  });
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if not connected
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!isConnected && !address) {
      timer = setTimeout(() => {
        if (!isConnected) {
          showToast("Please connect your wallet to access the dashboard", "info");
          router.push("/");
        }
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isConnected, address, router]);

  const fetchInstructions = useCallback(async () => {
    if (!address) return;
    
    // Only show loading state on initial load, not background polls
    if (instructions.length === 0) {
      setIsLoadingInstructions(true);
    }
    
    try {
      const res = await fetch(`/api/instructions?wallet=${address}`);
      let fetchedInstructions: Instruction[] = [];
      
      if (res.ok) {
        const data = (await res.json()) as { instructions: Instruction[] };
        fetchedInstructions = data.instructions;
      }
      
      // Merge with localStorage to prevent Vercel serverless memory loss
      const localKey = `virgil_instructions_${address}`;
      const localData = localStorage.getItem(localKey);
      let localInstructions: Instruction[] = localData ? JSON.parse(localData) : [];
      
      const merged = [...fetchedInstructions];
      for (const localInst of localInstructions) {
        if (!merged.find(i => i.id === localInst.id)) {
          merged.push(localInst);
        }
      }
      
      merged.sort((a, b) => b.createdAt - a.createdAt);
      setInstructions(merged);
      localStorage.setItem(localKey, JSON.stringify(merged));
      
    } catch {
      window.dispatchEvent(new Event("og-error"));
    } finally {
      setIsLoadingInstructions(false);
    }
  }, [address]);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    if (!address) return;
    setIsLoadingRecords(true);
    try {
      const localKey = `virgil_records_${address}`;
      const localData = localStorage.getItem(localKey);
      if (localData) {
        setRecords(JSON.parse(localData));
      } else {
        setRecords([]);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoadingRecords(false);
    }
  }, [address]);

  // Poll agent evaluations
  const runEvaluation = useCallback(async () => {
    if (!address || instructions.length === 0) return;

    const activeInstructions = instructions.filter(
      (i) => i.status === "active"
    );

    for (const instruction of activeInstructions) {
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { record: AgentRecord, instruction: Instruction };
          
          // Update records
          setRecords((prev) => {
            const updated = [data.record, ...prev];
            localStorage.setItem(`virgil_records_${address}`, JSON.stringify(updated));
            return updated;
          });
          
          // Update instruction in localStorage to instantly reflect new status/lastCheckedAt
          if (data.instruction) {
            const localKey = `virgil_instructions_${address}`;
            const existing = localStorage.getItem(localKey);
            if (existing) {
              let localInsts: Instruction[] = JSON.parse(existing);
              localInsts = localInsts.map(i => i.id === data.instruction.id ? data.instruction : i);
              localStorage.setItem(localKey, JSON.stringify(localInsts));
            }
          }
          
          setAgentStatus((prev) => ({
            ...prev,
            totalRecords: prev.totalRecords + 1,
            lastPollAt: Math.floor(Date.now() / 1000),
          }));
        }
      } catch {
        // Individual evaluation failures are non-fatal
      }
    }

    // Refresh instructions to get updated statuses
    await fetchInstructions();
  }, [address, instructions, fetchInstructions]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (address) {
      fetchInstructions();
      fetchRecords();
    }
  }, [address, fetchInstructions, fetchRecords]);

  useEffect(() => {
    if (!address || instructions.length === 0) {
      setAgentStatus((prev) => ({ ...prev, isRunning: false }));
      return;
    }

    setAgentStatus((prev) => ({
      ...prev,
      isRunning: true,
      activeInstructions: instructions.filter((i) => i.status === "active")
        .length,
    }));

    pollIntervalRef.current = setInterval(() => {
      runEvaluation();
    }, POLL_INTERVAL_MS);
    
    // Fire the first evaluation immediately so the user doesn't wait 30s
    runEvaluation();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [address, instructions, runEvaluation]);

  const handleRefresh = () => {
    fetchInstructions();
    fetchRecords();
    showToast("Dashboard refreshed", "success");
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col bg-[var(--virgil-bg)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-[var(--virgil-text-muted)]">
              Please connect your wallet to access the dashboard
            </p>
          </div>
        </div>
        <Footer />
        <ToastContainer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--virgil-bg)]">
      <Navbar />

      {/* 0G Unavailable Banner */}
      <OGUnavailableBanner />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--virgil-text)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--virgil-text-muted)] mt-1">
            Manage your monitoring instructions and view agent activity
          </p>
        </motion.div>

        {/* Agent Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AgentStatusPanel
            isRunning={agentStatus.isRunning}
            lastPollAt={agentStatus.lastPollAt}
            activeInstructions={agentStatus.activeInstructions}
            totalRecords={records.length}
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Panel - Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <TelegramConnect walletAddress={address || ""} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <InstructionInput
                walletAddress={address || ""}
                onInstructionCreated={handleRefresh}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <InstructionList
                instructions={instructions}
                isLoading={isLoadingInstructions}
                onUpdate={handleRefresh}
              />
            </motion.div>
          </div>

          {/* Right Panel - Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <ActivityFeed
              records={records}
              isLoading={isLoadingRecords}
              isAgentRunning={agentStatus.isRunning}
            />
          </motion.div>
        </div>
      </div>

      <Footer />
      <ToastContainer />

    </main>
  );
}
