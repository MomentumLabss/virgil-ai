"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock, Eye } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trustless",
    description:
      "Your audit trail lives on 0G decentralized storage — not our servers. No company controls your data.",
  },
  {
    icon: Clock,
    title: "Permanent",
    description:
      "Once written to 0G, no one can delete or alter a record. Not Virgil, not 0G Labs, not anyone.",
  },
  {
    icon: Eye,
    title: "Verifiable",
    description:
      "Anyone can verify any record with a public link. No account, no wallet, no trust required.",
  },
];

export function WhyVirgil() {
  return (
    <section className="py-24 bg-[var(--virgil-bg-alt)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--virgil-text)] mb-4">
            Why Virgil?
          </h2>
          <p className="text-[var(--virgil-text-muted)] max-w-xl mx-auto">
            The only Web3 agent with a permanent, trustless audit trail
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="bg-white/80 rounded-card border border-[var(--virgil-border-soft)] p-8 hover:-translate-y-0.5 transition-transform duration-150"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--virgil-glow)] flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-[var(--virgil-accent)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--virgil-text)] mb-3">
                {feature.title}
              </h3>
              <p className="text-[var(--virgil-text-muted)] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
