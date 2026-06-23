"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AgentRecord } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RecordCard } from "@/components/dashboard/RecordCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function RecordsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [records, setRecords] = useState<AgentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!isConnected && !address) {
      timer = setTimeout(() => {
        if (!isConnected) {
          router.push("/");
        }
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isConnected, address, router]);

  useEffect(() => {
    if (!address) return;
    try {
      const localKey = `virgil_records_${address}`;
      const localData = localStorage.getItem(localKey);
      if (localData) {
        setRecords(JSON.parse(localData));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col bg-[var(--virgil-bg)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--virgil-text-muted)]">Please connect your wallet...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--virgil-bg)]">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--virgil-accent)] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--virgil-text)]">
            All Agent Records
          </h1>
          <p className="text-sm text-[var(--virgil-text-muted)] mt-1">
            Complete history of every condition checked by the agent
          </p>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Record History
            </h2>
            <span className="text-xs text-gray-500">
              {records.length} total records
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} height={64} />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 bg-white shadow-sm rounded-card border border-dashed border-[var(--virgil-border-soft)]">
              <p className="text-sm text-gray-500">
                Your agent has not logged any activity yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
