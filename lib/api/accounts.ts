import { apiRequest } from './client'

// Unlike the enterprise endpoints (plain { data }), the accounts endpoints are
// JSON:API-shaped ({ data: { id, attributes } }) — flatten to a plain Account.
export type AccountRole = 'travel_advisor' | 'enterprise_admin' | 'atlantes_admin'
export type AccountStatus = 'disabled' | 'invited' | 'unverified' | 'enabled'

export type Account = {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  fullName?: string
  title?: string
  phone?: string
  roles: string[]
  status: string
  enterprise?: string
  createdAt?: string
  modifiedAt?: string
}

type JsonApiNode = { id: string; attributes: Record<string, unknown> }
type JsonApiItem = { data: JsonApiNode }
type JsonApiList = { data: JsonApiNode[]; meta: { total: number; skip: number; limit: number } }

function flatten(node: JsonApiNode): Account {
  const a = node.attributes
  return {
    id: node.id,
    email: a.email as string,
    username: a.username as string | undefined,
    firstName: a.firstName as string | undefined,
    lastName: a.lastName as string | undefined,
    fullName: a.fullName as string | undefined,
    title: a.title as string | undefined,
    phone: a.phone as string | undefined,
    roles: (a.roles as string[]) ?? [],
    status: a.status as string,
    enterprise: a.enterprise ? String(a.enterprise) : undefined,
    createdAt: a.createdAt as string | undefined,
    modifiedAt: a.modifiedAt as string | undefined
  }
}

export type AccountList = { data: Account[]; meta: { total: number; skip: number; limit: number } }

export async function listAccounts(
  params: { enterpriseId?: string; status?: string; q?: string; skip?: number; limit?: number } = {}
): Promise<AccountList> {
  const qs = new URLSearchParams()
  if (params.enterpriseId) qs.set('enterpriseId', params.enterpriseId)
  if (params.status) qs.set('status', params.status)
  if (params.q) qs.set('q', params.q)
  if (params.skip != null) qs.set('skip', String(params.skip))
  qs.set('limit', String(params.limit ?? 100))
  const res = await apiRequest<JsonApiList>(`/v1.0/accounts?${qs.toString()}`)
  return { data: (res.data ?? []).map(flatten), meta: res.meta }
}

export async function getAccount(id: string): Promise<Account> {
  const res = await apiRequest<JsonApiItem>(`/v1.0/accounts/${id}`)
  return flatten(res.data)
}

export async function createAccount(body: {
  email: string
  enterpriseId: string
  firstName?: string
  lastName?: string
  roles?: AccountRole[]
  status?: AccountStatus
}): Promise<Account> {
  const res = await apiRequest<JsonApiItem>('/v1.0/accounts', { method: 'POST', body })
  return flatten(res.data)
}

export async function updateAccount(
  id: string,
  body: {
    firstName?: string
    lastName?: string
    phone?: string
    title?: string
    roles?: AccountRole[]
    status?: AccountStatus
  }
): Promise<Account> {
  const res = await apiRequest<JsonApiItem>(`/v1.0/accounts/${id}`, { method: 'PATCH', body })
  return flatten(res.data)
}

export async function deleteAccount(id: string): Promise<void> {
  await apiRequest<void>(`/v1.0/accounts/${id}`, { method: 'DELETE' })
}
