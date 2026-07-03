import { apiRequest } from './client'
import type { Admin } from '@/types'

type TokenResponse = {
  accessToken: string
  tokenType: string
  refreshToken: string
  expiresIn: number
}

type MeResponse = {
  data: {
    id: string
    attributes: {
      email: string
      fullName?: string
      firstName?: string
      lastName?: string
      roles?: string[]
    }
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; refreshToken: string; admin: Admin }> {
  const tokenRes = await apiRequest<TokenResponse>('/v1.0/auth/token', {
    method: 'POST',
    body: { email, password, grantType: 'password' },
    noAuth: true
  })

  const { accessToken: token, refreshToken } = tokenRes

  const meRes = await apiRequest<MeResponse>('/v1.0/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  })

  const { id, attributes: attrs } = meRes.data
  const roles = attrs.roles ?? []

  // The admin portal is internal-only. The server still enforces atlantes_admin
  // scope on every admin route, but reject a non-admin token here too so a
  // tenant advisor can't even reach the shell.
  if (!roles.includes('atlantes_admin')) {
    throw new Error('This account is not authorized for the admin portal')
  }

  const name = attrs.fullName ?? ([attrs.firstName, attrs.lastName].filter(Boolean).join(' ') || email)
  const admin: Admin = { id, name, email: attrs.email ?? email, roles }

  return { token, refreshToken, admin }
}
