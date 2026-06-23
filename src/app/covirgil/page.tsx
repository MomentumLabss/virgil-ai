import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CoVirgilChat } from "@/components/copilot/CoVirgilChat";

export const metadata = {
  title: "CoVirgil | Virgil AI",
  description: "Chat with CoVirgil to analyze your Web3 activity.",
};

export default function CoVirgilPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--virgil-bg)]">
      <Navbar />

      <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--virgil-accent)] border-t-transparent animate-spin" />
          </div>
        }>
          <CoVirgilChat />
        </Suspense>
      </div>
    </main>
  );
}
