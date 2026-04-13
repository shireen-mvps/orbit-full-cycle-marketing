"use client";

import { motion } from "framer-motion";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { RidgeButton } from "./ridge-button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: "easeOut" as const } },
});

const stagger = { animate: { transition: { staggerChildren: 0.12 } } };

export function LandingHero() {
  return (
    <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28 md:pt-28 md:pb-36">
      <motion.div initial={{ opacity: 0, rotate: -20, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" as const }} className="absolute top-8 right-8 md:top-16 md:right-24 pointer-events-none" aria-hidden>
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl rotate-12" style={{ border: "1px solid oklch(0.72 0.16 185 / 0.25)", background: "oklch(0.72 0.16 185 / 0.04)", boxShadow: "inset 0 0 30px oklch(0.72 0.16 185 / 0.06)" }} />
      </motion.div>
      <motion.div initial={{ opacity: 0, rotate: 20, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" as const }} className="absolute bottom-12 left-6 md:bottom-20 md:left-20 pointer-events-none" aria-hidden>
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full" style={{ border: "1px solid oklch(0.72 0.16 185 / 0.2)", background: "oklch(0.72 0.16 185 / 0.03)" }} />
      </motion.div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col items-center gap-6 max-w-3xl">
        <motion.div variants={fadeUp(0)}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ background: "oklch(0.72 0.16 185 / 0.1)", border: "1px solid oklch(0.72 0.16 185 / 0.25)", color: "oklch(0.72 0.16 185)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.72 0.16 185)", boxShadow: "0 0 6px oklch(0.72 0.16 185)", animation: "pulse 2s ease-in-out infinite" }} />
            Full-cycle AI marketing platform
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp(0.08)} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          From market gap{" "}
          <span style={{ color: "oklch(0.72 0.16 185)", textShadow: "0 0 40px oklch(0.72 0.16 185 / 0.4)" }}>to live campaign</span>
          <br />in five modules.
        </motion.h1>

        <motion.p variants={fadeUp(0.16)} className="text-base md:text-lg leading-relaxed max-w-xl" style={{ color: "oklch(0.82 0.012 260)" }}>
          Orbit takes you from competitive research and brand positioning to audience personas,
          campaign planning, and multi-channel content, all in one connected workflow.
        </motion.p>

        <motion.div variants={fadeUp(0.24)} className="flex items-center justify-center mt-2">
          <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
            <RidgeButton>Start for free <ArrowRight size={14} /></RidgeButton>
          </SignUpButton>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, oklch(0.09 0.008 265))" }} />
    </section>
  );
}
