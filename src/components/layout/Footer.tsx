"use client";

export function Footer() {
  return (
    <footer className="border-t border-[var(--virgil-border-soft)] bg-[var(--virgil-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--virgil-text-muted)]">
          <span className="font-medium">Virgil</span>
          <span className="flex items-center gap-1.5">
            Built on
            <span className="text-[var(--virgil-accent)] font-semibold">
              0G
            </span>
          </span>
          <span>Zero Cup 2026</span>
        </div>
      </div>
    </footer>
  );
}
