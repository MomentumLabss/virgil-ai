"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Copy, Check, Shield } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { VerificationCertificate as CertType } from "@/types";
import { OG_EXPLORER_URL } from "@/lib/utils/constants";
import {
  formatTimestamp,
  truncateAddress,
  copyToClipboard,
} from "@/lib/utils/format";
import { HashDisplay } from "@/components/shared/HashDisplay";

interface CertificateProps {
  certificate: CertType;
  verificationUrl: string;
}

export function Certificate({ certificate, verificationUrl }: CertificateProps) {
  const { record, instruction, hashValid } = certificate;
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = async () => {
    await copyToClipboard(verificationUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Integrity Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`rounded-card border p-4 flex items-start gap-3 ${
          hashValid
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        {hashValid ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p
            className={`text-sm font-medium ${
              hashValid ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {hashValid
              ? "Record integrity verified"
              : "Warning: Record hash mismatch"}
          </p>
          <p
            className={`text-xs mt-1 ${
              hashValid ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {hashValid
              ? "This record has not been altered since it was written to 0G."
              : "This record may have been tampered with."}
          </p>
        </div>
      </motion.div>

      {/* Record Details */}
      <div className="bg-white rounded-card border border-[var(--virgil-border-soft)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--virgil-border-soft)] bg-[var(--virgil-bg-alt)]">
          <h2 className="text-lg font-semibold text-[var(--virgil-text)]">
            Record Details
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Instruction */}
          <div>
            <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
              Original Instruction
            </span>
            <p className="mt-1.5 text-sm text-[var(--virgil-text)] bg-[var(--virgil-bg-alt)] p-3 rounded-lg border border-[var(--virgil-border-soft)]">
              {instruction.parsed.raw}
            </p>
          </div>

          {/* Condition */}
          <div>
            <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
              Condition Evaluated
            </span>
            <p className="mt-1.5 text-sm text-[var(--virgil-text)]">
              {record.conditionChecked}
            </p>
          </div>

          {/* Data Observed */}
          {record.dataObserved &&
            Object.keys(record.dataObserved).length > 0 && (
              <div>
                <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
                  Data Observed
                </span>
                <pre className="mt-1.5 p-3 rounded-lg bg-[var(--virgil-bg-alt)] text-xs font-mono text-[var(--virgil-text-muted)] overflow-auto max-h-48 border border-[var(--virgil-border-soft)]">
                  {JSON.stringify(record.dataObserved, null, 2)}
                </pre>
              </div>
            )}

          {/* Outcome */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
              Outcome
            </span>
            <span
              className={`px-2.5 py-1 rounded-badge text-xs font-medium border ${
                record.outcome === "triggered"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {record.outcome === "triggered" ? "Triggered" : "Not Triggered"}
            </span>
          </div>

          {/* Reasoning */}
          <div>
            <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
              AI Reasoning
            </span>
            <p className="mt-1.5 text-sm text-[var(--virgil-text)] leading-relaxed">
              {record.reasoning}
            </p>
          </div>

          {/* Action Taken */}
          <div>
            <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
              Action Taken
            </span>
            <p className="mt-1.5 text-sm text-[var(--virgil-text)]">
              {record.actionTaken}
            </p>
          </div>

          {/* Timestamp */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
                Timestamp
              </span>
              <p className="mt-1.5 text-sm text-[var(--virgil-text)]">
                {formatTimestamp(record.timestamp)}
              </p>
              <p className="text-xs text-[var(--virgil-text-muted)] font-mono mt-0.5">
                {record.timestamp} (unix)
              </p>
            </div>
          </div>

          {/* Hashes */}
          <div className="space-y-3 pt-2 border-t border-[var(--virgil-border-soft)]">
            <HashDisplay hash={record.recordHash} label="Record Hash (SHA-256)" />
            <HashDisplay hash={record.ogStorageKey} label="0G Storage Key" />
            {record.ogTxHash && (
              <div>
                <HashDisplay hash={record.ogTxHash} label="0G Transaction Hash" />
                <a
                  href={`${OG_EXPLORER_URL}/tx/${record.ogTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--virgil-accent)] hover:underline mt-1 inline-block"
                >
                  View on 0G Explorer
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-white rounded-card border border-[var(--virgil-border-soft)] p-6">
        <span className="text-xs font-medium text-[var(--virgil-text-muted)] uppercase tracking-wider">
          Wallet
        </span>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--virgil-glow)] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[var(--virgil-accent)]" />
          </div>
          <div>
            <p className="text-sm font-mono text-[var(--virgil-text)]">
              {truncateAddress(record.walletAddress)}
            </p>
            <p className="text-xs text-[var(--virgil-text-muted)]">
              This instruction was created by this wallet and stored on 0G
            </p>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="bg-[var(--virgil-glow)]/30 rounded-card border border-[var(--virgil-pale)] p-6">
        <h3 className="text-sm font-medium text-[var(--virgil-text)] mb-3">
          Share this certificate
        </h3>
        <button
          onClick={handleCopyUrl}
          className="flex items-center gap-2 px-4 py-2.5 rounded-button bg-white border border-[var(--virgil-border-soft)] text-sm text-[var(--virgil-text)] hover:border-[var(--virgil-accent)] hover:bg-[var(--virgil-glow)] transition-all mb-6"
        >
          {copiedUrl ? (
            <>
              <Check className="w-4 h-4 text-[var(--virgil-success)]" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy verification URL
            </>
          )}
        </button>

        <div className="flex flex-col items-center pt-6 border-t border-[var(--virgil-border-soft)]">
          <div className="bg-white p-3 rounded-xl border border-[var(--virgil-border-soft)] shadow-sm">
            {verificationUrl ? (
              <QRCodeSVG value={verificationUrl} size={128} />
            ) : null}
          </div>
          <p className="text-xs text-[var(--virgil-text-muted)] mt-3">
            Scan to verify on any device
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-[var(--virgil-text-muted)] leading-relaxed">
        This record was written permanently to 0G decentralized storage and
        cannot be altered or deleted by Virgil or any third party.
      </p>
    </div>
  );
}
