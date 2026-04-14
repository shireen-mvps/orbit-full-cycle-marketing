"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { BrandFoundation, CampaignConcept } from "@/types/orbit";

const FORMAT_OPTIONS = [
  "Instagram Post",
  "LinkedIn Post",
  "Email Newsletter",
  "Facebook Ad",
  "Google Search Ad",
  "Blog Intro",
  "X/Twitter Post",
];

interface Props {
  selectedConcept: CampaignConcept | null;
  brandFoundation: BrandFoundation | null;
  onSubmit: (data: { formats: string[] }) => void;
  error: string | null;
  limitReached?: boolean;
}

export function ContentStudioForm({ selectedConcept, brandFoundation, onSubmit, error, limitReached }: Props) {
  const [formats, setFormats] = useState<string[]>(["Instagram Post", "LinkedIn Post", "Email Newsletter"]);

  function toggleFormat(format: string) {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  }

  function handleSubmit() {
    if (formats.length === 0) return;
    onSubmit({ formats });
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {selectedConcept && (
        <div className="border border-[var(--primary)]/30 rounded-xl p-4 bg-[var(--primary)]/5">
          <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] mb-2 font-heading">
            Campaign Concept
          </p>
          <p className="text-sm font-heading font-bold text-[var(--foreground)] mb-1">
            {selectedConcept.name}
          </p>
          <p className="text-xs italic text-[var(--muted-foreground)]">&ldquo;{selectedConcept.hook}&rdquo;</p>
        </div>
      )}

      {brandFoundation?.brandVoice && brandFoundation.brandVoice.length > 0 && (
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
            Brand Voice
          </p>
          <div className="flex flex-wrap gap-1.5">
            {brandFoundation.brandVoice.map((v, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[var(--muted-foreground)]"
              >
                {v}
              </span>
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
      {error && !limitReached && (
        <div className="border border-destructive/40 bg-destructive/10 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
          Content Formats <span className="text-[var(--primary)]">*</span>
        </label>
        <p className="text-xs text-[var(--muted-foreground)] mb-3">
          Select the formats you want copy written for. All 7 formats will appear in the repurposing matrix.
        </p>
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => toggleFormat(fmt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                formats.includes(fmt)
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
        {formats.length === 0 && (
          <p className="text-xs text-red-400 mt-2">Select at least one format.</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={formats.length === 0}
        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Generate Content
      </button>
    </motion.div>
  );
}
