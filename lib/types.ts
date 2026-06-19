export type Profile = {
  name: string
  slug: string
  path: string
  description: string
  cliProfile: boolean
  active?: boolean
}

export type ServiceStatus = 'online' | 'offline' | 'checking'

export type Service = {
  id: string
  label: string
  port?: string
  status: ServiceStatus
}

export type CreateProfileInput = {
  name: string
  description: string
  location: string
}

export type AdoptProfileInput = {
  location: string
  name: string
  description: string
}

export type ActionResult = {
  ok: boolean
  message: string
}
