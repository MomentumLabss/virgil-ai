"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
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
import { Copilot } from "@/components/copilot/Copilot";

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
    if (!isConnected && !address) {
      const timer = setTimeout(() => {
        if (!isConnected) {
          showToast("Please connect your wallet to access the dashboard", "info");
          router.push("/");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, router]);

  // Fetch instructions
  const fetchInstructions = useCallback(async () => {
    if (!address) return;
    setIsLoadingInstructions(true);
    try {
      const res = await fetch(`/api/instructions?wallet=${address}`);
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        if (err.error?.includes("0G")) {
          window.dispatchEvent(new Event("og-error"));
        }
        return;
      }
      const data = (await res.json()) as { instructions: Instruction[] };
      setInstructions(data.instructions);
    } catch {
      window.dispatchEvent(new Event("og-error"));
    } finally {
      setIsLoadingInstructions(false);
    }
  }, [address]);

  // Fetch records (simulated by checking instruction records)
  const fetchRecords = useCallback(async () => {
    if (!address) return;
    setIsLoadingRecords(true);
    try {
      // In a full implementation, we'd have a dedicated records endpoint
      // For now, we'll use the instructions we already have
      const allRecords: AgentRecord[] = [];
      setRecords(allRecords);
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
            instructionId: instruction.id,
            walletAddress: address,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { record: AgentRecord };
          setRecords((prev) => [data.record, ...prev]);
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

      {/* AI Copilot */}
      <Copilot
        walletAddress={address || ""}
        instructions={instructions}
        recentRecords={records}
      />
    </main>
  );
}
