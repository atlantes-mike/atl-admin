import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Admin } from '@/types'

type AuthStore = {
  admin: Admin | null
  token: string | null
  refreshToken: string | null
  setAuth: (admin: Admin, token: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      refreshToken: null,
      setAuth: (admin, token, refreshToken) => set({ admin, token, refreshToken }),
      clearAuth: () => set({ admin: null, token: null, refreshToken: null })
    }),
    {
      name: 'atl-admin-auth',
      onRehydrateStorage: () => (state) => {
        const isValid = state?.admin && state?.token && state?.refreshToken
        if (!isValid) {
          state?.clearAuth()
          if (typeof document !== 'undefined') {
            document.cookie = 'atl-admin-token=; path=/; max-age=0'
          }
        }
      }
    }
  )
)
