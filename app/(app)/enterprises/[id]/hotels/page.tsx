'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEnterpriseHotels } from '@/hooks/useEnterprises'
import { Badge, Card, Input, Button, Spinner } from '@/components/ui'

const LIMIT = 25

export default function EnterpriseHotelsPage() {
  const { id } = useParams<{ id: string }>()
  const [q, setQ] = useState('')
  const [skip, setSkip] = useState(0)

  // Reset to the first page whenever the search changes.
  function onSearch(value: string) {
    setQ(value)
    setSkip(0)
  }

  const { data, isLoading, isError, error, isFetching } = useEnterpriseHotels(id, {
    q: q || undefined,
    skip,
    limit: LIMIT
  })

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const from = total === 0 ? 0 : skip + 1
  const to = Math.min(skip + LIMIT, total)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-stone-500">
          {data ? `${total.toLocaleString()} linked hotels` : 'Hotels'}
        </span>
        <Input
          placeholder="Search by name…"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        {isLoading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-500"><Spinner /> Loading…</div>}
        {isError && <div className="p-6 text-sm text-red-600">{(error as Error).message}</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-500">No hotels linked to this enterprise.</div>
        )}
        {rows.map((hotel) => (
          <Link
            key={hotel.id}
            href={`/enterprises/${id}/hotels/${hotel.hotelId}`}
            className="flex items-start justify-between gap-4 border-b border-stone-100 px-5 py-3.5 last:border-0 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-stone-900">{hotel.name ?? '(unnamed)'}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                {hotel.city && <span className="truncate">{hotel.city}</span>}
                {hotel.sabreCode && (
                  <>
                    {hotel.city && <span>·</span>}
                    <span className="font-mono">Sabre {hotel.sabreCode}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex max-w-[45%] flex-wrap justify-end gap-1">
              {hotel.rateCodes.length ? (
                hotel.rateCodes.map((code) => (
                  <Badge key={code} tone="gray">{code}</Badge>
                ))
              ) : (
                <span className="text-xs text-stone-400">no rate codes</span>
              )}
            </div>
          </Link>
        ))}
      </Card>

      {total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-stone-500">
          <span>{from}–{to} of {total.toLocaleString()}{isFetching ? ' · …' : ''}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - LIMIT))}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={to >= total} onClick={() => setSkip(skip + LIMIT)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
