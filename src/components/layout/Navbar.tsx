"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Shield } from "lucide-react";
import { WalletButton } from "@/components/shared/WalletButton";

export function Navbar() {
  const { isConnected } = useAccount();

  return (
    <nav className="sticky top-0 z-40 glass border-b border-[var(--virgil-border-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <Shield className="w-6 h-6 text-[var(--virgil-accent)]" />
            <span className="text-lg font-semibold tracking-tight text-[var(--virgil-text)]">
              Virgil
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isConnected && (
              <Link
                href="/dashboard"
                className="text-sm text-[var(--virgil-text-muted)] hover:text-[var(--virgil-accent)] transition-colors px-3 py-2 rounded-button"
              >
                Dashboard
              </Link>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
