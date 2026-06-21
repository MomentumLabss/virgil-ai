"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Shield, Lock, FileCheck, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { APP_DESCRIPTION } from "@/lib/utils/constants";
import { WalletButton } from "@/components/shared/WalletButton";

export function Hero() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 50% 40%, rgba(104, 72, 232, 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--virgil-glow)] border border-[var(--virgil-pale)] text-xs font-medium text-[var(--virgil-accent)]">
            <Shield className="w-3.5 h-3.5" />
            <span>Built on 0G Decentralized Storage</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--virgil-text)] leading-tight tracking-tight">
            Your AI Agent Acts.
            <br />
            <span className="text-[var(--virgil-accent)]">0G Remembers.</span>
            <br />
            You Have Proof.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[var(--virgil-text-muted)] max-w-2xl mx-auto leading-relaxed">
            {APP_DESCRIPTION}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isConnected ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-3.5 rounded-button bg-[var(--virgil-accent)] text-white font-medium hover:bg-[var(--virgil-accent-warm)] active:scale-[0.98] transition-all shadow-glow"
              >
                Go to Dashboard
              </button>
            ) : (
              <WalletButton />
            )}
            <button
              onClick={scrollToHowItWorks}
              className="flex items-center gap-2 px-6 py-3.5 rounded-button border border-[var(--virgil-border-soft)] text-[var(--virgil-text-muted)] hover:text-[var(--virgil-accent)] hover:border-[var(--virgil-accent)] hover:bg-[var(--virgil-glow)] active:scale-[0.98] transition-all"
            >
              See how it works
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            {[
              { icon: Lock, text: "Permanent on 0G" },
              { icon: FileCheck, text: "Cryptographic proof" },
              { icon: Shield, text: "No trust required" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[var(--virgil-border-soft)] text-xs font-medium text-[var(--virgil-text-muted)]"
              >
                <Icon className="w-3.5 h-3.5 text-[var(--virgil-accent)]" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
