"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MarketIntel } from "@/types/orbit";

interface Props {
  marketIntel: MarketIntel | null;
  onSubmit: (data: { productName: string; productDescription: string; uniqueFeatures: string[]; targetMarket: string }) => void;
  error: string | null;
  limitReached?: boolean;
}

export function BrandFoundationForm({ marketIntel, onSubmit, error, limitReached }: Props) {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [uniqueFeatures, setUniqueFeatures] = useState(["", "", ""]);
  const [targetMarket, setTargetMarket] = useState("");

  function updateFeature(i: number, value: string) {
    setUniqueFeatures((p) => p.map((f, idx) => (idx === i ? value : f)));
  }

  function handleSubmit() {
    if (!productName.trim() || !productDescription.trim() || !targetMarket.trim()) return;
    onSubmit({ productName, productDescription, uniqueFeatures: uniqueFeatures.filter(Boolean), targetMarket });
  }

  const inputCls = "w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors";

  return (
    <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
      {marketIntel && (
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">From Market Intelligence</p>
          <div className="space-y-2">
            {marketIntel.whitespaceOpportunities?.slice(0, 2).map((opp, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                <p className="text-xs text-[var(--muted-foreground)]">{opp}</p>
              </div>
            ))}
          </div>
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
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Product Name <span className="text-[var(--primary)]">*</span></label>
        <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Orbit" className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Product Description <span className="text-[var(--primary)]">*</span></label>
        <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="What does your product do and who does it help?" rows={3} className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Unique Features <span className="text-[var(--muted-foreground)] font-normal">(up to 3)</span></label>
        <div className="space-y-2.5">
          {uniqueFeatures.map((f, i) => (
            <input key={i} value={f} onChange={(e) => updateFeature(i, e.target.value)} placeholder={`Feature ${i + 1}`} className={inputCls} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Target Market <span className="text-[var(--primary)]">*</span></label>
        <input value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="e.g. Marketing managers at B2B SaaS companies" className={inputCls} />
      </div>

      <button onClick={handleSubmit} className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
        Build Brand Foundation
      </button>
    </motion.div>
  );
}
