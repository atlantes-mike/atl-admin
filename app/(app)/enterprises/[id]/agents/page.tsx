'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, Plus } from 'lucide-react'
import { useAccounts, useCreateAccount } from '@/hooks/useAccounts'
import { statusTone, roleTone, ALL_STATUSES } from '@/lib/agentDisplay'
import { Badge, Button, Card, Input, Select, Spinner } from '@/components/ui'

export default function EnterpriseAgentsPage() {
  const { id: enterpriseId } = useParams<{ id: string }>()
  const router = useRouter()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  const { data, isLoading, isError, error } = useAccounts({
    enterpriseId,
    status: status || undefined,
    q: q || undefined
  })

  const create = useCreateAccount()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '' })

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.trim()) return
    const acct = await create.mutateAsync({
      email: form.email.trim(),
      enterpriseId,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      status: 'invited'
    })
    setForm({ email: '', firstName: '', lastName: '' })
    setShowNew(false)
    router.push(`/enterprises/${enterpriseId}/agents/${acct.id}`)
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-500">{data ? `${data.meta.total} agents` : 'Agents'}</span>
        <Button onClick={() => setShowNew((s) => !s)}>
          <Plus className="h-4 w-4" /> New agent
        </Button>
      </div>

      {showNew && (
        <Card className="p-4">
          <form onSubmit={onCreate} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={create.isPending || !form.email.trim()}>
                {create.isPending ? 'Creating…' : 'Create agent'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              {create.isError && <span className="text-xs text-red-600">{(create.error as Error).message}</span>}
            </div>
            <p className="text-xs text-stone-400">Created in this enterprise as a travel_advisor (status “invited”). Adjust roles/status on the detail page.</p>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Input placeholder="Search name / email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card>
        {isLoading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-500"><Spinner /> Loading…</div>}
        {isError && <div className="p-6 text-sm text-red-600">{(error as Error).message}</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-500">No agents in this enterprise.</div>
        )}
        {rows.map((a) => (
          <Link
            key={a.id}
            href={`/enterprises/${enterpriseId}/agents/${a.id}`}
            className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 last:border-0 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-stone-900">{a.fullName || a.email}</div>
              <div className="mt-1 truncate text-xs text-stone-500">{a.email}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {a.roles.map((r) => (
                <Badge key={r} tone={roleTone(r)}>{r.replace('_', ' ')}</Badge>
              ))}
              <Badge tone={statusTone(a.status)}>{a.status}</Badge>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </div>
          </Link>
        ))}
      </Card>
    </div>
  )
}
