import { apiRequest } from './client'

// Master reference lists (brands / amenities / loyalty programs). Small, static
// catalogs used to resolve the ObjectId refs on a hotel to human names. Each
// fits in a single call (amenities is the largest at ~660; limit maxes at 1000).
export type RefItem = {
  id: string
  name: string
  code?: string
  category?: string
  group?: string
  [k: string]: unknown
}

// Paginate at a page size within every reference list's max (brands 300,
// amenities 1000, loyalty 200), looping on meta.total so it stays correct if a
// catalog grows. Runs once per session (React Query caches the result forever).
async function listAll(path: string): Promise<RefItem[]> {
  const pageSize = 100
  const items: RefItem[] = []
  for (let skip = 0, guard = 0; guard < 100; guard++, skip += pageSize) {
    const res = await apiRequest<{ data: RefItem[]; meta?: { total: number } }>(`${path}?limit=${pageSize}&skip=${skip}`)
    const page = res.data ?? []
    items.push(...page)
    const total = res.meta?.total ?? items.length
    if (page.length === 0 || items.length >= total) break
  }
  return items
}

export const listBrands = () => listAll('/v1.0/brands')
export const listAmenities = () => listAll('/v1.0/amenities')
export const listLoyaltyPrograms = () => listAll('/v1.0/loyalty-programs')
