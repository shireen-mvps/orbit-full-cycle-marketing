"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { CampaignPlan } from "@/types/orbit";

const CONCEPT_COLORS = [
  { border: "border-[var(--primary)]/40", bg: "bg-[var(--primary)]/5", badge: "bg-[var(--primary)]/20 text-[var(--primary)]" },
  { border: "border-violet-500/40",       bg: "bg-violet-500/5",       badge: "bg-violet-500/20 text-violet-400" },
  { border: "border-amber-500/40",        bg: "bg-amber-500/5",        badge: "bg-amber-500/20 text-amber-400" },
];

interface Props {
  results: CampaignPlan;
  projectId: string;
  onConceptSelect: (index: number) => void;
}

export function CampaignPlannerResults({ results, projectId, onConceptSelect }: Props) {
  const [selectedConcept, setSelectedConcept] = useState<number | null>(
    results.selectedConcept ?? null
  );
  const [saving, setSaving] = useState(false);

  async function selectConcept(index: number) {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_plan: { ...results, selectedConcept: index },
        }),
      });
      setSelectedConcept(index);
      onConceptSelect(index);
    } finally {
      setSaving(false);
    }
  }

  const { brief, messageArchitecture, channelMix, concepts } = results;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Campaign Brief */}
      <div className="border border-[var(--primary)]/30 rounded-xl p-5 bg-[var(--primary)]/5">
        <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] mb-3 font-heading">
          Campaign Brief
        </p>
        <h2 className="text-xl font-heading font-bold text-[var(--foreground)] mb-4">
          {brief.campaignTitle}
        </h2>
        <div className="space-y-3 text-sm">
          <p className="text-[var(--foreground)] leading-relaxed">
            <span className="font-semibold">Objective: </span>
            {brief.objectiveStatement}
          </p>
          <p className="text-[var(--foreground)] leading-relaxed">
            <span className="font-semibold">Primary message: </span>
            {brief.primaryMessage}
          </p>
          <p className="text-[var(--foreground)] leading-relaxed">
            <span className="font-semibold">Target segment: </span>
            {brief.targetSegment}
          </p>
          {brief.keyInsight && (
            <p className="italic text-slate-300 border-l-2 border-[var(--primary)]/40 pl-3 leading-relaxed">
              {brief.keyInsight}
            </p>
          )}
          {brief.successMetrics?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {brief.successMetrics.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-xs text-slate-300"
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Architecture */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-4 font-heading">
          Message Architecture
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="border border-[var(--primary)]/30 rounded-xl p-4 bg-[var(--primary)]/5">
            <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] mb-2 font-heading">
              Hero Message
            </p>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              {messageArchitecture.primaryMessage}
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
              Supporting Points
            </p>
            <ol className="space-y-2">
              {messageArchitecture.supportingMessages?.map((msg, i) => (
                <li key={i} className="text-sm text-[var(--foreground)] flex gap-2 leading-relaxed">
                  <span className="text-[var(--primary)] font-bold shrink-0">{i + 1}.</span>
                  {msg}
                </li>
              ))}
            </ol>
          </div>
          <div className="border border-amber-500/20 rounded-xl p-4 bg-amber-500/5">
            <p className="text-[10px] uppercase tracking-widest text-amber-400 mb-2 font-heading">
              Objection Handlers
            </p>
            <ul className="space-y-2">
              {messageArchitecture.objectionHandlers?.map((obj, i) => (
                <li key={i} className="text-sm text-[var(--foreground)] leading-relaxed">
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Channel Mix */}
      {channelMix?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-4 font-heading">
            Channel Mix
          </p>
          <div className="space-y-3">
            {channelMix.map((ch, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{ch.channel}</span>
                  <span className="text-sm font-bold text-[var(--primary)]">{ch.budgetPercent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 mb-2.5">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-700"
                    style={{ width: `${ch.budgetPercent}%` }}
                  />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{ch.rationale}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Concepts */}
      {concepts?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-4 font-heading">
            Campaign Concepts
          </p>
          <div className="space-y-4">
            {concepts.map((concept, i) => {
              const colors = CONCEPT_COLORS[i % CONCEPT_COLORS.length];
              const isSelected = selectedConcept === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`border rounded-xl p-5 transition-all ${
                    isSelected ? `${colors.border} ${colors.bg}` : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.badge}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <h3 className="font-heading font-bold text-[var(--foreground)] text-base">{concept.name}</h3>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0 mt-0.5" />}
                  </div>
                  <p className="text-base italic text-[var(--foreground)] mb-3 leading-snug">
                    &ldquo;{concept.hook}&rdquo;
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {concept.angle}
                  </p>
                  <p className="text-sm text-[var(--foreground)] mb-4 leading-relaxed">
                    <span className="font-semibold">Core message: </span>
                    {concept.coreMessage}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold">
                      {concept.cta}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/8 text-xs text-slate-300">
                      {concept.personaTarget}
                    </span>
                  </div>
                  {!isSelected && (
                    <button
                      onClick={() => selectConcept(i)}
                      disabled={saving}
                      className="mt-4 w-full border border-[var(--border)] rounded-lg py-2 text-sm font-medium text-slate-300 hover:text-[var(--foreground)] hover:border-[var(--primary)]/50 transition-colors"
                    >
                      Select this concept
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {selectedConcept !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-[var(--primary)]/30 rounded-xl p-4 bg-[var(--primary)]/5 flex items-center justify-between gap-4"
        >
          <p className="text-sm text-[var(--foreground)]">
            Concept <strong>{String.fromCharCode(65 + selectedConcept)}</strong> selected. Ready to generate content.
          </p>
          <Link
            href={`/projects/${projectId}/content-studio`}
            className="shrink-0 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Content Studio &rarr;
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
