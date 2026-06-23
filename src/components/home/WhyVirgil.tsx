"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock, Eye, Zap, Globe, Lock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trustless",
    description:
      "Your audit trail lives on 0G decentralized storage - not our servers. No company controls your data.",
    accent: "#7c5cfc",
  },
  {
    icon: Clock,
    title: "Permanent",
    description:
      "Once written to 0G, no one can delete or alter a record. Not Virgil, not 0G Labs, not anyone.",
    accent: "#00d4aa",
  },
  {
    icon: Eye,
    title: "Verifiable",
    description:
      "Anyone can verify any record with a public link. No account, no wallet, no trust required.",
    accent: "#b06cff",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Powered by Groq's LPU inference engine - AI decisions in under 100ms for real-time Web3 monitoring.",
    accent: "#f0b429",
  },
  {
    icon: Globe,
    title: "Always On",
    description:
      "Virgil runs 24/7, polling conditions on a schedule. Your agent never sleeps, never misses an event.",
    accent: "#ff4d6a",
  },
  {
    icon: Lock,
    title: "Wallet-Native",
    description:
      "Connect with any EVM wallet. No email, no password - your wallet is your identity and your key.",
    accent: "#4dd0e1",
  },
];

export function WhyVirgil() {
  return (
    <section className="py-32 relative overflow-hidden"
      style={{ background: "var(--virgil-bg-alt)" }}
    >
      {/* Decorative blob */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.3), transparent)" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              background: "rgba(124, 92, 252, 0.1)",
              color: "#b06cff",
              border: "1px solid rgba(124, 92, 252, 0.2)",
            }}
          >
            Why Virgil
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[var(--virgil-text)] mb-4">
            The only Web3 agent with a
            <br />
            <span className="gradient-text">permanent, trustless audit trail.</span>
          </h2>
          <p className="text-[var(--virgil-text-secondary)] max-w-xl mx-auto text-lg">
            Built specifically for the 0G ecosystem. No other automation tool offers this level of verifiability.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="card-glow rounded-2xl p-7 group cursor-default"
              style={{ background: "var(--virgil-bg-card)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `${feature.accent}12`,
                  border: `1px solid ${feature.accent}25`,
                }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.accent }} />
              </div>
              <h3 className="text-lg font-bold text-[var(--virgil-text)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--virgil-text-secondary)] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-[var(--virgil-text-muted)] text-sm">
            Built for the{" "}
            <span className="text-[var(--virgil-accent)] font-semibold">
              Zero Cup 2026
            </span>{" "}
            - 0G Global Vibe Coding Tournament
          </p>
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.2), transparent)" }}
      />
    </section>
  );
}
