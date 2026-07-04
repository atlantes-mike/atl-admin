'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import { useCatalogHotel } from '@/hooks/useHotels'
import { Badge, Card, CardHeader, Spinner } from '@/components/ui'

type RawHotel = {
  name?: string
  code?: string
  starRating?: number
  status?: string
  address?: { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string; country?: string }
  geolocation?: { coordinates?: number[] }
  suppliers?: { name?: string; hotelId?: string; hotelName?: string }[]
  chainName?: string
  collectionName?: string
  category?: string
  vibe?: string
  website?: string
  url?: string
  amenities?: unknown[]
  images?: unknown[]
}

function imageUrl(im: unknown): string | null {
  if (typeof im === 'string') return im
  if (im && typeof im === 'object') {
    const u = (im as { url?: string; link?: string }).url ?? (im as { link?: string }).link
    return typeof u === 'string' ? u : null
  }
  return null
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-stone-500">{label}</span>
      <span className="text-right text-stone-800">{children}</span>
    </div>
  )
}

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useCatalogHotel(id)
  const h = (data ?? {}) as RawHotel

  const addr = h.address ?? {}
  const addressLine = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')
  const coords = h.geolocation?.coordinates
  const images = (h.images ?? []).map(imageUrl).filter((u): u is string => Boolean(u)).slice(0, 6)
  const classification = [
    ['Category', h.category],
    ['Chain', h.chainName],
    ['Collection', h.collectionName],
    ['Vibe', h.vibe]
  ].filter(([, v]) => Boolean(v)) as [string, string][]

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/hotels" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Hotels
      </Link>

      {isLoading && <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500"><Spinner /> Loading…</div>}
      {isError && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{(error as Error).message}</div>}

      {data && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-stone-900">{h.name ?? '(unnamed)'}</h1>
                {typeof h.starRating === 'number' && h.starRating > 0 && (
                  <span className="flex items-center gap-0.5 text-sm text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" /> {h.starRating}
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-stone-400">{h.code ?? id}</p>
            </div>
            {h.status && <Badge tone={h.status === 'active' ? 'green' : 'gray'}>{h.status}</Badge>}
          </div>

          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {images.map((src) => (
                <img key={src} src={src} alt="" className="h-24 w-32 shrink-0 rounded-lg object-cover" />
              ))}
            </div>
          )}

          <Card>
            <CardHeader title="Location" />
            <div className="divide-y divide-stone-100 p-5">
              <Row label="Address">{addressLine || <span className="text-stone-400">—</span>}</Row>
              <Row label="Coordinates">
                {coords && coords.length === 2 ? (
                  <span className="font-mono text-xs">{coords[1]}, {coords[0]}</span>
                ) : (
                  <span className="text-stone-400">—</span>
                )}
              </Row>
              {(h.website || h.url) && <Row label="Website"><span className="truncate">{h.website ?? h.url}</span></Row>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Suppliers" description="Which providers map this hotel + their codes" />
            <div className="divide-y divide-stone-100 p-5">
              {(h.suppliers ?? []).length === 0 && <p className="py-1.5 text-sm text-stone-400">None</p>}
              {(h.suppliers ?? []).map((s, i) => (
                <Row key={`${s.name}-${i}`} label={s.name ?? 'supplier'}>
                  <span className="font-mono text-xs">{s.hotelId ?? '—'}</span>
                </Row>
              ))}
            </div>
          </Card>

          {classification.length > 0 && (
            <Card>
              <CardHeader title="Classification" />
              <div className="divide-y divide-stone-100 p-5">
                {classification.map(([label, value]) => (
                  <Row key={label} label={label}>{value}</Row>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Content" />
            <div className="divide-y divide-stone-100 p-5">
              <Row label="Amenities">{(h.amenities ?? []).length} mapped</Row>
              <Row label="Images">{(h.images ?? []).length}</Row>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
