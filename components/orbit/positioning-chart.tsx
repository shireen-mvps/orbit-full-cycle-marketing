"use client";

import type { Competitor } from "@/types/orbit";

const COLORS = ["#00d4b4", "#7c6ef8", "#f59e0b", "#ef4444", "#10b981"];

const SIZE = 320;
const PAD  = 44;
const INNER = SIZE - PAD * 2;
const MID   = SIZE / 2;

// Quadrant label centers
const Q = {
  budgetRich:    { x: PAD + INNER / 4,       y: PAD + INNER / 4 },
  premiumRich:   { x: PAD + (3 * INNER) / 4, y: PAD + INNER / 4 },
  budgetSimple:  { x: PAD + INNER / 4,       y: PAD + (3 * INNER) / 4 },
  premiumSimple: { x: PAD + (3 * INNER) / 4, y: PAD + (3 * INNER) / 4 },
};

export function PositioningChart({ competitors }: { competitors: Competitor[] }) {
  const toX = (s: number) => PAD + (((s ?? 5) - 1) / 9) * INNER;
  const toY = (s: number) => SIZE - PAD - (((s ?? 5) - 1) / 9) * INNER;

  return (
    <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
      <div className="w-full max-w-sm mx-auto">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" style={{ overflow: "visible" }}>
          <defs>
            {/* Glow filter for labels */}
            <filter id="label-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Stronger glow for center dot */}
            <filter id="center-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Quadrant fills */}
          <rect x={PAD}   y={PAD}   width={INNER / 2} height={INNER / 2} fill="rgba(0,212,180,0.04)" />
          <rect x={MID}   y={PAD}   width={INNER / 2} height={INNER / 2} fill="rgba(0,212,180,0.07)" />
          <rect x={PAD}   y={MID}   width={INNER / 2} height={INNER / 2} fill="rgba(255,255,255,0.02)" />
          <rect x={MID}   y={MID}   width={INNER / 2} height={INNER / 2} fill="rgba(255,255,255,0.02)" />

          {/* Axis lines */}
          <line x1={PAD} y1={SIZE - PAD} x2={SIZE - PAD} y2={SIZE - PAD} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
          <line x1={PAD} y1={PAD}        x2={PAD}        y2={SIZE - PAD} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />

          {/* Center dividers */}
          <line x1={PAD} y1={MID} x2={SIZE - PAD} y2={MID} stroke="rgba(0,212,180,0.25)" strokeWidth={1} strokeDasharray="5 4" />
          <line x1={MID} y1={PAD} x2={MID}        y2={SIZE - PAD} stroke="rgba(0,212,180,0.25)" strokeWidth={1} strokeDasharray="5 4" />

          {/* Center glow dot */}
          <circle cx={MID} cy={MID} r={5} fill="rgba(0,212,180,0.12)" filter="url(#center-glow)" />
          <circle cx={MID} cy={MID} r={2.5} fill="rgba(0,212,180,0.55)" filter="url(#center-glow)">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Axis labels */}
          <text x={MID} y={SIZE - 6} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9}>
            Price Point →
          </text>
          <text x={10} y={MID} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9} transform={`rotate(-90, 10, ${MID})`}>
            Feature Richness →
          </text>

          {/* Quadrant labels — centered in each quadrant, teal glow, pulsing */}
          <text x={Q.budgetRich.x}    y={Q.budgetRich.y - 4}    textAnchor="middle" fill="rgba(0,212,180,0.6)"  fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Budget</tspan>
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="5s" repeatCount="indefinite" begin="0s" />
          </text>
          <text x={Q.budgetRich.x}    y={Q.budgetRich.y + 9}    textAnchor="middle" fill="rgba(0,212,180,0.6)"  fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Rich</tspan>
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="5s" repeatCount="indefinite" begin="0s" />
          </text>

          <text x={Q.premiumRich.x}   y={Q.premiumRich.y - 4}   textAnchor="middle" fill="rgba(0,212,180,0.85)" fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Premium</tspan>
            <animate attributeName="opacity" values="0.85;1;0.85" dur="5s" repeatCount="indefinite" begin="1.2s" />
          </text>
          <text x={Q.premiumRich.x}   y={Q.premiumRich.y + 9}   textAnchor="middle" fill="rgba(0,212,180,0.85)" fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Rich</tspan>
            <animate attributeName="opacity" values="0.85;1;0.85" dur="5s" repeatCount="indefinite" begin="1.2s" />
          </text>

          <text x={Q.budgetSimple.x}  y={Q.budgetSimple.y - 4}  textAnchor="middle" fill="rgba(0,212,180,0.5)"  fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Budget</tspan>
            <animate attributeName="opacity" values="0.5;0.75;0.5" dur="5s" repeatCount="indefinite" begin="2.4s" />
          </text>
          <text x={Q.budgetSimple.x}  y={Q.budgetSimple.y + 9}  textAnchor="middle" fill="rgba(0,212,180,0.5)"  fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Simple</tspan>
            <animate attributeName="opacity" values="0.5;0.75;0.5" dur="5s" repeatCount="indefinite" begin="2.4s" />
          </text>

          <text x={Q.premiumSimple.x} y={Q.premiumSimple.y - 4} textAnchor="middle" fill="rgba(0,212,180,0.5)"  fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Premium</tspan>
            <animate attributeName="opacity" values="0.5;0.75;0.5" dur="5s" repeatCount="indefinite" begin="3.6s" />
          </text>
          <text x={Q.premiumSimple.x} y={Q.premiumSimple.y + 9} textAnchor="middle" fill="rgba(0,212,180,0.5)"  fontSize={9}  fontWeight="600" filter="url(#label-glow)">
            <tspan>Simple</tspan>
            <animate attributeName="opacity" values="0.5;0.75;0.5" dur="5s" repeatCount="indefinite" begin="3.6s" />
          </text>

          {/* Competitor dots with pulse rings */}
          {competitors.map((c, i) => {
            const cx    = toX(c.priceScore ?? 5);
            const cy    = toY(c.featureScore ?? 5);
            const color = COLORS[i % COLORS.length];
            const label = c.name.length > 11 ? c.name.slice(0, 11) + "…" : c.name;
            return (
              <g key={c.name}>
                {/* Pulse ring */}
                <circle cx={cx} cy={cy} r={6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6}>
                  <animate attributeName="r"       values="6;18;6"   dur="2.5s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                </circle>
                {/* Outer fill */}
                <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.12} />
                {/* Core dot */}
                <circle cx={cx} cy={cy} r={5}  fill={color} />
                {/* Label */}
                <text x={cx} y={cy - 14} textAnchor="middle" fill={color} fontSize={9} fontWeight="600">
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
        {competitors.map((c, i) => (
          <div key={c.name} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}
