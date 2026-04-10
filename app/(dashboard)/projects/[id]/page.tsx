import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ModuleCard } from "@/components/orbit/module-card";
import { Download } from "lucide-react";
import type { OrbitProject } from "@/types/orbit";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { data: project, error } = await supabase
    .from("orbit_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single<OrbitProject>();

  if (error || !project) redirect("/dashboard");

  const m1 = !!project.market_intel;
  const m2 = !!project.brand_foundation;
  const m3 = !!project.audience_studio;

  const modules = [
    {
      number: 1,
      title: "Market Intelligence",
      description:
        "Analyze competitors, map market positioning, and surface whitespace opportunities.",
      href: `/projects/${id}/market-intel`,
      locked: false,
      complete: m1,
    },
    {
      number: 2,
      title: "Brand Foundation",
      description:
        "Build your positioning statement, value proposition, and messaging pillars grounded in market data.",
      href: `/projects/${id}/brand-foundation`,
      locked: !m1,
      complete: m2,
    },
    {
      number: 3,
      title: "Audience Studio",
      description:
        "Generate detailed buyer personas using your brand positioning and market intelligence.",
      href: `/projects/${id}/audience-studio`,
      locked: !m2,
      complete: m3,
    },
  ];

  const completed = [m1, m2, m3].filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
          Project
        </p>
        <h1 className="text-3xl font-heading font-bold text-[var(--foreground)]">
          {project.name}
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-2">
          {completed === 0
            ? "Start with Module 1 to begin building your marketing strategy."
            : completed === 3
            ? "All modules complete."
            : `${completed} of 3 modules complete.`}
        </p>
      </div>

      {/* Module sequence */}
      <div className="space-y-3">
        {modules.map((mod) => (
          <ModuleCard key={mod.number} {...mod} />
        ))}
      </div>

      {/* Export — only when all 3 modules complete */}
      {completed === 3 && (
        <div className="mt-8 pt-8 border-t border-[var(--border)] flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Strategy report ready</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Download a polished PDF of your full market strategy.</p>
          </div>
          <a
            href={`/api/projects/${id}/export`}
            className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            <Download size={14} />
            Export PDF
          </a>
        </div>
      )}
    </div>
  );
}
