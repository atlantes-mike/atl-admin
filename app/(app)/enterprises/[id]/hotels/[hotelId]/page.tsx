'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useCatalogHotel } from '@/hooks/useHotels'
import { useEnterpriseHotel } from '@/hooks/useEnterprises'
import { HotelIdentityHeader, HotelRecordBody, fmtDate, type RawHotel } from '@/components/hotel/HotelRecord'
import { Badge, Spinner } from '@/components/ui'

export default function EnterpriseHotelDetailPage() {
  const { id: enterpriseId, hotelId } = useParams<{ id: string; hotelId: string }>()
  const { data: hotel, isLoading, isError, error } = useCatalogHotel(hotelId)
  const { data: link } = useEnterpriseHotel(enterpriseId, hotelId)

  return (
    <div>
      <Link
        href={`/enterprises/${enterpriseId}/hotels`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft className="h-4 w-4" /> Hotels
      </Link>

      {isLoading && <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500"><Spinner /> Loading…</div>}
      {(isError || (!isLoading && !hotel)) && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{(error as Error)?.message ?? 'Not found'}</div>
      )}

      {hotel && (
        <>
          <HotelIdentityHeader hotel={hotel as RawHotel} id={hotelId} />

          {/* Enterprise-specific data for this (enterprise, hotel) pairing. */}
          <div className="mb-4 rounded-lg border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              This enterprise
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-stone-500">Rate codes</span>
                {link?.rateCodes.length ? (
                  <span className="flex flex-wrap gap-1">
                    {link.rateCodes.map((c) => <Badge key={c} tone="gray">{c}</Badge>)}
                  </span>
                ) : (
                  <span className="text-stone-400">none — not yet probed</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500">Linked</span>
                <span className="text-stone-800">{fmtDate(link?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500">Updated</span>
                <span className="text-stone-800">{fmtDate(link?.modifiedAt)}</span>
              </div>
            </div>
          </div>

          <HotelRecordBody hotel={hotel as RawHotel} id={hotelId} />
        </>
      )}
    </div>
  )
}
