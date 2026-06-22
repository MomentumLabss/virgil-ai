"use client";

import { motion } from "framer-motion";
import { PenLine, Activity, Lock, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "You instruct",
    description:
      "Tell Virgil what to watch in plain English. No coding, no queries — just describe what you want to monitor.",
    example: '"Alert me if wallet 0x1234... moves more than 5 ETH"',
    color: "#7c5cfc",
  },
  {
    icon: Activity,
    step: "02",
    title: "Virgil monitors",
    description:
      "Our Groq-powered AI agent continuously checks Web3 conditions on your behalf — wallets, prices, contracts, and more.",
    pulse: true,
    color: "#00d4aa",
  },
  {
    icon: Lock,
    step: "03",
    title: "0G records forever",
    description:
      "Every decision is written permanently to 0G decentralized storage. Tamper-proof, immutable, cryptographically verifiable.",
    color: "#b06cff",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 700px 400px at 50% 50%, rgba(124, 92, 252, 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            How it works
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[var(--virgil-text)] mb-4">
            Simple as writing a note.
            <br />
            <span className="gradient-text">Powerful as a blockchain.</span>
          </h2>
          <p className="text-[var(--virgil-text-secondary)] max-w-xl mx-auto text-lg">
            Three steps to permanent, trustless Web3 monitoring
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.3), transparent)" }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div
                className="card-glow rounded-2xl p-8 h-full"
                style={{ background: "var(--virgil-bg-card)" }}
              >
                {/* Step number */}
                <div
                  className="text-xs font-black tracking-widest mb-6 opacity-40"
                  style={{ color: step.color }}
                >
                  {step.step}
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>

                <h3 className="text-xl font-bold text-[var(--virgil-text)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--virgil-text-secondary)] text-sm leading-relaxed mb-5">
                  {step.description}
                </p>

                {/* Example */}
                {step.example && (
                  <div
                    className="rounded-xl p-3.5 text-xs font-mono leading-relaxed"
                    style={{
                      background: "rgba(124, 92, 252, 0.06)",
                      border: "1px solid rgba(124, 92, 252, 0.15)",
                      color: "var(--virgil-text-secondary)",
                    }}
                  >
                    {step.example}
                  </div>
                )}

                {/* Pulse indicator */}
                {step.pulse && (
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--virgil-success)] opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--virgil-success)]" />
                    </span>
                    <span className="text-xs font-semibold text-[var(--virgil-success)]">
                      Powered by Groq — Live monitoring
                    </span>
                  </div>
                )}

                {/* Arrow (non-last) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-16 w-6 h-6 rounded-full items-center justify-center z-10"
                    style={{ background: "var(--virgil-bg-elevated)", border: "1px solid var(--virgil-border-bright)" }}
                  >
                    <ArrowRight className="w-3 h-3 text-[var(--virgil-accent)]" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
