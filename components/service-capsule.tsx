'use client'

import { motion } from 'motion/react'
import type { Service } from '@/lib/types'
import { cn } from '@/lib/utils'

const DOT: Record<Service['status'], string> = {
  online: 'var(--success)',
  offline: 'var(--text-muted-2)',
  checking: 'var(--warning)',
}

const SHAPE: Record<'pill' | 'rounded' | 'minimal', string> = {
  pill: 'rounded-full border border-border bg-secondary/60 px-3 py-1.5',
  rounded: 'rounded-md border border-border bg-secondary/60 px-2.5 py-1.5',
  minimal: 'px-1.5 py-1',
}

type Props = {
  service: Service
  showPort?: boolean
  style?: 'pill' | 'rounded' | 'minimal'
}

export function ServiceCapsule({
  service,
  showPort = true,
  style = 'pill',
}: Props) {
  const color = DOT[service.status]
  return (
    <div className={cn('flex items-center gap-2', SHAPE[style])}>
      <motion.span
        className="size-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        animate={
          service.status === 'offline'
            ? { opacity: 0.6 }
            : { opacity: [0.5, 1, 0.5] }
        }
        transition={{
          duration: service.status === 'checking' ? 0.8 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden
      />
      <span className="font-mono text-[11px] tracking-wide text-foreground/90">
        {service.label}
      </span>
      {showPort && service.port ? (
        <span className="font-mono text-[11px] text-muted-foreground">
          {service.port}
        </span>
      ) : null}
      <span className="sr-only">{service.status}</span>
    </div>
  )
}
