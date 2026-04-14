"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AudienceStudio, BrandFoundation } from "@/types/orbit";

const CHANNEL_OPTIONS = [
  "Instagram",
  "LinkedIn",
  "Email",
  "Google Ads",
  "Facebook",
  "TikTok",
  "Content/SEO",
];

const BUDGET_OPTIONS = [
  { value: "bootstrap", label: "Bootstrap", sub: "Under $1K" },
  { value: "growth", label: "Growth", sub: "$1K – $10K" },
  { value: "scale", label: "Scale", sub: "$10K+" },
];

interface Props {
  brandFoundation: BrandFoundation | null;
  audienceStudio: AudienceStudio | null;
  onSubmit: (data: {
    objective: string;
    timeline: string;
    budgetTier: string;
    channels: string[];
  }) => void;
  error: string | null;
  limitReached?: boolean;
}

export function CampaignPlannerForm({ brandFoundation, audienceStudio, onSubmit, error, limitReached }: Props) {
  const [objective, setObjective] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budgetTier, setBudgetTier] = useState("growth");
  const [channels, setChannels] = useState<string[]>([]);

  function toggleChannel(channel: string) {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : prev.length < 5
        ? [...prev, channel]
        : prev
    );
  }

  function handleSubmit() {
    if (!objective.trim() || !timeline.trim()) return;
    onSubmit({ objective, timeline, budgetTier, channels });
  }

  const inputCls =
    "w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors";

  const primaryPersona = audienceStudio?.personas?.[0];

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {(brandFoundation || primaryPersona) && (
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)] space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] font-heading">
            Campaign Context
          </p>
          {brandFoundation?.positioningStatement && (
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              <span className="text-[var(--foreground)] font-medium">Position: </span>
              {brandFoundation.positioningStatement}
            </p>
          )}
          {primaryPersona && (
            <p className="text-xs text-[var(--muted-foreground)]">
              <span className="text-[var(--foreground)] font-medium">Primary persona: </span>
              {primaryPersona.name}, {primaryPersona.role}
            </p>
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
      {error && !limitReached && (
        <div className="border border-destructive/40 bg-destructive/10 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Campaign Objective <span className="text-[var(--primary)]">*</span>
        </label>
        <textarea
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="e.g. Launch new product to first-time buyers and generate 200 leads in Q3"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Timeline <span className="text-[var(--primary)]">*</span>
        </label>
        <input
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          placeholder="e.g. 8 weeks, Q3 July-September, 3 months"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Budget Tier <span className="text-[var(--primary)]">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBudgetTier(opt.value)}
              className={`border rounded-lg px-3 py-2.5 text-left transition-colors ${
                budgetTier === opt.value
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50"
              }`}
            >
              <p className="text-sm font-medium text-[var(--foreground)]">{opt.label}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Priority Channels{" "}
          <span className="text-[var(--muted-foreground)] font-normal">(select up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map((ch) => (
            <button
              key={ch}
              onClick={() => toggleChannel(ch)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                channels.includes(ch)
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Build Campaign Plan
      </button>
    </motion.div>
  );
}
