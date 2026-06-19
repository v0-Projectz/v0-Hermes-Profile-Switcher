import { DEFAULT_SETTINGS, mergeSettings } from './settings'
import type {
  ActionResult,
  AdoptProfileInput,
  CreateProfileInput,
  MonitoredService,
  Profile,
  Service,
  Settings,
} from './types'

// --- Seed data (mirrors the real backend shape) ---
const SEED_PROFILES: Profile[] = [
  {
    name: 'JonBeatz',
    slug: 'jonbeatz',
    path: 'D:\\Hermes\\JonBeatz',
    description: 'Personal AI command center',
    cliProfile: true,
    active: true,
  },
  {
    name: 'MyStudioChannel',
    slug: 'msc',
    path: 'D:\\Cursor_Projectz\\MyStudioChannel',
    description: 'MSC website project',
    cliProfile: true,
  },
  {
    name: 'ClientX',
    slug: 'clientx',
    path: 'D:\\Hermes\\ClientX',
    description: 'Client engagement',
    cliProfile: false,
  },
  {
    name: 'NovaMira',
    slug: 'novamira',
    path: 'D:\\Hermes\\NovaMira',
    description: 'Broadcast OS R&D sandbox',
    cliProfile: true,
  },
]

let profiles: Profile[] = SEED_PROFILES.map((p) => ({ ...p }))

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 32)
}

export async function listProfiles(): Promise<Profile[]> {
  return delay(profiles.map((p) => ({ ...p })))
}

export async function getActiveProfile(): Promise<Profile | undefined> {
  return delay(profiles.find((p) => p.active))
}

export async function switchProfile(slug: string): Promise<ActionResult> {
  const target = profiles.find((p) => p.slug === slug)
  console.log(JSON.stringify({ action: 'switch', profile: target?.name }))
  if (!target) return delay({ ok: false, message: 'Profile not found' })
  profiles = profiles.map((p) => ({ ...p, active: p.slug === slug }))
  return delay({ ok: true, message: `Switched to ${target.name}` })
}

export async function createProfile(
  input: CreateProfileInput,
): Promise<ActionResult> {
  const slug = slugify(input.name)
  console.log(
    JSON.stringify({
      action: 'new',
      name: input.name,
      location: input.location,
      description: input.description,
    }),
  )
  if (!input.name.trim())
    return delay({ ok: false, message: 'Name is required' })
  if (profiles.some((p) => p.slug === slug))
    return delay({ ok: false, message: `Profile "${slug}" already exists` })

  profiles = [
    ...profiles,
    {
      name: input.name,
      slug,
      path: input.location,
      description: input.description,
      cliProfile: true,
    },
  ]
  return delay({ ok: true, message: `Created profile ${input.name}` })
}

export async function adoptProfile(
  input: AdoptProfileInput,
): Promise<ActionResult> {
  const slug = slugify(input.name)
  console.log(
    JSON.stringify({
      action: 'adopt',
      location: input.location,
      name: input.name,
    }),
  )
  if (!input.location.trim())
    return delay({ ok: false, message: 'Folder path is required' })
  if (profiles.some((p) => p.slug === slug))
    return delay({ ok: false, message: `Profile "${slug}" already exists` })

  profiles = [
    ...profiles,
    {
      name: input.name,
      slug,
      path: input.location,
      description: input.description,
      cliProfile: true,
    },
  ]
  return delay({ ok: true, message: `Adopted project as ${input.name}` })
}

// Deterministic baseline so all three dot states are always represented
// (green = online, amber = checking, gray = offline) regardless of config.
const STATUS_MAP: Record<string, Service['status']> = {
  litellm: 'online',
  ngrok: 'checking',
  lmstudio: 'offline',
  gateway: 'online',
}

/**
 * Probe the configured set of monitored services. Real socket probes drop in
 * later — for now statuses are deterministic with a subtle gateway flicker.
 */
export async function probeServices(
  services: MonitoredService[],
): Promise<Service[]> {
  const result = services
    .filter((s) => s.enabled)
    .map<Service>((s) => {
      const base = STATUS_MAP[s.id] ?? 'online'
      const status =
        s.id === 'gateway'
          ? Math.random() > 0.5
            ? 'online'
            : 'checking'
          : base
      return {
        id: s.id,
        label: s.name.toUpperCase(),
        port: s.port ? String(s.port) : undefined,
        status,
      }
    })
  return delay(result, 150)
}

// --- Settings persistence (localStorage now; real config backend later) ---
const SETTINGS_KEY = 'profile-jedi:settings'

export async function getSettings(): Promise<Settings> {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_SETTINGS)
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    return mergeSettings(raw ? JSON.parse(raw) : null)
  } catch {
    return structuredClone(DEFAULT_SETTINGS)
  }
}

export async function updateSettings(next: Settings): Promise<Settings> {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }
  return next
}

export async function resetSettings(): Promise<Settings> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SETTINGS_KEY)
  }
  return structuredClone(DEFAULT_SETTINGS)
}

// --- Mock backend stubs (wired to real PowerShell scripts later) ---
export async function testBackend(): Promise<ActionResult> {
  return delay({
    ok: true,
    message: `Backend reachable — resolved ${profiles.length} profiles`,
  })
}

export async function exportRegistry(): Promise<ActionResult> {
  return delay({ ok: true, message: 'Registry exported to profiles.backup.json' })
}

export async function importRegistry(): Promise<ActionResult> {
  return delay({ ok: true, message: 'Registry imported successfully' })
}

export async function backupNow(): Promise<ActionResult> {
  return delay({ ok: true, message: 'Snapshot saved (settings + registry)' })
}

export async function restoreBackup(): Promise<ActionResult> {
  return delay({ ok: true, message: 'Restored from latest backup' })
}

// --- Google API stack (LiteLLM + ngrok) lifecycle (mocked) ---
// Three-stack-aware status: LiteLLM (4000), ngrok tunnel (4040), Vertex reach.
// The real PowerShell-backed control drops in later; for now we simulate a
// realistic start/stop lifecycle entirely in module memory.
export type GoogleApiState =
  | 'offline'
  | 'starting'
  | 'online'
  | 'degraded'
  | 'stopping'

export type GoogleApiStatus = {
  state: GoogleApiState
  litellm: boolean
  ngrok: boolean
  vertex: boolean
  publicUrl: string | null
  port: number
}

const GOOGLE_PUBLIC_URL = 'https://pushy-water-reformer.ngrok-free.dev'

const GOOGLE_OFFLINE: GoogleApiStatus = {
  state: 'offline',
  litellm: false,
  ngrok: false,
  vertex: false,
  publicUrl: null,
  port: 4000,
}

const GOOGLE_ONLINE: GoogleApiStatus = {
  state: 'online',
  litellm: true,
  ngrok: true,
  vertex: true,
  publicUrl: GOOGLE_PUBLIC_URL,
  port: 4000,
}

let googleApi: GoogleApiStatus = { ...GOOGLE_OFFLINE }
let googleTimer: ReturnType<typeof setTimeout> | null = null

function clearGoogleTimer() {
  if (googleTimer) {
    clearTimeout(googleTimer)
    googleTimer = null
  }
}

export async function getGoogleApiStatus(): Promise<GoogleApiStatus> {
  return { ...googleApi }
}

export async function startGoogleApi(): Promise<void> {
  console.log(JSON.stringify({ action: 'google-api:start' }))
  clearGoogleTimer()
  googleApi = { ...GOOGLE_OFFLINE, state: 'starting' }
  googleTimer = setTimeout(() => {
    googleApi = { ...GOOGLE_ONLINE }
    googleTimer = null
  }, 2000)
}

export async function stopGoogleApi(): Promise<void> {
  console.log(JSON.stringify({ action: 'google-api:stop' }))
  clearGoogleTimer()
  googleApi = { ...googleApi, state: 'stopping' }
  googleTimer = setTimeout(() => {
    googleApi = { ...GOOGLE_OFFLINE }
    googleTimer = null
  }, 1500)
}

export async function restartGoogleApi(): Promise<void> {
  console.log(JSON.stringify({ action: 'google-api:restart' }))
  clearGoogleTimer()
  googleApi = { ...googleApi, state: 'stopping' }
  googleTimer = setTimeout(() => {
    googleApi = { ...GOOGLE_OFFLINE, state: 'starting' }
    googleTimer = setTimeout(() => {
      googleApi = { ...GOOGLE_ONLINE }
      googleTimer = null
    }, 2000)
  }, 1500)
}

export async function toggleGoogleApi(
  on: boolean,
): Promise<ActionResult> {
  return delay({
    ok: true,
    message: on ? 'Google API stack started' : 'Google API stack stopped',
  })
}

export async function getLastCommandOutput(): Promise<string> {
  return delay(
    [
      'PS D:\\Hermes\\custom-scriptz\\profile-switcher> .\\Switch-Hermes-Profile.ps1 -Action list',
      '',
      'Resolving profile registry from profiles.json ...',
      '  [1] JonBeatz         D:\\Hermes\\JonBeatz            (active)',
      '  [2] MyStudioChannel  D:\\Cursor_Projectz\\MyStudioChannel',
      '  [3] ClientX          D:\\Hermes\\ClientX',
      '  [4] NovaMira         D:\\Hermes\\NovaMira',
      '',
      'Done. 4 profiles resolved in 142ms.',
      'Exit code: 0',
    ].join('\n'),
    200,
  )
}
