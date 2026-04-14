"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, CheckCheck } from "lucide-react";
import type { ContentStudio } from "@/types/orbit";

interface Props {
  results: ContentStudio;
  projectId: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-slate-400 hover:text-[var(--foreground)] hover:bg-white/8 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <CheckCheck size={13} className="text-[var(--primary)]" /> : <Copy size={13} />}
    </button>
  );
}

export function ContentStudioResults({ results, projectId }: Props) {
  const { variants, repurposeMatrix, selectedConceptName } = results;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      {/* Copy Variants */}
      {variants?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-4 font-heading">
            Copy Variants
          </p>
          <div className="space-y-4">
            {variants.map((variant, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] font-heading font-semibold">
                    {variant.format}
                  </p>
                  <CopyButton
                    text={`${variant.headline}\n\n${variant.body}\n\n${variant.cta}`}
                  />
                </div>
                <p className="text-base font-heading font-bold text-[var(--foreground)] mb-2.5 leading-snug">
                  {variant.headline}
                </p>
                <p className="text-sm text-slate-200 leading-relaxed mb-3">
                  {variant.body}
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold">
                  {variant.cta}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Repurposing Matrix */}
      {repurposeMatrix?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1 font-heading">
            Repurposing Matrix
          </p>
          <p className="text-sm text-slate-300 mb-4">
            How &ldquo;{selectedConceptName}&rdquo; adapts across channels
          </p>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[150px_1fr] bg-white/4 border-b border-[var(--border)]">
              <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] font-heading">
                Format
              </div>
              <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] font-heading border-l border-[var(--border)]">
                Core Adaptation
              </div>
            </div>
            {repurposeMatrix.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[150px_1fr] border-b border-[var(--border)] last:border-b-0 ${
                  i % 2 === 0 ? "bg-[var(--card)]" : "bg-white/3"
                }`}
              >
                <div className="px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                  {row.format}
                </div>
                <div className="px-4 py-3 text-sm text-slate-200 leading-relaxed border-l border-[var(--border)]">
                  {row.adaptation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border border-[var(--primary)]/20 rounded-xl p-4 bg-[var(--primary)]/5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Strategy complete</p>
          <p className="text-sm text-slate-300 mt-0.5">
            Research, brand, personas, campaign, and content are ready. Download your full report.
          </p>
        </div>
        <Link
          href={`/projects/${projectId}`}
          className="shrink-0 border border-[var(--border)] text-[var(--foreground)] px-4 py-2 rounded-lg text-sm font-semibold hover:border-[var(--primary)]/50 transition-colors whitespace-nowrap"
        >
          View project
        </Link>
      </div>
    </motion.div>
  );
}
