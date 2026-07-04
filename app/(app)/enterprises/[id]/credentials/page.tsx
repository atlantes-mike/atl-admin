'use client'

import { useParams } from 'next/navigation'
import { useEnterprise } from '@/hooks/useEnterprises'
import { SabreCard, ZentrumhubCard } from '@/components/enterprise/cards'
import { Spinner } from '@/components/ui'

export default function EnterpriseCredentialsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: ent, isLoading, isError, error } = useEnterprise(id)

  if (isLoading) {
    return <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500"><Spinner /> Loading…</div>
  }
  if (isError || !ent) {
    return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{(error as Error)?.message ?? 'Not found'}</div>
  }

  return (
    <div className="space-y-5">
      <SabreCard ent={ent} />
      <ZentrumhubCard ent={ent} />
    </div>
  )
}
