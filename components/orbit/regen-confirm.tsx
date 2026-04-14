"use client";

import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function RegenConfirm({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mt-2 shrink-0"
      >
        <RefreshCw size={13} /> Regenerate
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 border border-amber-500/30 rounded-lg px-3 py-2 bg-amber-500/5 flex items-center gap-2 shrink-0"
    >
      <AlertCircle size={12} className="text-amber-400 shrink-0" />
      <span className="text-xs text-amber-300">Uses 1 credit</span>
      <button
        onClick={() => setConfirming(false)}
        className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors ml-1"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          setConfirming(false);
          onConfirm();
        }}
        className="text-xs font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
      >
        Confirm
      </button>
    </motion.div>
  );
}
