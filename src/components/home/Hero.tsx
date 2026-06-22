"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Lock, FileCheck, Shield, ArrowDown, Zap, Database } from "lucide-react";
import { motion } from "framer-motion";
import { APP_DESCRIPTION } from "@/lib/utils/constants";
import { WalletButton } from "@/components/shared/WalletButton";
import { VirgilLogo } from "@/components/shared/VirgilLogo";

const STATS = [
  { value: "∞", label: "Storage Duration" },
  { value: "0G", label: "Decentralized Layer" },
  { value: "100%", label: "Verifiable" },
];

export function Hero() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Absolute void background */}
      <div className="absolute inset-0 bg-black pointer-events-none overflow-hidden">
        {/* Subtle purple spotlight from top center */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-[0.15]"
          style={{
            background: "radial-gradient(ellipse at top, #7c5cfc 0%, transparent 70%)"
          }}
        />
        
        {/* Faded giant logo watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] mix-blend-screen pointer-events-none">
          <div className="scale-[4] sm:scale-[6] md:scale-[8]">
            <VirgilLogo size={120} animated={true} />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wide uppercase"
            style={{
              background: "rgba(124, 92, 252, 0.1)",
              borderColor: "rgba(124, 92, 252, 0.3)",
              color: "#b06cff",
              letterSpacing: "0.08em",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--virgil-success)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--virgil-success)]" />
            </span>
            Built on 0G Decentralized Storage · Zero Cup 2026
          </motion.div>

          {/* Main headline */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
              <span className="text-[var(--virgil-text)]">Your AI Agent Acts.</span>
              <br />
              <span className="gradient-text">0G Remembers.</span>
              <br />
              <span className="text-[var(--virgil-text)]">You Have Proof.</span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[var(--virgil-text-secondary)] max-w-2xl mx-auto leading-relaxed font-light">
            {APP_DESCRIPTION}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isConnected ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-accent px-8 py-4 rounded-xl text-sm font-semibold"
              >
                Open Dashboard →
              </button>
            ) : (
              <div className="scale-105">
                <WalletButton />
              </div>
            )}
            <button
              onClick={scrollToHowItWorks}
              className="btn-ghost flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-medium"
            >
              See how it works
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center gap-8 sm:gap-16 pt-4 border-t"
            style={{ borderColor: "rgba(124, 92, 252, 0.12)" }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text">{value}</div>
                <div className="text-xs text-[var(--virgil-text-muted)] mt-1 tracking-wide">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Lock, text: "Permanent on 0G" },
              { icon: FileCheck, text: "Cryptographic Proof" },
              { icon: Shield, text: "No Trust Required" },
              { icon: Zap, text: "Groq AI — Sub-100ms" },
              { icon: Database, text: "0G Testnet" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(124, 92, 252, 0.06)",
                  border: "1px solid rgba(124, 92, 252, 0.15)",
                  color: "var(--virgil-text-muted)",
                }}
              >
                <Icon className="w-3 h-3 text-[var(--virgil-accent)]" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
