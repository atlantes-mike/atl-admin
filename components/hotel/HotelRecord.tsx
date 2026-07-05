'use client'

import { useMemo, useState } from 'react'
import { Star, X } from 'lucide-react'
import { useAmenityMap, useBrandMap, useLoyaltyMap } from '@/hooks/useReferences'
import { Badge } from '@/components/ui'

export type Img = { url?: string; caption?: string; size?: string }
export type RawHotel = {
  name?: string
  code?: string
  status?: string
  starRating?: number
  category?: string
  vibe?: string
  brand?: string
  chainName?: string
  collectionName?: string
  loyaltyProgram?: string
  address?: { line1?: string; line2?: string; line3?: string; city?: string; state?: string; postalCode?: string; country?: string }
  geolocation?: { coordinates?: number[] }
  nearByAttractions?: { name?: string; distance?: number; unit?: string }[]
  suppliers?: { name?: string; hotelId?: string; hotelName?: string }[]
  blockChannels?: string[]
  review?: { provider?: string; count?: number; rating?: number }
  checkInInfo?: { checkInTime?: string; specialInstructions?: string[] }
  checkOutInfo?: { checkOutTime?: string }
  fees?: { feeType?: string; text?: string }[]
  onsitePayments?: string[]
  spokenLanguages?: string[]
  contact?: { phones?: string[] }
  website?: string
  amenities?: string[]
  descriptions?: { type?: string; text?: string }[]
  heroImages?: string[]
  heroVideo?: string
  images?: Img[]
  embeddingUpdatedAt?: string
  embeddedTextHash?: string
  createdAt?: string
  modifiedAt?: string
}

export const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : '—')
const stripTags = (html: string) => html.replace(/<[^>]+>/g, '').trim()
const firstImage = (h: RawHotel) => h.heroImages?.[0] ?? h.images?.find((im) => im.url)?.url

function Spec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="self-start rounded-lg border border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">{title}</div>
      <div className="px-4 py-2">{children}</div>
    </div>
  )
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 text-sm">
      <span className="shrink-0 text-stone-500">{label}</span>
      <span className="min-w-0 break-words text-right text-stone-800">{children}</span>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-700">{children}</span>
}

const dash = <span className="text-stone-400">—</span>

/** Identity bar — thumbnail, name, stars, status, code, city/country, supplier chips. */
export function HotelIdentityHeader({ hotel, id }: { hotel: RawHotel; id: string }) {
  const addr = hotel.address ?? {}
  const hero = firstImage(hotel)
  return (
    <div className="mb-4 flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-stone-900">{hotel.name ?? '(unnamed)'}</h1>
          {typeof hotel.starRating === 'number' && hotel.starRating > 0 && (
            <span className="flex items-center gap-0.5 text-amber-600">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
              ))}
            </span>
          )}
          {hotel.status && <Badge tone={hotel.status === 'active' ? 'green' : 'gray'}>{hotel.status}</Badge>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
          <span className="font-mono">{hotel.code ?? id}</span>
          {(addr.city || addr.country) && <><span>·</span><span>{[addr.city, addr.country].filter(Boolean).join(', ')}</span></>}
          {(hotel.suppliers ?? []).length > 0 && <span>·</span>}
          {(hotel.suppliers ?? []).map((s) => (
            <Badge key={s.name} tone={s.name === 'sabre' ? 'blue' : 'gray'}>{s.name}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The full dense record body — spec grid, amenities, descriptions, gallery, raw JSON. */
export function HotelRecordBody({ hotel, id }: { hotel: RawHotel; id: string }) {
  const brandMap = useBrandMap()
  const amenityMap = useAmenityMap()
  const loyaltyMap = useLoyaltyMap()
  const [lightbox, setLightbox] = useState<string | null>(null)
  const h = hotel

  const gallery = useMemo(() => {
    const items: Img[] = [...(h.heroImages ?? []).map((url) => ({ url, caption: 'hero' })), ...(h.images ?? [])]
    return items.filter((x) => Boolean(x.url))
  }, [h.heroImages, h.images])

  const amenityGroups = useMemo(() => {
    const groups = new Map<string, string[]>()
    for (const aid of h.amenities ?? []) {
      const a = amenityMap.get(aid)
      const cat = a?.category ?? 'Other'
      if (!groups.has(cat)) groups.set(cat, [])
      groups.get(cat)!.push(a?.name ?? aid)
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [h.amenities, amenityMap])

  const addr = h.address ?? {}
  const addressLine = [addr.line1, addr.line2, addr.line3, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')
  const coords = h.geolocation?.coordinates
  const brandName = h.brand ? brandMap.get(h.brand)?.name ?? h.brand : null
  const loyaltyName = h.loyaltyProgram ? loyaltyMap.get(h.loyaltyProgram)?.name ?? h.loyaltyProgram : null

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Spec title="Identity">
          <KV label="Code"><span className="font-mono">{h.code ?? '—'}</span></KV>
          <KV label="Status">{h.status ?? dash}</KV>
          <KV label="Stars">{h.starRating ?? dash}</KV>
          <KV label="Category">{h.category ?? dash}</KV>
          <KV label="Vibe">{h.vibe ?? dash}</KV>
        </Spec>

        <Spec title="Classification">
          <KV label="Brand">{brandName ?? dash}</KV>
          <KV label="Chain">{h.chainName ?? dash}</KV>
          <KV label="Collection">{h.collectionName ?? dash}</KV>
          <KV label="Loyalty">{loyaltyName ?? dash}</KV>
        </Spec>

        <Spec title="Location">
          <KV label="Address">{addressLine || dash}</KV>
          <KV label="Coordinates">{coords && coords.length === 2 ? <span className="font-mono text-xs">{coords[1]}, {coords[0]}</span> : dash}</KV>
          {(h.nearByAttractions ?? []).length > 0 && (
            <KV label="Nearby"><span className="text-xs">{(h.nearByAttractions ?? []).slice(0, 4).map((n) => `${n.name} (${n.distance}${n.unit ?? ''})`).join(' · ')}</span></KV>
          )}
        </Spec>

        <Spec title="Suppliers">
          {(h.suppliers ?? []).length === 0 && <p className="py-1 text-sm text-stone-400">None</p>}
          {(h.suppliers ?? []).map((s, i) => (
            <KV key={`${s.name}-${i}`} label={s.name ?? 'supplier'}>
              <span className="font-mono text-xs">{s.hotelId ?? '—'}</span>
              {s.hotelName ? <span className="ml-2 text-xs text-stone-500">{s.hotelName}</span> : null}
            </KV>
          ))}
          {(h.blockChannels ?? []).length > 0 && <KV label="Blocked">{(h.blockChannels ?? []).join(', ')}</KV>}
        </Spec>

        <Spec title="Review">
          <KV label="Provider">{h.review?.provider ?? dash}</KV>
          <KV label="Rating">{typeof h.review?.rating === 'number' ? `${h.review.rating} / 5` : dash}</KV>
          <KV label="Count">{typeof h.review?.count === 'number' ? h.review.count.toLocaleString() : dash}</KV>
        </Spec>

        <Spec title="Policies & contact">
          <KV label="Check-in">{h.checkInInfo?.checkInTime ?? dash}</KV>
          <KV label="Check-out">{h.checkOutInfo?.checkOutTime ?? dash}</KV>
          {(h.fees ?? []).length > 0 && <KV label="Fees">{(h.fees ?? []).map((f) => f.feeType).filter(Boolean).join(', ') || dash}</KV>}
          {(h.onsitePayments ?? []).length > 0 && <KV label="Payments">{(h.onsitePayments ?? []).join(', ')}</KV>}
          {(h.spokenLanguages ?? []).length > 0 && <KV label="Languages">{(h.spokenLanguages ?? []).slice(0, 8).join(', ')}</KV>}
          {(h.contact?.phones ?? []).length > 0 && <KV label="Phone">{(h.contact?.phones ?? [])[0]}</KV>}
          {h.website && <KV label="Website"><span className="truncate">{h.website}</span></KV>}
        </Spec>

        <Spec title="Search index">
          <KV label="Embedded">{h.embeddingUpdatedAt ? <Badge tone="green">yes</Badge> : <Badge tone="gray">no</Badge>}</KV>
          <KV label="Updated">{fmtDate(h.embeddingUpdatedAt)}</KV>
          {h.embeddedTextHash && <KV label="Hash"><span className="font-mono text-xs">{h.embeddedTextHash.slice(0, 12)}…</span></KV>}
        </Spec>

        <Spec title="Record">
          <KV label="Created">{fmtDate(h.createdAt)}</KV>
          <KV label="Modified">{fmtDate(h.modifiedAt)}</KV>
          <KV label="Hotel id"><span className="font-mono text-xs">{id}</span></KV>
        </Spec>
      </div>

      {amenityGroups.length > 0 && (
        <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">Amenities · {(h.amenities ?? []).length}</div>
          <div className="space-y-3">
            {amenityGroups.map(([cat, names]) => (
              <div key={cat}>
                <div className="mb-1 text-xs font-medium text-stone-500">{cat}</div>
                <div className="flex flex-wrap gap-1.5">{names.map((n, i) => <Chip key={`${n}-${i}`}>{n}</Chip>)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(h.descriptions ?? []).length > 0 && (
        <div className="mt-4 rounded-lg border border-stone-200 bg-white px-4">
          <div className="py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">Descriptions</div>
          {(h.descriptions ?? []).map((d, i) => (
            <details key={i} className="border-t border-stone-100 py-2">
              <summary className="cursor-pointer text-sm font-medium text-stone-700">{d.type ?? 'description'}</summary>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">{stripTags(d.text ?? '')}</p>
            </details>
          ))}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">Images · {gallery.length}</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {gallery.slice(0, 40).map((im, i) => (
              <button key={i} type="button" onClick={() => setLightbox(im.url ?? null)} className="group relative aspect-[4/3] overflow-hidden rounded-md bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt={im.caption ?? ''} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </button>
            ))}
          </div>
        </div>
      )}

      <details className="mt-4 rounded-lg border border-stone-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">Raw JSON</summary>
        <pre className="overflow-x-auto rounded-b-lg bg-stone-900 p-4 text-xs leading-relaxed text-stone-100">{JSON.stringify(h, null, 2)}</pre>
      </details>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8" onClick={() => setLightbox(null)}>
          <button type="button" className="absolute right-4 top-4 text-white/80 hover:text-white" onClick={() => setLightbox(null)}>
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </>
  )
}
