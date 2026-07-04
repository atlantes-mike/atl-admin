'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus } from 'lucide-react'
import { useAccounts, useCreateAccount } from '@/hooks/useAccounts'
import { useEnterprises } from '@/hooks/useEnterprises'
import { statusTone, roleTone, ALL_STATUSES } from '@/lib/agentDisplay'
import { Badge, Button, Card, Input, Select, Spinner } from '@/components/ui'

export default function AgentsPage() {
  const router = useRouter()
  const [enterpriseId, setEnterpriseId] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  const { data: enterprises } = useEnterprises()
  const entOptions = enterprises?.data ?? []
  const entName = useMemo(
    () => new Map(entOptions.map((e) => [e.id, e.name ?? '(unnamed)'])),
    [entOptions]
  )

  const { data, isLoading, isError, error } = useAccounts({
    enterpriseId: enterpriseId || undefined,
    status: status || undefined,
    q: q || undefined
  })

  const create = useCreateAccount()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ email: '', enterpriseId: '', firstName: '', lastName: '' })

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.trim() || !form.enterpriseId) return
    const acct = await create.mutateAsync({
      email: form.email.trim(),
      enterpriseId: form.enterpriseId,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      status: 'invited'
    })
    setForm({ email: '', enterpriseId: '', firstName: '', lastName: '' })
    setShowNew(false)
    router.push(`/agents/${acct.id}`)
  }

  const rows = data?.data ?? []

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">Agents</h1>
          <p className="text-sm text-stone-500">{data ? `${data.meta.total} total` : 'Enterprise accounts'}</p>
        </div>
        <Button onClick={() => setShowNew((s) => !s)}>
          <Plus className="h-4 w-4" /> New agent
        </Button>
      </div>

      {showNew && (
        <Card className="mb-4 p-4">
          <form onSubmit={onCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Select value={form.enterpriseId} onChange={(e) => setForm({ ...form, enterpriseId: e.target.value })}>
                <option value="">Select enterprise…</option>
                {entOptions.map((e) => (
                  <option key={e.id} value={e.id}>{e.name ?? '(unnamed)'}</option>
                ))}
              </Select>
              <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={create.isPending || !form.email.trim() || !form.enterpriseId}>
                {create.isPending ? 'Creating…' : 'Create agent'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              {create.isError && <span className="text-xs text-red-600">{(create.error as Error).message}</span>}
            </div>
            <p className="text-xs text-stone-400">Created as a travel_advisor with status “invited”. Adjust roles/status on the detail page.</p>
          </form>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Select value={enterpriseId} onChange={(e) => setEnterpriseId(e.target.value)}>
          <option value="">All enterprises</option>
          {entOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.name ?? '(unnamed)'}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Input placeholder="Search name / email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card>
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-500"><Spinner /> Loading…</div>
        )}
        {isError && <div className="p-6 text-sm text-red-600">{(error as Error).message}</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-500">No agents found.</div>
        )}
        {rows.map((a) => (
          <Link
            key={a.id}
            href={`/agents/${a.id}`}
            className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 last:border-0 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-stone-900">{a.fullName || a.email}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                <span className="truncate">{a.email}</span>
                {a.enterprise && <><span>·</span><span className="truncate">{entName.get(a.enterprise) ?? a.enterprise}</span></>}
              </div>
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
