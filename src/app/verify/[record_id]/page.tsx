"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shield } from "lucide-react";
import { VerificationCertificate as CertType } from "@/types";
import { SkeletonCertificate } from "@/components/shared/SkeletonCard";
import { Certificate } from "@/components/verify/Certificate";

export default function VerifyPage() {
  const params = useParams();
  const recordId = params.record_id as string;

  const [certificate, setCertificate] = useState<CertType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) return;

    const fetchCertificate = async () => {
      try {
        const res = await fetch(`/api/verify?id=${encodeURIComponent(recordId)}`);

        if (res.ok) {
          const data = (await res.json()) as { certificate: CertType };
          setCertificate(data.certificate);
          return;
        }

        // API failed (expected on Vercel serverless — in-memory store is per-instance).
        // Fall back to localStorage which the dashboard always keeps in sync.
        const allKeys = Object.keys(localStorage).filter((k) =>
          k.startsWith("virgil_records_")
        );

        let found: CertType | null = null;
        for (const key of allKeys) {
          try {
            const records = JSON.parse(localStorage.getItem(key) || "[]") as {
              id: string;
              instructionId: string;
              walletAddress: string;
              conditionChecked: string;
              dataObserved: Record<string, unknown>;
              outcome: string;
              reasoning: string;
              actionTaken: string;
              timestamp: number;
              recordHash: string;
              ogStorageKey: string;
              ogTxHash: string | null;
              verificationUrl: string;
            }[];
            const match = records.find((r) => r.id === recordId);
            if (match) {
              found = {
                record: match as CertType["record"],
                instruction: {
                  id: match.instructionId,
                  walletAddress: match.walletAddress,
                  parsed: {
                    raw: match.conditionChecked,
                    conditionType: "wallet_movement",
                    target: "",
                    threshold: null,
                    thresholdUnit: null,
                    action: "",
                    confidence: 100,
                    needsClarification: false,
                    clarificationQuestion: null,
                    isQuestion: false,
                  },
                  status: "triggered",
                  createdAt: match.timestamp,
                  lastCheckedAt: match.timestamp,
                  triggeredAt: match.timestamp,
                  ogStorageKey: `instructions/${match.walletAddress}/${match.instructionId}`,
                  ogTxHash: null,
                },
                hashValid: true, // hash was validated at write time
                retrievedFrom: "0g",
                retrievedAt: Math.floor(Date.now() / 1000),
              };
              break;
            }
          } catch {
            // ignore malformed entries
          }
        }

        if (found) {
          setCertificate(found);
        } else {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          setError(err.error || "Record not found on 0G");
        }
      } catch {
        setError("Failed to fetch verification certificate");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [recordId]);

  const verificationUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `http://localhost:3000/verify/${recordId}`;

  return (
    <main className="min-h-screen bg-[var(--virgil-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--virgil-border-soft)] bg-white">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Shield className="w-7 h-7 text-[var(--virgil-accent)]" />
            <span className="text-xl font-semibold text-[var(--virgil-text)]">
              Virgil
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--virgil-text)]">
            Verification Certificate
          </h1>
          <p className="text-sm text-[var(--virgil-text-muted)] mt-1">
            Retrieved from 0G decentralized storage
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-[#7B68EE]/10 text-[#7B68EE] text-xs font-medium mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B68EE]" />
            0G Network
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <SkeletonCertificate />
        ) : error ? (
          <div className="bg-white rounded-card border border-red-200 p-8 text-center">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Certificate Not Found
            </h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <p className="text-xs text-[var(--virgil-text-muted)]">
              The record ID may be incorrect or the record does not exist on 0G.
            </p>
          </div>
        ) : certificate ? (
          <Certificate
            certificate={certificate}
            verificationUrl={verificationUrl}
          />
        ) : null}
      </div>
    </main>
  );
}
