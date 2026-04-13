"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const steps = [
  { n: "1", title: "Create a project", body: "Name your product. Orbit sets up a workspace and tracks your progress through each phase." },
  { n: "2", title: "Run Market Intelligence", body: "Enter your industry, product category, and up to five competitors. Orbit returns a full competitive map." },
  { n: "3", title: "Build your brand and audience", body: "Feed the market gaps into Brand Foundation, then generate high-fidelity buyer personas in Audience Studio." },
  { n: "4", title: "Plan your campaign", body: "Turn your research into a campaign brief, channel mix, and three distinct campaign concepts. Select one to move forward." },
  { n: "5", title: "Generate content", body: "Orbit writes platform-native copy for every selected channel and produces a full repurposing matrix, ready to publish." },
];

export function StepRow({ step, index }: { step: typeof steps[0]; index: number }) {
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
        style={{ background: "oklch(0.72 0.16 185 / 0.12)", color: "oklch(0.72 0.16 185)", border: "1px solid oklch(0.72 0.16 185 / 0.3)", fontFamily: "var(--font-syne)" }}
      >
        {step.n}
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        <h4 className="font-semibold text-base" style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}>
          {step.title}
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.78 0.015 260)" }}>{step.body}</p>
      </div>
    </motion.div>
  );
}
