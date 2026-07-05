'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useCatalogHotel } from '@/hooks/useHotels'
import { HotelIdentityHeader, HotelRecordBody, type RawHotel } from '@/components/hotel/HotelRecord'
import { Spinner } from '@/components/ui'

export default function HotelRecordPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useCatalogHotel(id)

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link href="/hotels" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Hotels
      </Link>

      {isLoading && <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500"><Spinner /> Loading…</div>}
      {(isError || (!isLoading && !data)) && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{(error as Error)?.message ?? 'Not found'}</div>
      )}

      {data && (
        <>
          <HotelIdentityHeader hotel={data as RawHotel} id={id} />
          <HotelRecordBody hotel={data as RawHotel} id={id} />
        </>
      )}
    </div>
  )
}
