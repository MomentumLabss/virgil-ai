"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useAccount } from "wagmi";
import { COPILOT_SUGGESTIONS } from "@/lib/utils/constants";
import { CopilotMessage, Instruction, AgentRecord } from "@/types";
import { VirgilLogo } from "@/components/shared/VirgilLogo";

function FetchingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-3">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[var(--virgil-accent)] blur-xl opacity-20 animate-pulse rounded-full" />
        <VirgilLogo size={24} animated={true} />
      </div>
      <span className="text-xs font-medium text-[var(--virgil-accent)] animate-pulse">
        Fetching live blockchain data...
      </span>
    </div>
  );
}

export function CoVirgilChat() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [records] = useState<AgentRecord[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch contextual data on mount
  useEffect(() => {
    if (!address) return;
    
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/instructions?wallet=${address}`);
        if (res.ok) {
          const data = await res.json();
          setInstructions(data.instructions || []);
        }
      } catch (err) {
        console.error("Failed to fetch context", err);
      }
    };
    fetchData();
  }, [address]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isFetchingData]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !address) return;

    const userMsg: CopilotMessage = {
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsFetchingData(false);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          walletAddress: address,
          context: { instructions, recentRecords: records },
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

        if (assistantContent.includes("__TOOL_FETCHING__")) {
          setIsFetchingData(true);
          assistantContent = assistantContent.replace("__TOOL_FETCHING__", "");
          continue; // Wait for the real content
        } else if (assistantContent.length > 0 && isFetchingData) {
          setIsFetchingData(false);
        }

        if (assistantContent.length === 0) continue;

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
      setIsFetchingData(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!address) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-gray-500">Please connect your wallet to chat with CoVirgil.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--virgil-glow)] flex items-center justify-center border border-[var(--virgil-pale)]">
              <Bot className="w-8 h-8 text-[var(--virgil-accent)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CoVirgil</h2>
              <p className="text-gray-500">Powered by Llama 3.3. I can analyze your agent activity, wallet balances, and Web3 data.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {COPILOT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-4 py-2.5 rounded-full bg-white border border-[var(--virgil-border-soft)] text-sm text-gray-700 hover:border-[var(--virgil-accent)] hover:text-[var(--virgil-accent)] transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-[var(--virgil-accent)]"
                      : "bg-[var(--virgil-bg-alt)] border border-[var(--virgil-border-soft)]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-[var(--virgil-accent)]" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--virgil-accent)] text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border border-[var(--virgil-border-soft)] shadow-sm"
                  }`}
                >
                  {msg.content || <span className="italic opacity-50">...</span>}
                </div>
              </div>
            ))}
            
            {/* Custom Fetching Indicator */}
            {isFetchingData && (
              <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-[var(--virgil-bg-alt)] border border-[var(--virgil-border-soft)] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[var(--virgil-accent)]" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md border border-[var(--virgil-border-soft)] shadow-sm overflow-hidden">
                  <FetchingIndicator />
                </div>
              </div>
            )}

            {/* Standard Loading Indicator */}
            {isLoading && !isFetchingData && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-[var(--virgil-bg-alt)] border border-[var(--virgil-border-soft)] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[var(--virgil-accent)]" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-5 py-4 border border-[var(--virgil-border-soft)] shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--virgil-text-muted)] animate-bounce-dot" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--virgil-text-muted)] animate-bounce-dot" style={{ animationDelay: "160ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--virgil-text-muted)] animate-bounce-dot" style={{ animationDelay: "320ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-3"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CoVirgil to analyze something..."
                className="w-full px-5 py-4 rounded-xl border border-[var(--virgil-border-soft)] bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-[var(--virgil-accent)] focus:bg-white outline-none shadow-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-4 rounded-xl bg-[var(--virgil-accent)] text-white hover:bg-[var(--virgil-accent-warm)] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              CoVirgil can make mistakes. Consider verifying critical data on block explorers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
