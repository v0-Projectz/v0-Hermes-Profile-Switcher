import type {
  ActionResult,
  AdoptProfileInput,
  CreateProfileInput,
  Profile,
  Service,
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

export async function getServiceHealth(): Promise<Service[]> {
  const roll = (): Service['status'] => {
    const r = Math.random()
    if (r > 0.78) return 'offline'
    if (r > 0.7) return 'checking'
    return 'online'
  }
  return delay(
    [
      { id: 'litellm', label: 'LITELLM', port: '4000', status: roll() },
      { id: 'ngrok', label: 'NGROK', port: '4040', status: roll() },
      { id: 'lmstudio', label: 'LM STUDIO', port: '1234', status: roll() },
      { id: 'gateway', label: 'HERMES GATEWAY', status: roll() },
    ],
    150,
  )
}
