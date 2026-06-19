'use client'

import { FolderPlus, Plus, Repeat } from 'lucide-react'
import { ServiceCapsule } from '@/components/service-capsule'
import { Waveform } from '@/components/waveform'
import { Button } from '@/components/ui/button'
import type { Service } from '@/lib/types'

type Props = {
  services: Service[]
  onSwitch: () => void
  onCreate: () => void
  onAdopt: () => void
}

export function JarvisFooter({ services, onSwitch, onCreate, onAdopt }: Props) {
  return (
    <footer className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3">
      {/* Left: waveform */}
      <div className="flex items-center gap-3">
        <Waveform />
        <span className="eyebrow font-mono text-[10px] text-gold">
          J.A.R.V.I.S. Active
        </span>
      </div>

      {/* Center: service health */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {services.map((s) => (
          <ServiceCapsule key={s.id} service={s} />
        ))}
      </div>

      {/* Right: quick actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSwitch}
          className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
        >
          <Repeat className="size-3.5" /> Switch Profile
        </Button>
        <Button
          size="sm"
          onClick={onCreate}
          className="gap-1.5 bg-gold font-medium text-primary-foreground hover:bg-gold/90"
        >
          <Plus className="size-3.5" /> Create New
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAdopt}
          className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
        >
          <FolderPlus className="size-3.5" /> Adopt Project
        </Button>
      </div>
    </footer>
  )
}
