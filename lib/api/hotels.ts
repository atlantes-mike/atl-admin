import { apiRequest } from './client'

// The raw Hotel master catalog (GET /v1.0/catalog/hotels) — distinct from the
// per-enterprise EnterpriseHotel links. Read-only for admins.
export type HotelSupplier = { name?: string; hotelId?: string }

export type HotelSummary = {
  id: string
  name: string | null
  code: string | null
  city: string | null
  country: string | null
  brand: string | null
  starRating: number | null
  suppliers: HotelSupplier[]
  status: string | null
}

// Detail is the raw doc — loosely typed; the UI reads a known subset.
export type HotelDetail = Record<string, unknown>

type Paginated<T> = { data: T[]; meta: { total: number; skip: number; limit: number } }

export function listCatalogHotels(
  params: { q?: string; supplier?: string; status?: string; skip?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.supplier) qs.set('supplier', params.supplier)
  if (params.status) qs.set('status', params.status)
  if (params.skip != null) qs.set('skip', String(params.skip))
  qs.set('limit', String(params.limit ?? 25))
  return apiRequest<Paginated<HotelSummary>>(`/v1.0/catalog/hotels?${qs.toString()}`)
}

export function getCatalogHotel(id: string) {
  return apiRequest<{ data: HotelDetail }>(`/v1.0/catalog/hotels/${id}`).then((r) => r.data)
}
