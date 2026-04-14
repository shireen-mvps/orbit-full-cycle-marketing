"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrbitProject } from "@/types/orbit";

function getNextStep(p: OrbitProject): { label: string; href: string } {
  if (!p.market_intel)     return { label: "Start Market Intel",      href: `/projects/${p.id}/market-intel` };
  if (!p.brand_foundation) return { label: "Build Brand Foundation",  href: `/projects/${p.id}/brand-foundation` };
  if (!p.audience_studio)  return { label: "Generate Personas",       href: `/projects/${p.id}/audience-studio` };
  if (!p.campaign_plan)    return { label: "Plan Campaign",           href: `/projects/${p.id}/campaign-planner` };
  if (!p.content_studio)   return { label: "Create Content",          href: `/projects/${p.id}/content-studio` };
  return { label: "View Project", href: `/projects/${p.id}` };
}

function ModuleChip({ label, done, available }: { label: string; done: boolean; available: boolean }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${done ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : available ? "bg-white/8 text-[var(--muted-foreground)]" : "bg-white/4 text-white/20"}`}>
      {label}
    </span>
  );
}

interface Props {
  project: OrbitProject;
  index: number;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, index, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const m1 = !!project.market_intel;
  const m2 = !!project.brand_foundation;
  const m3 = !!project.audience_studio;
  const m4 = !!project.campaign_plan;
  const m5 = !!project.content_studio;
  const completed = [m1, m2, m3, m4, m5].filter(Boolean).length;
  const next = getNextStep(project);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      onDelete(project.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className="relative border border-[var(--border)] rounded-xl bg-[var(--card)] hover:border-white/15 transition-colors group overflow-hidden">
        {/* Main card content -- navigates to project */}
        <Link href={`/projects/${project.id}`} className="block p-5">
          <div className="flex items-start justify-between mb-4 pr-6">
            <h2 className="font-semibold text-[var(--foreground)] font-heading leading-snug">{project.name}</h2>
            <span className="text-xs text-[var(--muted-foreground)] shrink-0 ml-3">{completed}/5</span>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <ModuleChip label="M1" done={m1} available={true} />
            <ModuleChip label="M2" done={m2} available={m1} />
            <ModuleChip label="M3" done={m3} available={m2} />
            <ModuleChip label="M4" done={m4} available={m3} />
            <ModuleChip label="M5" done={m5} available={m4} />
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] group-hover:opacity-75 transition-opacity">
            {next.label} <ArrowRight size={13} />
          </div>
        </Link>

        {/* Delete button -- positioned top-right, does not trigger Link */}
        {!confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
            title="Delete project"
          >
            <Trash2 size={13} />
          </button>
        )}

        {/* Confirmation panel */}
        <AnimatePresence>
          {confirming && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-rose-500/20 bg-rose-500/5"
            >
              <div className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-[var(--foreground)]">
                    Delete <span className="font-semibold">{project.name}</span>? This cannot be undone.
                  </p>
                  <p className="text-xs text-rose-400/80">Credits used on this project are not refunded.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs px-3 py-1.5 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-60"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
