'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts'
import type { AccountRole, AccountStatus } from '@/lib/api/accounts'
import { ALL_ROLES, ALL_STATUSES, statusTone } from '@/lib/agentDisplay'
import { Badge, Button, Card, CardHeader, Field, Input, Select, Spinner } from '@/components/ui'

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: acct, isLoading, isError, error } = useAccount(id)
  const update = useUpdateAccount(id)
  const del = useDeleteAccount()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [roles, setRoles] = useState<AccountRole[]>([])
  const [status, setStatus] = useState<AccountStatus>('invited')

  // Seed local form state once the account loads.
  useEffect(() => {
    if (!acct) return
    setFirstName(acct.firstName ?? '')
    setLastName(acct.lastName ?? '')
    setPhone(acct.phone ?? '')
    setRoles(acct.roles as AccountRole[])
    setStatus(acct.status as AccountStatus)
  }, [acct])

  function toggleRole(role: AccountRole) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  function save() {
    if (roles.length === 0) return
    // Guard the powerful, cross-tenant role behind an explicit confirmation.
    const grantingAdmin = roles.includes('atlantes_admin') && !(acct?.roles ?? []).includes('atlantes_admin')
    if (grantingAdmin && !window.confirm('Grant the cross-tenant atlantes_admin role? This gives full internal admin access.')) {
      return
    }
    update.mutate({ firstName, lastName, phone, roles, status })
  }

  function onDelete() {
    if (!window.confirm('Soft-delete this agent? They will be removed from lists and unable to sign in.')) return
    del.mutate(id, { onSuccess: () => router.push('/agents') })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href="/agents" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Agents
      </Link>

      {isLoading && <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500"><Spinner /> Loading…</div>}
      {isError && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{(error as Error).message}</div>}

      {acct && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-stone-900">{acct.fullName || acct.email}</h1>
              <p className="text-xs text-stone-500">{acct.email}</p>
            </div>
            <Badge tone={statusTone(acct.status)}>{acct.status}</Badge>
          </div>

          <Card>
            <CardHeader title="Profile" />
            <div className="grid grid-cols-2 gap-3 p-5">
              <Field label="First name"><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
              <Field label="Last name"><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
              <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Access" description="Roles and status. Email is the immutable login key." />
            <div className="space-y-4 p-5">
              <div>
                <span className="mb-2 block text-xs font-medium text-stone-600">Roles</span>
                <div className="space-y-2">
                  {ALL_ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm text-stone-800">
                      <input type="checkbox" checked={roles.includes(role)} onChange={() => toggleRole(role)} className="h-4 w-4" />
                      {role.replace('_', ' ')}
                      {role === 'atlantes_admin' && <span className="text-xs text-blue-600">(internal, cross-tenant)</span>}
                    </label>
                  ))}
                </div>
                {roles.length === 0 && <p className="mt-1 text-xs text-red-600">At least one role is required.</p>}
              </div>
              <Field label="Status">
                <Select value={status} onChange={(e) => setStatus(e.target.value as AccountStatus)}>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-center gap-3 pt-1">
                <Button onClick={save} disabled={update.isPending || roles.length === 0}>
                  {update.isPending ? 'Saving…' : 'Save changes'}
                </Button>
                {update.isSuccess && <span className="text-xs text-emerald-600">Saved</span>}
                {update.isError && <span className="text-xs text-red-600">{(update.error as Error).message}</span>}
              </div>
            </div>
          </Card>

          <Card className="border-red-200">
            <CardHeader title="Danger zone" description="Soft-delete removes the agent from lists and blocks sign-in." />
            <div className="p-5">
              <Button variant="danger" onClick={onDelete} disabled={del.isPending}>
                {del.isPending ? 'Deleting…' : 'Delete agent'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
