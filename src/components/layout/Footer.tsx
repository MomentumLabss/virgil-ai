"use client";

import { Github, ExternalLink } from "lucide-react";
import { VirgilLogo } from "@/components/shared/VirgilLogo";

export function Footer() {
  return (
    <footer
      className="relative border-t"
      style={{
        background: "var(--virgil-bg-alt)",
        borderColor: "rgba(124, 92, 252, 0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <VirgilLogo size={24} animated={false} />
            <span className="font-bold text-[var(--virgil-text)]">Virgil</span>
            <span className="text-[var(--virgil-text-muted)] text-sm">— Verifiable AI Agent Executor</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-sm text-[var(--virgil-text-muted)]">
            <a
              href="https://github.com/MomentumLabss/virgil-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--virgil-accent)] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="https://0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--virgil-accent)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              0G Network
            </a>
            <span
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{
                background: "rgba(124, 92, 252, 0.1)",
                color: "#b06cff",
                border: "1px solid rgba(124, 92, 252, 0.2)",
              }}
            >
              Zero Cup 2026
            </span>
          </div>
        </div>

        <div
          className="mt-8 pt-6 border-t text-center text-xs text-[var(--virgil-text-muted)]"
          style={{ borderColor: "rgba(124, 92, 252, 0.08)" }}
        >
          Built on 0G — The Decentralized AI Infrastructure · MIT License
        </div>
      </div>
    </footer>
  );
}
