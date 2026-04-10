"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { BarChart3, Layers, Users, ArrowRight, ChevronRight } from "lucide-react";

/* ─── animation variants ─────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: "easeOut" as const } },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

/* ─── data ───────────────────────────────────────────────── */
const modules = [
  {
    number: "01",
    icon: BarChart3,
    label: "Market Intelligence",
    description:
      "Map your competitive landscape. Orbit plots every rival on a positioning quadrant and surfaces the whitespace your brand can own.",
    tags: ["Competitive Analysis", "Gap Detection", "Positioning"],
  },
  {
    number: "02",
    icon: Layers,
    label: "Brand Foundation",
    description:
      "Turn market gaps into brand strategy. Generate your positioning statement, messaging pillars, brand voice, and tagline options in one pass.",
    tags: ["Positioning", "Messaging", "Voice & Tone"],
  },
  {
    number: "03",
    icon: Users,
    label: "Audience Studio",
    description:
      "Build three high-fidelity buyer personas grounded in your brand strategy — with pain points, buying triggers, objections, and ad hooks.",
    tags: ["Persona Generation", "Psychographics", "Ad Copy"],
  },
];

const steps = [
  { n: "1", title: "Create a project", body: "Name your product. Orbit sets up a workspace and tracks your progress through each phase." },
  { n: "2", title: "Run Market Intelligence", body: "Enter your industry, product category, and up to five competitors. Orbit returns a full competitive map." },
  { n: "3", title: "Build your brand", body: "Feed the market gaps into Brand Foundation, then generate your audience personas in Audience Studio." },
];

/* ─── sub-components ─────────────────────────────────────── */

function GlowButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* glow layer */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "radial-gradient(ellipse at center, oklch(0.72 0.16 185 / 0.45) 0%, transparent 70%)",
          filter: "blur(12px)",
          transform: "scale(1.3)",
        }}
      />
      {/* border pulse */}
      <span className="absolute inset-0 rounded-full border border-[oklch(0.72_0.16_185/_0.6)] group-hover:border-[oklch(0.72_0.16_185)] transition-colors duration-300" />
      <span
        className="relative flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide"
        style={{
          background: "oklch(0.72 0.16 185 / 0.12)",
          color: "oklch(0.72 0.16 185)",
        }}
      >
        {children}
      </span>
    </motion.div>
  );
}

function ModuleCard({ mod, index }: { mod: typeof modules[0]; index: number }) {
  const Icon = mod.icon;
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
      className="group relative flex flex-col gap-5 rounded-2xl p-7 overflow-hidden"
      style={{
        background: "oklch(0.12 0.009 265)",
        border: "1px solid oklch(1 0 0 / 0.07)",
      }}
    >
      {/* teal glow on hover */}
      <span
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.18) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      {/* rotating border highlight on hover */}
      <span
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, oklch(0.72 0.16 185 / 0.12) 0%, transparent 50%, oklch(0.72 0.16 185 / 0.06) 100%)",
        }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl"
          style={{ background: "oklch(0.72 0.16 185 / 0.12)" }}
        >
          <Icon size={20} style={{ color: "oklch(0.72 0.16 185)" }} strokeWidth={1.5} />
        </div>
        <span
          className="font-mono text-xs tracking-widest"
          style={{ color: "oklch(0.72 0.16 185 / 0.5)" }}
        >
          {mod.number}
        </span>
      </div>

      <div className="relative flex flex-col gap-3">
        <h3
          className="text-lg font-semibold leading-snug"
          style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}
        >
          {mod.label}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.82 0.012 260)" }}>
          {mod.description}
        </p>
      </div>

      <div className="relative flex flex-wrap gap-2 mt-auto">
        {mod.tags.map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 rounded-md text-xs font-medium"
            style={{
              background: "oklch(0.72 0.16 185 / 0.08)",
              color: "oklch(0.72 0.16 185 / 0.85)",
              border: "1px solid oklch(0.72 0.16 185 / 0.15)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function StepRow({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" as const }}
      className="flex gap-6 items-start"
    >
      <div
        className="flex-none flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0"
        style={{
          background: "oklch(0.72 0.16 185 / 0.12)",
          color: "oklch(0.72 0.16 185)",
          border: "1px solid oklch(0.72 0.16 185 / 0.3)",
          fontFamily: "var(--font-syne)",
        }}
      >
        {step.n}
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        <h4
          className="font-semibold text-base"
          style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}
        >
          {step.title}
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.78 0.015 260)" }}>
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── page ───────────────────────────────────────────────── */
export default function LandingPage() {
  const modulesRef = useRef(null);
  const modulesInView = useInView(modulesRef, { once: true, margin: "-100px" });

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: "oklch(0.09 0.008 265)", color: "oklch(0.93 0.006 260)" }}
    >
      {/* ── background grid + orbs ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {/* dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* teal orb — top left */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "float1 12s ease-in-out infinite",
          }}
        />
        {/* teal orb — bottom right */}
        <div
          className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.09) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "float2 16s ease-in-out infinite",
          }}
        />
        {/* mid accent orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.05) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "float3 20s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.72 0.16 185)", boxShadow: "0 0 16px oklch(0.72 0.16 185 / 0.5)" }}
          >
            <span className="text-xs font-bold" style={{ color: "oklch(0.09 0.008 265)", fontFamily: "var(--font-syne)" }}>O</span>
          </div>
          <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
            Orbit
          </span>
        </div>
        <SignInButton mode="redirect">
          <button
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{ color: "oklch(0.78 0.015 260)" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "oklch(0.93 0.006 260)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "oklch(0.78 0.015 260)")}
          >
            Sign in <ChevronRight size={14} />
          </button>
        </SignInButton>
      </motion.nav>

      {/* ── hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        {/* geometric shape — top right */}
        <motion.div
          initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" as const }}
          className="absolute top-8 right-8 md:top-16 md:right-24 pointer-events-none"
          aria-hidden
        >
          <div
            className="w-24 h-24 md:w-36 md:h-36 rounded-2xl rotate-12"
            style={{
              border: "1px solid oklch(0.72 0.16 185 / 0.25)",
              background: "oklch(0.72 0.16 185 / 0.04)",
              boxShadow: "inset 0 0 30px oklch(0.72 0.16 185 / 0.06)",
            }}
          />
        </motion.div>
        {/* geometric shape — bottom left */}
        <motion.div
          initial={{ opacity: 0, rotate: 20, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" as const }}
          className="absolute bottom-12 left-6 md:bottom-20 md:left-20 pointer-events-none"
          aria-hidden
        >
          <div
            className="w-16 h-16 md:w-24 md:h-24 rounded-full"
            style={{
              border: "1px solid oklch(0.72 0.16 185 / 0.2)",
              background: "oklch(0.72 0.16 185 / 0.03)",
            }}
          />
        </motion.div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col items-center gap-6 max-w-3xl">
          {/* badge */}
          <motion.div variants={fadeUp(0)}>
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "oklch(0.72 0.16 185 / 0.1)",
                border: "1px solid oklch(0.72 0.16 185 / 0.25)",
                color: "oklch(0.72 0.16 185)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "oklch(0.72 0.16 185)",
                  boxShadow: "0 0 6px oklch(0.72 0.16 185)",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              Full-cycle AI marketing platform
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            variants={fadeUp(0.08)}
            className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            From market gap{" "}
            <span
              style={{
                color: "oklch(0.72 0.16 185)",
                textShadow: "0 0 40px oklch(0.72 0.16 185 / 0.4)",
              }}
            >
              to brand strategy
            </span>
            <br />
            in three modules.
          </motion.h1>

          {/* sub */}
          <motion.p
            variants={fadeUp(0.16)}
            className="text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: "oklch(0.82 0.012 260)" }}
          >
            Orbit analyzes your competitive landscape, builds your brand foundation, and generates
            buyer personas — all grounded in real market data, not generic templates.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp(0.24)} className="flex flex-col sm:flex-row gap-3 mt-2">
            <SignUpButton mode="redirect">
              <GlowButton>
                Get started free <ArrowRight size={14} />
              </GlowButton>
            </SignUpButton>
            <SignInButton mode="redirect">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-colors duration-200"
                style={{
                  color: "oklch(0.78 0.015 260)",
                  border: "1px solid oklch(1 0 0 / 0.12)",
                  background: "oklch(1 0 0 / 0.04)",
                }}
              >
                Sign in
              </motion.button>
            </SignInButton>
          </motion.div>
        </motion.div>

        {/* hero bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(0.09 0.008 265))" }}
        />
      </section>

      {/* ── modules ── */}
      <section ref={modulesRef} className="relative z-10 px-6 md:px-12 lg:px-24 pb-28">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={modulesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
            className="flex flex-col gap-2"
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "oklch(0.72 0.16 185)" }}
            >
              Three phases
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}
            >
              The full marketing intelligence stack
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            animate={modulesInView ? "animate" : "initial"}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {modules.map((mod, i) => (
              <ModuleCard key={mod.number} mod={mod} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── how it works ── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col gap-3">
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "oklch(0.72 0.16 185)" }}
            >
              Workflow
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold leading-snug"
              style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}
            >
              Zero guesswork.
              <br />
              Just signal.
            </h2>
            <p
              className="text-sm leading-relaxed mt-2"
              style={{ color: "oklch(0.78 0.015 260)" }}
            >
              Each module builds on the last. Market data informs your brand. Your brand shapes
              your audience. The output of every phase becomes the context for the next.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            {steps.map((step, i) => (
              <StepRow key={step.n} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── bottom CTA ── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
            className="relative rounded-3xl p-12 md:p-16 flex flex-col items-center text-center gap-7 overflow-hidden"
            style={{
              background: "oklch(0.12 0.009 265)",
              border: "1px solid oklch(0.72 0.16 185 / 0.2)",
            }}
          >
            {/* inner glow */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.16 185 / 0.1) 0%, transparent 60%)",
              }}
            />
            <h2
              className="relative text-3xl md:text-5xl font-extrabold leading-tight"
              style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}
            >
              Build your brand strategy{" "}
              <span style={{ color: "oklch(0.72 0.16 185)", textShadow: "0 0 30px oklch(0.72 0.16 185 / 0.4)" }}>
                today
              </span>
              .
            </h2>
            <p
              className="relative text-base max-w-md leading-relaxed"
              style={{ color: "oklch(0.82 0.012 260)" }}
            >
              Free to start. No credit card required. Run your first market analysis in minutes.
            </p>
            <SignUpButton mode="redirect">
              <GlowButton className="relative">
                Start for free <ArrowRight size={14} />
              </GlowButton>
            </SignUpButton>
          </motion.div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer
        className="relative z-10 flex items-center justify-center px-6 py-6 border-t"
        style={{ borderColor: "oklch(1 0 0 / 0.06)", color: "oklch(0.6 0.01 260)" }}
      >
        <span className="text-xs" style={{ fontFamily: "var(--font-syne)" }}>
          © {new Date().getFullYear()} Orbit
        </span>
      </footer>

      {/* ── keyframes ── */}
      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 25px) scale(0.97); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-40px, 20px) scale(1.08); }
          70% { transform: translate(20px, -30px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
