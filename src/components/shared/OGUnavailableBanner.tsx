"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function OGUnavailableBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOgError = () => {
      if (!sessionStorage.getItem("og-banner-dismissed")) {
        setIsVisible(true);
      }
    };

    window.addEventListener("og-error", handleOgError);

    // Automatically detect 0G network errors from API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          const clone = response.clone();
          clone.text().then(text => {
            if (text.includes("0G") || text.includes("OGError")) {
              window.dispatchEvent(new Event("og-error"));
            }
          }).catch(() => {});
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.removeEventListener("og-error", handleOgError);
      window.fetch = originalFetch;
    };
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("og-banner-dismissed", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-3 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-amber-800">
                <span className="font-medium">0G Storage is currently unreachable.</span>{" "}
                Agent records cannot be saved or verified until connectivity is
                restored. This is not a Virgil server issue - it is 0G&apos;s
                decentralized network.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-[#F59E0B]/20 rounded-md transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-amber-800" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
