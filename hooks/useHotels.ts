import { useQuery } from '@tanstack/react-query'
import * as api from '@/lib/api/hotels'

export function useCatalogHotels(params: { q?: string; supplier?: string; status?: string; skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['catalog-hotels', params],
    queryFn: () => api.listCatalogHotels(params),
    placeholderData: (prev) => prev // keep the current page visible while the next loads
  })
}

export function useCatalogHotel(id: string) {
  return useQuery({
    queryKey: ['catalog-hotel', id],
    queryFn: () => api.getCatalogHotel(id),
    enabled: Boolean(id)
  })
}
