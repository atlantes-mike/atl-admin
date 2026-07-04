'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Building2, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

// Agents + Hotels are sub-resources of an enterprise (nested tabs), so the
// top-level nav is just Enterprises.
const NAV = [{ href: '/enterprises', label: 'Enterprises', icon: Building2 }]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { admin, token, clearAuth } = useAuthStore()

  // Client-side backstop to the edge middleware.
  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  function signOut() {
    clearAuth()
    document.cookie = 'atl-admin-token=; path=/; max-age=0'
    router.replace('/login')
  }

  if (!token) return null

  return (
    <div className="flex h-full">
      <aside className="flex w-60 flex-col border-r border-stone-200 bg-white">
        <div className="px-5 py-5">
          <div className="font-semibold text-stone-900">Atlantes Admin</div>
          <div className="text-xs text-stone-500">Internal portal</div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                  active ? 'bg-stone-100 font-medium text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-stone-200 p-3">
          <div className="truncate px-2 pb-2 text-xs text-stone-500">{admin?.email}</div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
