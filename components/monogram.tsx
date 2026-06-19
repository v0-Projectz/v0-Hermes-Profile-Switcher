'use client'

import { cn } from '@/lib/utils'

type Props = {
  name: string
  size?: 'sm' | 'lg'
  active?: boolean
  className?: string
}

const SIZES = {
  sm: 'size-9 text-sm',
  lg: 'size-12 text-lg',
} as const

export function Monogram({ name, size = 'sm', active = false, className }: Props) {
  const letter = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      aria-hidden
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full font-semibold text-gold',
        'border border-gold/40 bg-accent',
        active && 'shadow-[0_0_14px_rgba(245,184,65,0.45)]',
        SIZES[size],
        className,
      )}
    >
      <span
        className="absolute inset-[2px] rounded-full border border-gold/15"
        aria-hidden
      />
      {letter}
    </span>
  )
}
