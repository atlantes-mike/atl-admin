'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useEnterprise, useSabreStatus } from '@/hooks/useEnterprises'
import { useAccounts } from '@/hooks/useAccounts'
import { cn } from '@/lib/utils'

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const { data: ent } = useEnterprise(id)
  const { data: agents } = useAccounts({ enterpriseId: id })
  const { data: sabre } = useSabreStatus(id)

  const base = `/enterprises/${id}`
  const tabs: { href: string; label: string; exact?: boolean; count?: number }[] = [
    { href: base, label: 'Overview', exact: true },
    { href: `${base}/agents`, label: 'Agents', count: agents?.meta.total },
    { href: `${base}/hotels`, label: 'Hotels', count: sabre?.hotels.links },
    { href: `${base}/credentials`, label: 'Credentials' }
  ]
  const isActive = (t: (typeof tabs)[number]) => (t.exact ? pathname === t.href : pathname.startsWith(t.href))

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/enterprises" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Enterprises
      </Link>

      <div className="mb-4">
        <h1 className="text-lg font-semibold text-stone-900">{ent?.name ?? '…'}</h1>
        <p className="font-mono text-xs text-stone-400">
          {id}
          {ent ? ` · search ${ent.searchApiVersion} · booking ${ent.bookingApiVersion}` : ''}
        </p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-stone-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm',
              isActive(t)
                ? 'border-stone-900 font-medium text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className="rounded-full bg-stone-100 px-1.5 text-xs text-stone-500">{t.count.toLocaleString()}</span>
            )}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}
