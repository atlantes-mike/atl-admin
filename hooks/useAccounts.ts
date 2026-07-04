import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api/accounts'

export function useAccounts(params: { enterpriseId?: string; status?: string; q?: string }) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => api.listAccounts({ ...params, limit: 100 })
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => api.getAccount(id),
    enabled: Boolean(id)
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] })
  })
}

export function useUpdateAccount(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof api.updateAccount>[1]) => api.updateAccount(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['account', id] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    }
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] })
  })
}
