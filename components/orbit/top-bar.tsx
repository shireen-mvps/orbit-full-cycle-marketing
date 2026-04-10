"use client";

import { Menu } from "lucide-react";
import { useCredits, CREDITS_TOTAL } from "@/context/credits-context";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { remaining } = useCredits();
  const used = remaining !== null ? CREDITS_TOTAL - remaining : null;
  const pct = used !== null ? Math.min((used / CREDITS_TOTAL) * 100, 100) : 0;

  return (
    <header className="h-12 border-b border-[var(--border)] flex items-center px-4 gap-4 shrink-0 bg-[var(--background)]">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Usage meter — centered */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted-foreground)]">AI credits</span>
          <div className="w-28 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
              style={{ width: used !== null ? `${pct}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
            {used !== null ? `${used} / ${CREDITS_TOTAL}` : `-- / ${CREDITS_TOTAL}`}
          </span>
        </div>
      </div>

      {/* Spacer to balance hamburger on mobile */}
      <div className="w-7 md:hidden" />
    </header>
  );
}
