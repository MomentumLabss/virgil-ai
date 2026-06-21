import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--virgil-bg)] px-4">
      <div className="text-center space-y-6">
        <Shield className="w-16 h-16 text-[var(--virgil-accent)] mx-auto opacity-50" />
        <h1 className="text-4xl font-bold text-[var(--virgil-text)]">404</h1>
        <p className="text-[var(--virgil-text-muted)] max-w-md">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-button bg-[var(--virgil-accent)] text-white font-medium hover:bg-[var(--virgil-accent-warm)] active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
