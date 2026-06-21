"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--virgil-bg)] px-4">
      <div className="text-center space-y-6 max-w-md">
        <AlertTriangle className="w-16 h-16 text-[var(--virgil-warning)] mx-auto" />
        <h1 className="text-2xl font-bold text-[var(--virgil-text)]">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--virgil-text-muted)]">
          We encountered an unexpected error. Please try again or return home.
        </p>
        {error.digest && (
          <p className="text-xs text-[var(--virgil-text-muted)] font-mono bg-[var(--virgil-bg-alt)] p-2 rounded">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-button bg-[var(--virgil-accent)] text-white font-medium hover:bg-[var(--virgil-accent-warm)] active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-button border border-[var(--virgil-border-soft)] text-[var(--virgil-text-muted)] hover:text-[var(--virgil-text)] hover:border-[var(--virgil-accent)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
