"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { BrandFoundation } from "@/types/orbit";

interface Props {
  brandFoundation: BrandFoundation | null;
  onSubmit: (data: { targetMarketDescription: string; painPoints: string; channels: string }) => void;
  error: string | null;
  limitReached?: boolean;
}

export function AudienceStudioForm({ brandFoundation, onSubmit, error, limitReached }: Props) {
  const [targetMarketDescription, setTargetMarketDescription] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [channels, setChannels] = useState("");

  function handleSubmit() {
    if (!targetMarketDescription.trim()) return;
    onSubmit({ targetMarketDescription, painPoints, channels });
  }

  const inputCls = "w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors";

  return (
    <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
      {brandFoundation && (
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">From Brand Foundation</p>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{brandFoundation.valueProp}</p>
          {brandFoundation.brandVoice?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {brandFoundation.brandVoice.map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[var(--muted-foreground)]">{v}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {limitReached && (
        <div className="border border-destructive/40 bg-destructive/10 rounded-lg px-4 py-3 text-sm text-red-400">
          Demo limit reached (5 credits).{" "}
          <a href="https://github.com/shireen-mvps/orbit-full-cycle-marketing" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-300 transition-colors">
            Clone the repo
          </a>{" "}
          to run your own instance.
        </div>
      )}
      {error && !limitReached && <div className="border border-destructive/40 bg-destructive/10 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Target Market Description <span className="text-[var(--primary)]">*</span></label>
        <textarea value={targetMarketDescription} onChange={(e) => setTargetMarketDescription(e.target.value)} placeholder="Describe your target audience -- who are they, what do they do, what's their context?" rows={3} className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Known Pain Points <span className="text-[var(--muted-foreground)] font-normal">(optional)</span></label>
        <textarea value={painPoints} onChange={(e) => setPainPoints(e.target.value)} placeholder="Any specific pain points you've already observed or researched" rows={2} className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Channels They Use <span className="text-[var(--muted-foreground)] font-normal">(optional)</span></label>
        <input value={channels} onChange={(e) => setChannels(e.target.value)} placeholder="e.g. LinkedIn, Instagram, email newsletters, industry blogs" className={inputCls} />
      </div>

      <button onClick={handleSubmit} className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
        Generate Personas
      </button>
    </motion.div>
  );
}
