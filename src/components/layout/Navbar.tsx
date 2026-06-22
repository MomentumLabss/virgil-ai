"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/shared/WalletButton";
import { VirgilLogo } from "@/components/shared/VirgilLogo";

export function Navbar() {
  const { isConnected } = useAccount();

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <VirgilLogo size={28} animated={true} />
            <span className="text-lg font-bold tracking-tight text-[var(--virgil-text)]">
              Virgil
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isConnected && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex text-sm font-medium text-[var(--virgil-text-secondary)] hover:text-[var(--virgil-accent)] transition-colors px-3 py-2 rounded-lg hover:bg-[var(--virgil-glow)]"
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
