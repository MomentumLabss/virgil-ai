"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Menu, X } from "lucide-react";
import { WalletButton } from "@/components/shared/WalletButton";
import { VirgilLogo } from "@/components/shared/VirgilLogo";

export function Navbar() {
  const { isConnected } = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <>
                <Link
                  href="/covirgil"
                  className="hidden sm:inline-flex text-sm font-medium text-[var(--virgil-text-secondary)] hover:text-[var(--virgil-accent)] transition-colors px-3 py-2 rounded-lg hover:bg-[var(--virgil-glow)]"
                >
                  CoVirgil
                </Link>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex text-sm font-medium text-[var(--virgil-text-secondary)] hover:text-[var(--virgil-accent)] transition-colors px-3 py-2 rounded-lg hover:bg-[var(--virgil-glow)]"
                >
                  Dashboard
                </Link>
              </>
            )}
            {isConnected && (
              <button
                className="sm:hidden p-2 text-[var(--virgil-text-secondary)] hover:text-[var(--virgil-accent)] transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isConnected && isMobileMenuOpen && (
          <div className="sm:hidden border-t border-[var(--virgil-border-soft)] py-2 pb-4 space-y-1">
            <Link
              href="/covirgil"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-[var(--virgil-text-secondary)] hover:text-[var(--virgil-accent)] hover:bg-[var(--virgil-glow)] transition-colors"
            >
              CoVirgil
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-[var(--virgil-text-secondary)] hover:text-[var(--virgil-accent)] hover:bg-[var(--virgil-glow)] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
