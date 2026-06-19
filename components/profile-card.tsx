'use client'

import { motion, useReducedMotion } from 'motion/react'
import { forwardRef } from 'react'
import { Monogram } from '@/components/monogram'
import { useSettings } from '@/components/settings-provider'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  profile: Profile
  selected: boolean
  onSelect: () => void
  onSwitch: () => void
}

export const ProfileCard = forwardRef<HTMLButtonElement, Props>(
  function ProfileCard({ profile, selected, onSelect, onSwitch }, ref) {
    const reduce = useReducedMotion()
    const { settings } = useSettings()
    const { showMonograms, showCliStatus } = settings.appearance
    const isActive = !!profile.active

    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={onSelect}
        onDoubleClick={onSwitch}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSwitch()
          }
        }}
        whileHover={reduce ? undefined : { y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        aria-pressed={selected}
        className={cn(
          'group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-colors',
          'glass',
          isActive
            ? 'ring-active border-success/40'
            : selected
              ? 'border-gold/40'
              : 'border-border hover:border-gold/20',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {showMonograms ? (
              <Monogram name={profile.name} active={isActive} />
            ) : null}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                  {profile.name}
                </h3>
                {isActive ? (
                  <span className="eyebrow rounded-full border border-success/30 bg-success/10 px-2 py-[2px] text-[9px] font-medium text-success">
                    Active
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {profile.slug}
              </p>
            </div>
          </div>

          {showCliStatus ? (
            <span
              title={
                profile.cliProfile
                  ? 'A matching Hermes CLI profile exists — terminal sessions resolve to this workspace.'
                  : 'No matching CLI profile yet — switching will scaffold one for terminal use.'
              }
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium',
                profile.cliProfile
                  ? 'border-success/25 text-success'
                  : 'border-warning/25 text-warning',
              )}
            >
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: profile.cliProfile
                    ? 'var(--success)'
                    : 'var(--warning)',
                }}
                aria-hidden
              />
              {profile.cliProfile ? 'CLI ok' : 'CLI missing'}
            </span>
          ) : null}
        </div>

        <p
          title={profile.path}
          className="mt-3 truncate font-mono text-[11px] text-faint"
        >
          {profile.path}
        </p>

        {/* right-edge status rail */}
        <span
          aria-hidden
          className={cn(
            'absolute right-0 top-1/2 h-8 w-[2px] -translate-y-1/2 rounded-full transition-colors',
            isActive
              ? 'bg-success/70'
              : selected
                ? 'bg-gold/60'
                : 'bg-border group-hover:bg-gold/30',
          )}
        />
      </motion.button>
    )
  },
)
