"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { COPILOT_SUGGESTIONS } from "@/lib/utils/constants";
import { CopilotMessage, Instruction, AgentRecord } from "@/types";

interface CopilotProps {
  walletAddress: string;
  instructions: Instruction[];
  recentRecords: AgentRecord[];
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span
        className="w-2 h-2 rounded-full bg-[var(--virgil-text-muted)] animate-bounce-dot"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-[var(--virgil-text-muted)] animate-bounce-dot"
        style={{ animationDelay: "160ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-[var(--virgil-text-muted)] animate-bounce-dot"
        style={{ animationDelay: "320ms" }}
      />
    </div>
  );
}

export function Copilot({ walletAddress, instructions, recentRecords }: CopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          walletAddress,
          context: { instructions, recentRecords },
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to get response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        if (isFirstChunk) {
          isFirstChunk = false;
          const assistantMsg: CopilotMessage = {
            role: "assistant",
            content: assistantContent,
            timestamp: Date.now(),
          };
          setMessages([...newMessages, assistantMsg]);
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: assistantContent,
            };
            return updated;
          });
        }
      }
    } catch {
      const errorMsg: CopilotMessage = {
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--virgil-accent)] text-white shadow-glow hover:bg-[var(--virgil-accent-warm)] active:scale-[0.98] transition-all"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Ask Virgil</span>
          </>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[480px] bg-white rounded-card border border-[var(--virgil-border-soft)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--virgil-border-soft)] bg-[var(--virgil-bg-alt)]">
              <div className="w-8 h-8 rounded-full bg-[var(--virgil-accent)] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--virgil-text)]">
                  Virgil Copilot
                </p>
                <p className="text-xs text-[var(--virgil-text-muted)]">
                  Powered by Claude
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--virgil-text-muted)] text-center">
                    Ask me about your agent activity
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COPILOT_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="px-3 py-1.5 rounded-full bg-[var(--virgil-glow)] text-xs text-[var(--virgil-accent)] hover:bg-[var(--virgil-pale)] transition-colors border border-[var(--virgil-pale)]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-[var(--virgil-accent)]"
                          : "bg-[var(--virgil-bg-alt)] border border-[var(--virgil-border-soft)]"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-[var(--virgil-accent)]" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--virgil-accent)] text-white rounded-br-md"
                          : "bg-[var(--virgil-bg-alt)] text-[var(--virgil-text)] rounded-bl-md border border-[var(--virgil-border-soft)]"
                      }`}
                    >
                      {msg.content || (
                        <span className="italic opacity-50">...</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[var(--virgil-bg-alt)] border border-[var(--virgil-border-soft)] flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 text-[var(--virgil-accent)]" />
                  </div>
                  <div className="bg-[var(--virgil-bg-alt)] rounded-2xl rounded-bl-md px-3.5 py-2 border border-[var(--virgil-border-soft)]">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-[var(--virgil-border-soft)] bg-white"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Virgil anything..."
                  className="flex-1 px-3 py-2 rounded-button border border-[var(--virgil-border-soft)] bg-[var(--virgil-bg)] text-sm text-[var(--virgil-text)] placeholder:text-[var(--virgil-text-muted)] focus:border-[var(--virgil-accent)] outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-button bg-[var(--virgil-accent)] text-white hover:bg-[var(--virgil-accent-warm)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
