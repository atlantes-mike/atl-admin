import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listAmenities, listBrands, listLoyaltyPrograms, type RefItem } from '@/lib/api/references'

// Reference data is effectively static per session — cache hard and never refetch.
function useRefMap(key: string, fn: () => Promise<RefItem[]>) {
  const { data } = useQuery({
    queryKey: [key],
    queryFn: fn,
    staleTime: Infinity,
    gcTime: Infinity
  })
  return useMemo(() => new Map((data ?? []).map((x) => [x.id, x])), [data])
}

export const useBrandMap = () => useRefMap('ref-brands', listBrands)
export const useAmenityMap = () => useRefMap('ref-amenities', listAmenities)
export const useLoyaltyMap = () => useRefMap('ref-loyalty', listLoyaltyPrograms)
