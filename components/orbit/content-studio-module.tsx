"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type { BrandFoundation, CampaignPlan, ContentStudio } from "@/types/orbit";
import { ContentStudioForm } from "./content-studio-form";
import { ContentStudioResults } from "./content-studio-results";
import { ModuleLoading } from "./module-loading";
import { RegenConfirm } from "./regen-confirm";
import { useCredits } from "@/context/credits-context";

const LOADING_STEPS = [
  "Loading campaign concept...",
  "Calibrating brand voice...",
  "Writing for your persona...",
  "Generating copy variants...",
  "Building repurposing matrix...",
];

type View = "form" | "loading" | "results";

interface Props {
  projectId: string;
  projectName: string;
  initialData: ContentStudio | null;
  campaignPlan: CampaignPlan;
  brandFoundation: BrandFoundation | null;
}

export function ContentStudioModule({
  projectId,
  projectName,
  initialData,
  campaignPlan,
  brandFoundation,
}: Props) {
  const [view, setView] = useState<View>(initialData ? "results" : "form");
  const [results, setResults] = useState<ContentStudio | null>(initialData);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const { update: updateCredits } = useCredits();

  async function handleSubmit(data: { formats: string[] }) {
    setError(null);
    setLimitReached(false);
    setView("loading");
    setLoadingStep(0);
    const interval = setInterval(
      () => setLoadingStep((p) => Math.min(p + 1, LOADING_STEPS.length - 1)),
      1800
    );
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, ...data }),
      });
      clearInterval(interval);
      if (!res.ok) {
        if (res.status === 429) {
          setLimitReached(true);
        } else {
          const err = await res.json();
          setError(err.error ?? "Something went wrong. Please try again.");
        }
        setView("form");
        return;
      }
      const creditsHeader = res.headers.get("X-Credits-Remaining");
      if (creditsHeader !== null) updateCredits(Number(creditsHeader));
      const { data: result } = await res.json();
      setResults(result);
      setView("results");
    } catch {
      clearInterval(interval);
      setError("Network error. Please try again.");
      setView("form");
    }
  }

  const selectedIndex = campaignPlan.selectedConcept;
  const selectedConcept =
    selectedIndex !== null && selectedIndex !== undefined
      ? campaignPlan.concepts?.[selectedIndex]
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
      {/* Ambient decorative orbs */}
      <div
        className="absolute -top-4 -right-4 w-80 h-80 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none select-none animate-pulse"
        style={{ animationDuration: "6s" }}
      />
      <div
        className="absolute top-20 right-28 w-44 h-44 rounded-full bg-rose-500/4 blur-3xl pointer-events-none select-none animate-pulse"
        style={{ animationDuration: "11s", animationDelay: "4s" }}
      />

      <div className="mb-8 relative">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-5"
        >
          <ArrowLeft size={14} /> {projectName}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
              Module 5
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)]">
              Content Studio
            </h1>
          </div>
          {view === "results" && <RegenConfirm onConfirm={() => setView("form")} />}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "form" && (
          <ContentStudioForm
            key="form"
            selectedConcept={selectedConcept}
            brandFoundation={brandFoundation}
            onSubmit={handleSubmit}
            error={error}
            limitReached={limitReached}
          />
        )}
        {view === "loading" && (
          <ModuleLoading key="loading" loadingStep={loadingStep} steps={LOADING_STEPS} />
        )}
        {view === "results" && results && (
          <ContentStudioResults
            key="results"
            results={results}
            projectId={projectId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
