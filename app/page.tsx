'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { AdoptProfileDialog } from '@/components/adopt-profile-dialog'
import { CreateProfileDialog } from '@/components/create-profile-dialog'
import { JarvisFooter } from '@/components/jarvis-footer'
import { ProfileCommandPalette } from '@/components/profile-command-palette'
import { ProfileDetail } from '@/components/profile-detail'
import { ProfileList } from '@/components/profile-list'
import { TopBar } from '@/components/top-bar'
import {
  adoptProfile,
  createProfile,
  getServiceHealth,
  listProfiles,
  switchProfile,
} from '@/lib/api'
import type {
  AdoptProfileInput,
  CreateProfileInput,
} from '@/lib/types'

export default function Page() {
  const {
    data: profiles = [],
    mutate: mutateProfiles,
  } = useSWR('profiles', listProfiles, { revalidateOnFocus: false })

  const { data: services = [] } = useSWR('health', getServiceHealth, {
    refreshInterval: 4000,
  })

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [adoptOpen, setAdoptOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const activeProfile = useMemo(
    () => profiles.find((p) => p.active) ?? null,
    [profiles],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q),
    )
  }, [profiles, query])

  // Default selection: active profile, else first.
  useEffect(() => {
    if (selectedSlug && profiles.some((p) => p.slug === selectedSlug)) return
    const fallback = activeProfile?.slug ?? profiles[0]?.slug ?? null
    setSelectedSlug(fallback)
  }, [profiles, activeProfile, selectedSlug])

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.slug === selectedSlug) ?? null,
    [profiles, selectedSlug],
  )

  const handleSwitch = useCallback(
    async (slug: string) => {
      setSelectedSlug(slug)
      const res = await switchProfile(slug)
      await mutateProfiles()
      if (res.ok) toast.success(res.message)
      else toast.error(res.message)
    },
    [mutateProfiles],
  )

  const handleAction = useCallback((label: string, command: string) => {
    console.log(JSON.stringify({ action: label, command }))
    toast.success(`${label}`, { description: command })
  }, [])

  const handleCreate = useCallback(
    async (input: CreateProfileInput) => {
      const res = await createProfile(input)
      await mutateProfiles()
      if (res.ok) {
        toast.success(res.message)
        setCreateOpen(false)
      } else {
        toast.error(res.message)
      }
    },
    [mutateProfiles],
  )

  const handleAdopt = useCallback(
    async (input: AdoptProfileInput) => {
      const res = await adoptProfile(input)
      await mutateProfiles()
      if (res.ok) {
        toast.success(res.message)
        setAdoptOpen(false)
      } else {
        toast.error(res.message)
      }
    },
    [mutateProfiles],
  )

  // Keyboard shortcuts: Ctrl+K palette, Ctrl+N create, / focus search.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setCreateOpen(true)
      } else if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex h-[100dvh] flex-col gap-3 overflow-hidden p-3 sm:p-4">
      <TopBar
        ref={searchRef}
        query={query}
        onQueryChange={setQuery}
        onSearchFocus={() => {}}
        activeProfile={activeProfile}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[38fr_62fr]">
        <div className="min-h-0">
          <ProfileList
            profiles={filtered}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            onSwitch={handleSwitch}
            onCreate={() => setCreateOpen(true)}
            onAdopt={() => setAdoptOpen(true)}
          />
        </div>
        <div className="min-h-0">
          <ProfileDetail
            profile={selectedProfile}
            onSwitch={handleSwitch}
            onAction={handleAction}
          />
        </div>
      </main>

      <JarvisFooter
        services={services}
        onSwitch={() => setPaletteOpen(true)}
        onCreate={() => setCreateOpen(true)}
        onAdopt={() => setAdoptOpen(true)}
      />

      <ProfileCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        profiles={profiles}
        onSwitch={(slug) => {
          setPaletteOpen(false)
          handleSwitch(slug)
        }}
        onCreate={() => {
          setPaletteOpen(false)
          setCreateOpen(true)
        }}
        onAdopt={() => {
          setPaletteOpen(false)
          setAdoptOpen(true)
        }}
      />

      <CreateProfileDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      <AdoptProfileDialog
        open={adoptOpen}
        onOpenChange={setAdoptOpen}
        onSubmit={handleAdopt}
      />
    </div>
  )
}
