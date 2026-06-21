"use client";

import { motion } from "framer-motion";
import { PenLine, Activity, Lock } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    title: "You instruct",
    description:
      "Tell Virgil what to watch in plain English. No coding, no complex queries. Just describe what you want to monitor.",
    example: "Alert me if wallet 0x1234... moves more than 5 ETH",
  },
  {
    icon: Activity,
    title: "Virgil monitors",
    description:
      "Our AI agent continuously checks Web3 conditions on your behalf — watching wallets, prices, contracts, and more.",
    pulse: true,
  },
  {
    icon: Lock,
    title: "0G records forever",
    description:
      "Every decision is written permanently to 0G decentralized storage. Tamper-proof, immutable, and publicly verifiable.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[var(--virgil-bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--virgil-text)] mb-4">
            How It Works
          </h2>
          <p className="text-[var(--virgil-text-muted)] max-w-xl mx-auto">
            Three simple steps to permanent, trustless Web3 monitoring
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="relative"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-card border border-[var(--virgil-border-soft)] p-8 h-full hover:shadow-glow transition-shadow">
                {/* Step number */}
                <div className="absolute -top-3 -left-1 w-8 h-8 rounded-full bg-[var(--virgil-accent)] text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className="mb-6 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-[var(--virgil-glow)] flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-[var(--virgil-accent)]" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[var(--virgil-text)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--virgil-text-muted)] text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Example or pulse */}
                {step.example && (
                  <div className="bg-[var(--virgil-bg-alt)] rounded-lg p-3 text-xs font-mono text-[var(--virgil-text-muted)] border border-[var(--virgil-border-soft)]">
                    {step.example}
                  </div>
                )}

                {step.pulse && (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--virgil-success)] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--virgil-success)]" />
                    </span>
                    <span className="text-xs text-[var(--virgil-success)] font-medium">
                      Live monitoring
                    </span>
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
