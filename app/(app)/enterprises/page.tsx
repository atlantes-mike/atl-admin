'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus, Search } from 'lucide-react'
import { useEnterprises, useCreateEnterprise } from '@/hooks/useEnterprises'
import { Badge, Button, Card, Input, Spinner } from '@/components/ui'

export default function EnterprisesPage() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const { data, isLoading, isError, error } = useEnterprises(q || undefined)
  const create = useCreateEnterprise()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const ent = await create.mutateAsync({ name: newName.trim() })
    setNewName('')
    setShowNew(false)
    router.push(`/enterprises/${ent.id}`)
  }

  const rows = data?.data ?? []

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">Enterprises</h1>
          <p className="text-sm text-stone-500">{data ? `${data.meta.total} total` : 'Tenant configuration & supplier credentials'}</p>
        </div>
        <Button onClick={() => setShowNew((s) => !s)}>
          <Plus className="h-4 w-4" /> New enterprise
        </Button>
      </div>

      {showNew && (
        <Card className="mb-4 p-4">
          <form onSubmit={onCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-stone-600">Name</label>
              <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Acme Travel" />
            </div>
            <Button type="submit" disabled={create.isPending || !newName.trim()}>
              {create.isPending ? 'Creating…' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
          </form>
          {create.isError && (
            <p className="mt-2 text-xs text-red-600">{(create.error as Error).message}</p>
          )}
        </Card>
      )}

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name…" className="pl-9" />
      </div>

      <Card>
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-500">
            <Spinner /> Loading…
          </div>
        )}
        {isError && <div className="p-6 text-sm text-red-600">{(error as Error).message}</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-500">No enterprises found.</div>
        )}
        {rows.map((ent) => (
          <Link
            key={ent.id}
            href={`/enterprises/${ent.id}`}
            className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 last:border-0 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-stone-900">{ent.name ?? '(unnamed)'}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                <span>search {ent.searchApiVersion}</span>
                <span>·</span>
                <span>booking {ent.bookingApiVersion}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={ent.sabreConfigured ? 'green' : 'gray'}>
                Sabre {ent.sabreConfigured ? 'set' : '—'}
              </Badge>
              <Badge tone={ent.zentrumhubConfigured ? 'green' : 'gray'}>
                ZH {ent.zentrumhubConfigured ? 'set' : '—'}
              </Badge>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </div>
          </Link>
        ))}
      </Card>
    </div>
  )
}
