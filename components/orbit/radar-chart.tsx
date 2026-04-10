"use client";

import type { Competitor } from "@/types/orbit";

const COLORS = ["#00d4b4", "#7c6ef8", "#f59e0b", "#ef4444", "#10b981"];
const CX = 150;
const CY = 150;
const R  = 90;

const AXES = [
  { key: "reputationScore" as keyof Competitor, label: "Reputation",   ax: CX,     ay: CY - R },
  { key: "reachScore"      as keyof Competitor, label: "Reach",        ax: CX + R, ay: CY     },
  { key: "featureScore"    as keyof Competitor, label: "Quality",      ax: CX,     ay: CY + R },
  { key: "priceScore"      as keyof Competitor, label: "Price",        ax: CX - R, ay: CY     },
];

// Label positions + text alignment per axis
const LABEL_PROPS = [
  { x: CX,         y: CY - R - 18, anchor: "middle" as const, baseline: "auto"    as const },
  { x: CX + R + 16, y: CY,          anchor: "start"  as const, baseline: "middle"  as const },
  { x: CX,         y: CY + R + 18, anchor: "middle" as const, baseline: "hanging" as const },
  { x: CX - R - 16, y: CY,          anchor: "end"    as const, baseline: "middle"  as const },
];

// Ring scale labels: show 2.5, 5, 7.5 on the top axis (inside the chart, slightly right)
const RING_LABELS = [
  { frac: 0.25, label: "2.5", x: CX + 5, y: CY - R * 0.25 - 3 },
  { frac: 0.5,  label: "5",   x: CX + 5, y: CY - R * 0.5  - 3 },
  { frac: 0.75, label: "7.5", x: CX + 5, y: CY - R * 0.75 - 3 },
];

function toPoint(score: number | undefined, axisIdx: number): [number, number] {
  const ratio = (Math.max(1, Math.min(10, score ?? 5)) - 1) / 9;
  const { ax, ay } = AXES[axisIdx];
  return [CX + (ax - CX) * ratio, CY + (ay - CY) * ratio];
}

function gridPolygon(frac: number): string {
  return AXES.map(({ ax, ay }) => `${CX + (ax - CX) * frac},${CY + (ay - CY) * frac}`).join(" ");
}

function competitorPolygon(c: Competitor): string {
  return AXES.map((_, i) => {
    const [x, y] = toPoint(c[AXES[i].key] as number | undefined, i);
    return `${x},${y}`;
  }).join(" ");
}

export function RadarChart({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
      <div className="w-full max-w-xs mx-auto">
        <svg viewBox="0 0 300 300" className="w-full" style={{ overflow: "visible" }}>
          <defs>
            <filter id="radar-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid rings — animated in with stagger */}
          {[0.25, 0.5, 0.75, 1].map((frac, i) => (
            <polygon
              key={frac}
              className="radar-ring"
              points={gridPolygon(frac)}
              fill={frac === 1 ? "rgba(0,212,180,0.04)" : "none"}
              stroke={frac === 1 ? "rgba(0,212,180,0.3)" : "rgba(0,212,180,0.12)"}
              strokeWidth={frac === 1 ? 1 : 0.75}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}

          {/* Axis lines */}
          {AXES.map(({ ax, ay, label }) => (
            <line
              key={label}
              x1={CX} y1={CY} x2={ax} y2={ay}
              stroke="rgba(0,212,180,0.18)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {/* Ring scale labels */}
          {RING_LABELS.map(({ label, x, y, frac }) => (
            <text
              key={frac}
              x={x} y={y}
              fill="rgba(0,212,180,0.55)"
              fontSize={8}
              fontWeight="500"
              textAnchor="start"
              dominantBaseline="auto"
            >
              {label}
            </text>
          ))}

          {/* Center dot */}
          <circle cx={CX} cy={CY} r={3} fill="rgba(0,212,180,0.5)" filter="url(#dot-glow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Competitor polygons — staggered animation */}
          {competitors.map((c, i) => (
            <polygon
              key={c.name}
              className="radar-polygon"
              points={competitorPolygon(c)}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.09}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              strokeOpacity={0.8}
              style={{ animationDelay: `${0.28 + i * 0.12}s` }}
            />
          ))}

          {/* Competitor vertex dots */}
          {competitors.map((c, i) =>
            AXES.map((_, axIdx) => {
              const [x, y] = toPoint(c[AXES[axIdx].key] as number | undefined, axIdx);
              return (
                <circle
                  key={`${c.name}-${axIdx}`}
                  cx={x} cy={y} r={3.5}
                  fill={COLORS[i % COLORS.length]}
                  opacity={0}
                  filter="url(#dot-glow)"
                  style={{
                    animation: "radar-fade-in 0.4s ease-out forwards",
                    animationDelay: `${0.5 + i * 0.12 + axIdx * 0.04}s`,
                  }}
                />
              );
            })
          )}

          {/* Axis labels */}
          {AXES.map(({ label }, i) => {
            const { x, y, anchor, baseline } = LABEL_PROPS[i];
            return (
              <text
                key={label}
                x={x} y={y}
                textAnchor={anchor}
                dominantBaseline={baseline}
                fill="rgba(0,212,180,0.85)"
                fontSize={10}
                fontWeight="600"
                filter="url(#radar-glow)"
                style={{
                  animation: "radar-fade-in 0.5s ease-out forwards",
                  animationDelay: `${0.1 + i * 0.08}s`,
                  opacity: 0,
                }}
              >
                {label}
              </text>
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
