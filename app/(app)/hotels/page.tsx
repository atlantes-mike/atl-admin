'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Star } from 'lucide-react'
import { useCatalogHotels } from '@/hooks/useHotels'
import { Badge, Button, Card, Input, Select, Spinner } from '@/components/ui'

const LIMIT = 25

export default function HotelsPage() {
  const [q, setQ] = useState('')
  const [supplier, setSupplier] = useState('')
  const [skip, setSkip] = useState(0)

  function reset(setter: (v: string) => void) {
    return (v: string) => {
      setter(v)
      setSkip(0)
    }
  }

  const { data, isLoading, isError, error, isFetching } = useCatalogHotels({
    q: q || undefined,
    supplier: supplier || undefined,
    skip,
    limit: LIMIT
  })

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const from = total === 0 ? 0 : skip + 1
  const to = Math.min(skip + LIMIT, total)

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-stone-900">Hotels</h1>
        <p className="text-sm text-stone-500">
          {data ? `${total.toLocaleString()} in the raw catalog` : 'Global hotel master catalog (read-only)'}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Input className="col-span-2" placeholder="Search by name…" value={q} onChange={(e) => reset(setQ)(e.target.value)} />
        <Select value={supplier} onChange={(e) => reset(setSupplier)(e.target.value)}>
          <option value="">All suppliers</option>
          <option value="sabre">Sabre</option>
          <option value="zentrumhub">Zentrumhub</option>
        </Select>
      </div>

      <Card>
        {isLoading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-500"><Spinner /> Loading…</div>}
        {isError && <div className="p-6 text-sm text-red-600">{(error as Error).message}</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-500">No hotels found.</div>
        )}
        {rows.map((hotel) => (
          <Link
            key={hotel.id}
            href={`/hotels/${hotel.id}`}
            className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 last:border-0 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-stone-900">{hotel.name ?? '(unnamed)'}</span>
                {typeof hotel.starRating === 'number' && hotel.starRating > 0 && (
                  <span className="flex shrink-0 items-center gap-0.5 text-xs text-amber-600">
                    <Star className="h-3 w-3 fill-amber-500 stroke-amber-500" />
                    {hotel.starRating}
                  </span>
                )}
              </div>
              <div className="mt-0.5 truncate text-xs text-stone-500">
                {[hotel.city, hotel.country].filter(Boolean).join(', ')}
                {hotel.brand ? ` · ${hotel.brand}` : ''}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {hotel.suppliers.map((s) => (
                <Badge key={s.name} tone={s.name === 'sabre' ? 'blue' : 'gray'}>{s.name}</Badge>
              ))}
              {hotel.status && <Badge tone={hotel.status === 'active' ? 'green' : 'gray'}>{hotel.status}</Badge>}
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </div>
          </Link>
        ))}
      </Card>

      {total > LIMIT && (
        <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
          <span>{from}–{to} of {total.toLocaleString()}{isFetching ? ' · …' : ''}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - LIMIT))}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={to >= total} onClick={() => setSkip(skip + LIMIT)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
