import { useAuthStore } from '@/stores/authStore'
import { getRefreshedToken } from '@/lib/auth/refresh'

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_KEY_ID = process.env.NEXT_PUBLIC_ADMIN_API_KEY_ID ?? ''
const API_KEY_SECRET = process.env.NEXT_PUBLIC_ADMIN_API_KEY_SECRET ?? ''
const BASIC_AUTH = btoa(`${API_KEY_ID}:${API_KEY_SECRET}`)

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  noAuth?: boolean
}

async function doRequest(path: string, options: RequestOptions, token: string | null) {
  const { body, noAuth, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: token && !noAuth ? `Bearer ${token}` : `Basic ${BASIC_AUTH}`,
    ...(rest.headers as Record<string, string>)
  }
  return fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let token = useAuthStore.getState().token
  let res = await doRequest(path, options, token)

  if (res.status === 401 && !options.noAuth) {
    token = await getRefreshedToken()
    res = await doRequest(path, options, token)
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiError(error.message ?? 'Request failed', res.status, error)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
