import { apiRequest } from './client'

// Mirrors the booking-api masking serializer (src/enterprises/response.ts):
// secrets come back as { set, hint } — never a raw value.
export type MaskedSecret = { set: boolean; hint: string | null }

export type EnterpriseSummary = {
  id: string
  name: string | null
  searchApiVersion: string
  bookingApiVersion: string
  sabreConfigured: boolean
  zentrumhubConfigured: boolean
  createdAt: string | null
  modifiedAt: string | null
}

export type EnterpriseCredentials = {
  sabre: {
    configured: boolean
    clientId: MaskedSecret
    clientSecret: MaskedSecret
    username: string | null
    password: MaskedSecret
    pseudoCityCode: string | null
    rateCodes: string[] | null
    session: { hasToken: boolean; expiresAt: string | null; refreshedAt: string | null }
  }
  zentrumhub: {
    configured: boolean
    apiKey: MaskedSecret
    accountId: string | null
    channelId: string | null
  }
}

export type Enterprise = {
  id: string
  name: string | null
  searchApiVersion: string
  bookingApiVersion: string
  customFields: unknown[]
  credentials: EnterpriseCredentials
  createdAt: string | null
  modifiedAt: string | null
}

export type SabreStatus = {
  enterprise: { id: string; name: string | null }
  credentials: {
    clientId: boolean
    clientSecret: boolean
    username: string | null
    password: boolean
    pseudoCityCode: string | null
    configured: boolean
  }
  rateCodes: string[] | null
  session: { hasToken: boolean; expiresAt: string | null; refreshedAt: string | null }
  hotels: { links: number; sabreEligible: number; alreadyProbed: number }
}

export type Paginated<T> = { data: T[]; meta: { total: number; skip: number; limit: number } }

export type ApiVersion = 'v1.0' | 'v2.0'

export function listEnterprises(params: { q?: string; skip?: number; limit?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.skip != null) qs.set('skip', String(params.skip))
  if (params.limit != null) qs.set('limit', String(params.limit))
  const s = qs.toString()
  return apiRequest<Paginated<EnterpriseSummary>>(`/v1.0/enterprises${s ? `?${s}` : ''}`)
}

export function getEnterprise(id: string) {
  return apiRequest<{ data: Enterprise }>(`/v1.0/enterprises/${id}`).then((r) => r.data)
}

export function createEnterprise(body: {
  name: string
  searchApiVersion?: ApiVersion
  bookingApiVersion?: ApiVersion
}) {
  return apiRequest<{ data: Enterprise }>('/v1.0/enterprises', { method: 'POST', body }).then((r) => r.data)
}

export function updateEnterprise(
  id: string,
  body: { name?: string; searchApiVersion?: ApiVersion; bookingApiVersion?: ApiVersion }
) {
  return apiRequest<{ data: Enterprise }>(`/v1.0/enterprises/${id}`, { method: 'PATCH', body }).then((r) => r.data)
}

export type CredentialsUpdate = {
  sabre?: Partial<{
    clientId: string
    clientSecret: string
    username: string
    password: string
    pseudoCityCode: string
    rateCodes: string[]
  }>
  zentrumhub?: Partial<{ apiKey: string; accountId: string; channelId: string }>
}

export function updateCredentials(id: string, body: CredentialsUpdate) {
  return apiRequest<{ data: Enterprise }>(`/v1.0/enterprises/${id}/credentials`, { method: 'PUT', body }).then(
    (r) => r.data
  )
}

export function getSabreStatus(id: string) {
  return apiRequest<{ data: SabreStatus }>(`/v1.0/enterprises/${id}/sabre-status`).then((r) => r.data)
}

export type EnterpriseHotel = {
  id: string
  hotelId: string
  name: string | null
  city: string | null
  sabreCode: string | null
  rateCodes: string[]
}

export function listEnterpriseHotels(
  id: string,
  params: { q?: string; skip?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.skip != null) qs.set('skip', String(params.skip))
  qs.set('limit', String(params.limit ?? 25))
  return apiRequest<Paginated<EnterpriseHotel>>(`/v1.0/enterprises/${id}/hotels?${qs.toString()}`)
}
