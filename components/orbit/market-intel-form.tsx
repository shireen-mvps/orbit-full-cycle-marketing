"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export interface CompetitorInput { name: string; description: string; }

interface Props {
  onSubmit: (data: { industry: string; productCategory: string; competitors: CompetitorInput[] }) => void;
  error: string | null;
  limitReached?: boolean;
}

export function MarketIntelForm({ onSubmit, error, limitReached }: Props) {
  const [industry, setIndustry] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorInput[]>([{ name: "", description: "" }, { name: "", description: "" }]);

  function addCompetitor() {
    if (competitors.length >= 5) return;
    setCompetitors((p) => [...p, { name: "", description: "" }]);
  }
  function removeCompetitor(i: number) {
    if (competitors.length <= 1) return;
    setCompetitors((p) => p.filter((_, idx) => idx !== i));
  }
  function updateCompetitor(i: number, field: keyof CompetitorInput, value: string) {
    setCompetitors((p) => p.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  }

  function handleSubmit() {
    const validCompetitors = competitors.filter((c) => c.name.trim());
    if (!industry.trim() || !productCategory.trim() || validCompetitors.length < 1) return;
    onSubmit({ industry, productCategory, competitors: validCompetitors });
  }

  const inputCls = "w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors";

  return (
    <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Industry <span className="text-[var(--primary)]">*</span></label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. SaaS, E-commerce, Health" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Product Category <span className="text-[var(--primary)]">*</span></label>
          <input value={productCategory} onChange={(e) => setProductCategory(e.target.value)} placeholder="e.g. Project management tools" className={inputCls} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-[var(--foreground)]">Competitors <span className="text-[var(--primary)]">*</span></label>
          <span className="text-xs text-[var(--muted-foreground)]">{competitors.length} / 5</span>
        </div>
        <div className="space-y-2.5">
          {competitors.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={c.name} onChange={(e) => updateCompetitor(i, "name", e.target.value)} placeholder={`Competitor ${i + 1}`} className={inputCls} />
                <input value={c.description} onChange={(e) => updateCompetitor(i, "description", e.target.value)} placeholder="What they do (optional)" className={inputCls} />
              </div>
              {competitors.length > 1 && (
                <button onClick={() => removeCompetitor(i)} className="mt-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        {competitors.length < 5 && (
          <button onClick={addCompetitor} className="mt-3 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
            <Plus size={13} /> Add competitor
          </button>
        )}
      </div>

      <button onClick={handleSubmit} className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
        Analyze Market
      </button>
    </motion.div>
  );
}
