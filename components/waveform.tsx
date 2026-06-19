'use client'

import { motion, useReducedMotion } from 'motion/react'

const BARS = [0.4, 0.75, 1, 0.6, 0.9, 0.5, 0.8]

export function Waveform({ active = true }: { active?: boolean }) {
  const reduce = useReducedMotion()

  return (
    <div
      className="flex h-6 items-center gap-[3px]"
      role="img"
      aria-label="J.A.R.V.I.S. voice activity"
    >
      {BARS.map((peak, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: active ? 'var(--gold)' : 'var(--muted-foreground)',
            boxShadow: active ? '0 0 8px rgba(245,184,65,0.6)' : 'none',
          }}
          initial={{ height: 4 }}
          animate={
            reduce || !active
              ? { height: 8 + peak * 6 }
              : { height: [4, 6 + peak * 18, 4] }
          }
          transition={{
            duration: 1 + peak * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.09,
          }}
        />
      ))}
    </div>
  )
}
