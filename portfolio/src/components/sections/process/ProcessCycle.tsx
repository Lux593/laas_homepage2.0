"use client";

import type { ProcessStep } from "@/lib/constants";

const LABELS = ["Idee", "Plan", "Build", "Loop"] as const;

/**
 * Editorial cycle mark for the process panels. Active step is emphasized by
 * contrast and weight, not by glow or decorative chrome.
 */
export default function ProcessCycle({
  index,
  total,
}: {
  step: ProcessStep;
  index: number;
  total: number;
}) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const r = 118;
  const nodeR = 28;

  const nodes = Array.from({ length: total }, (_, i) => {
    // Start at top, clockwise
    const angle = -Math.PI / 2 + (i / total) * Math.PI * 2;
    return {
      i,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      label: LABELS[i] ?? String(i + 1).padStart(2, "0"),
    };
  });

  return (
    <div className="process-media relative mx-auto" aria-hidden>
      <div className="process-media-frame relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        fill="none"
      >
        {/* Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(252,252,252,0.12)"
          strokeWidth="1"
        />

        {/* Arc progress to active step */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="var(--color-accent-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${((index + 1) / total) * 2 * Math.PI * r} ${2 * Math.PI * r}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-[stroke-dasharray] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          opacity={0.85}
        />

        {/* Center numeral */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fcfcfc"
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.06em",
            fontFamily: "var(--font-display)",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </text>
        <text
          x={cx}
          y={cy + 36}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#7a7268"
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          / {String(total).padStart(2, "0")}
        </text>

        {nodes.map((node) => {
          const active = node.i === index;
          const done = node.i < index;
          return (
            <g key={node.i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeR}
                fill={
                  active
                    ? "var(--color-accent-primary)"
                    : done
                      ? "rgba(196,159,123,0.18)"
                      : "rgba(252,252,252,0.04)"
                }
                stroke={
                  active
                    ? "var(--color-accent-primary)"
                    : "rgba(252,252,252,0.14)"
                }
                strokeWidth="1"
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={active ? "#0a0a0a" : "rgba(252,252,252,0.55)"}
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                  fontWeight: 500,
                  textTransform: "uppercase",
                }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
}
