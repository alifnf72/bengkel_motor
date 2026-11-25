"use client";

import { motion, useReducedMotion } from "motion/react";

export function LoadingText({ label, light = false }: { label: string; light?: boolean }) {
  const reducedMotion = useReducedMotion();
  const colors = light
    ? "linear-gradient(90deg, #FFE4DC 0%, #FFFFFF 42%, #FFB39E 55%, #FFFFFF 68%, #FFE4DC 100%)"
    : "linear-gradient(90deg, #8B92A8 0%, #8B92A8 35%, #FF5A36 50%, #E8EAF2 62%, #8B92A8 78%, #8B92A8 100%)";

  return (
    <span role="status" aria-live="polite" className="inline-flex">
      <motion.span
        className="inline-block bg-clip-text text-transparent"
        style={{ backgroundImage: colors, backgroundSize: "220% 100%", backgroundPosition: "100% 50%", WebkitBackgroundClip: "text" }}
        animate={reducedMotion ? { backgroundPosition: "50% 50%" } : { backgroundPosition: ["100% 50%", "-120% 50%"] }}
        transition={reducedMotion ? { duration: 0 } : { duration: 1.7, ease: "linear", repeat: Infinity }}
      >
        {label}
      </motion.span>
    </span>
  );
}
