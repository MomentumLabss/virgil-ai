"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, MessageCircle } from "lucide-react";
import { showToast } from "@/components/shared/Toast";

export function TelegramConnect({ walletAddress }: { walletAddress: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/telegram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress })
      });
      if (res.ok) {
        const data = await res.json();
        setCode(data.code);
      } else {
        showToast("Failed to generate code", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(`/link ${code}`);
    setCopied(true);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--virgil-card)] border border-[var(--virgil-border)] rounded-xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-medium text-[var(--virgil-text)]">
          Connect Telegram
        </h3>
      </div>
      <p className="text-sm text-[var(--virgil-text-muted)] mb-4">
        Receive instant push notifications for your instructions, and chat with CoVirgil on the go!
      </p>

      {!code ? (
        <button
          onClick={generateCode}
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          Generate Link Code
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/20 border border-[var(--virgil-border)] rounded-lg p-4"
        >
          <p className="text-xs text-[var(--virgil-text-muted)] mb-2 uppercase tracking-wider font-semibold">
            Message the bot
          </p>
          <p className="text-sm text-[var(--virgil-text)] mb-3">
            Open Telegram and send this exact message to <a href="https://t.me/VirgilAIBot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium">@VirgilAIBot</a>:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/30 px-3 py-2 rounded-md text-[#2AABEE] font-mono text-sm border border-[#2AABEE]/20">
              /link {code}
            </code>
            <button
              onClick={copyCode}
              className="p-2 hover:bg-white/5 rounded-md transition-colors text-[var(--virgil-text-muted)] hover:text-[var(--virgil-text)]"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-[var(--virgil-text-muted)] mt-3">
            Code expires in 10 minutes.
          </p>
        </motion.div>
      )}
    </div>
  );
}
