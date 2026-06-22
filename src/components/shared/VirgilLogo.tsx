"use client";

import { motion } from "framer-motion";

interface VirgilLogoProps {
  /** Controls the height in px. Width scales proportionally. */
  size?: number;
  /** Enables the flowing left-to-right chevron pulse animation */
  animated?: boolean;
  className?: string;
}

/**
 * Virgil Logo — Three staggered right-pointing chevrons (»»)
 * Dark navy → medium purple → bright blue-violet gradient.
 * Built entirely in code, optionally animated.
 *
 * Chevron path drawn in a 48×70 local space:
 *   Outer: 0,0 → 48,35 → 0,70
 *   Inner: 0,56 → 33,35 → 0,14
 */
const CHEVRON = "M0,0 L48,35 L0,70 L0,56 L33,35 L0,14 Z";

// Each chevron: gradient stop colors + animation delay
const CHEVRONS = [
  { id: "cg1", from: "#14104a", to: "#271888", delay: 0 },
  { id: "cg2", from: "#2d1a88", to: "#5035c8", delay: 0.18 },
  { id: "cg3", from: "#5535c0", to: "#7c5cfc", delay: 0.36 },
];

// How far each chevron is offset to the right (they overlap)
const X_OFFSET = 24;
// Total viewBox width
const VB_W = 48 + X_OFFSET * 2; // = 96
const VB_H = 70;

export function VirgilLogo({
  size = 36,
  animated = true,
  className = "",
}: VirgilLogoProps) {
  const scale = size / VB_H;
  const width = Math.round(VB_W * scale);

  return (
    <svg
      width={width}
      height={size}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Virgil logo"
      role="img"
    >
      <defs>
        {CHEVRONS.map((c) => (
          <linearGradient key={c.id} id={c.id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.from} />
            <stop offset="100%" stopColor={c.to} />
          </linearGradient>
        ))}
        {/* Glow filter for active state */}
        <filter id="virgil-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {CHEVRONS.map((chevron, i) =>
        animated ? (
          <motion.path
            key={chevron.id}
            d={CHEVRON}
            fill={`url(#${chevron.id})`}
            transform={`translate(${i * X_OFFSET}, 0)`}
            /* Each chevron pulses in sequence: dim → bright → dim */
            animate={{
              opacity: [0.55, 1, 0.55],
              scale: [1, 1.04, 1],
              filter: [
                "brightness(0.8) saturate(0.9)",
                "brightness(1.35) saturate(1.3)",
                "brightness(0.8) saturate(0.9)",
              ],
            }}
            transition={{
              duration: 1.6,
              delay: chevron.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: `${i * X_OFFSET + 24}px 35px` }}
          />
        ) : (
          <path
            key={chevron.id}
            d={CHEVRON}
            fill={`url(#${chevron.id})`}
            transform={`translate(${i * X_OFFSET}, 0)`}
          />
        )
      )}
    </svg>
  );
}
