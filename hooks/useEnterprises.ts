import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api/enterprises'

export function useEnterprises(q?: string) {
  return useQuery({
    queryKey: ['enterprises', q ?? ''],
    queryFn: () => api.listEnterprises({ q, limit: 100 })
  })
}

export function useEnterprise(id: string) {
  return useQuery({
    queryKey: ['enterprise', id],
    queryFn: () => api.getEnterprise(id),
    enabled: Boolean(id)
  })
}

export function useSabreStatus(id: string) {
  return useQuery({
    queryKey: ['sabre-status', id],
    queryFn: () => api.getSabreStatus(id),
    enabled: Boolean(id)
  })
}

export function useEnterpriseHotels(id: string, params: { q?: string; skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['enterprise-hotels', id, params],
    queryFn: () => api.listEnterpriseHotels(id, params),
    enabled: Boolean(id),
    placeholderData: (prev) => prev // keep the current page visible while the next loads
  })
}

export function useCreateEnterprise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createEnterprise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enterprises'] })
  })
}

export function useUpdateEnterprise(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof api.updateEnterprise>[1]) => api.updateEnterprise(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enterprise', id] })
      qc.invalidateQueries({ queryKey: ['enterprises'] })
    }
  })
}

export function useUpdateCredentials(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: api.CredentialsUpdate) => api.updateCredentials(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enterprise', id] })
      qc.invalidateQueries({ queryKey: ['sabre-status', id] })
    }
  })
}
