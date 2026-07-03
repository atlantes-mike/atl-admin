import { useAuthStore } from '@/stores/authStore'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const BASIC_AUTH = btoa(
  `${process.env.NEXT_PUBLIC_ADMIN_API_KEY_ID ?? ''}:${process.env.NEXT_PUBLIC_ADMIN_API_KEY_SECRET ?? ''}`
)

// Singleton — if several requests 401 at once, only one refresh is fired.
let refreshPromise: Promise<string> | null = null

export async function getRefreshedToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const { refreshToken, clearAuth } = useAuthStore.getState()

    if (!refreshToken) {
      clearAuth()
      throw new Error('No refresh token available')
    }

    const res = await fetch(`${BASE_URL}/v1.0/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${BASIC_AUTH}`
      },
      body: JSON.stringify({ grantType: 'refreshToken', refreshToken })
    })

    if (!res.ok) {
      clearAuth()
      document.cookie = 'atl-admin-token=; path=/; max-age=0'
      throw new Error('Session expired')
    }

    const data = (await res.json()) as { accessToken: string; refreshToken: string }
    useAuthStore.getState().setAuth(useAuthStore.getState().admin!, data.accessToken, data.refreshToken)
    document.cookie = `atl-admin-token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    return data.accessToken
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}
