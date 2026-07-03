import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cookie kept in sync with the auth store on login/refresh/logout so the edge
// proxy can gate routes before any client JS runs. The store (localStorage)
// remains the source of truth for the app; this cookie is only a routing hint.
const COOKIE = 'atl-admin-token'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value
  const { pathname } = request.nextUrl
  const isLogin = pathname === '/login'

  if (!token && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (token && isLogin) {
    return NextResponse.redirect(new URL('/enterprises', request.url))
  }
  return NextResponse.next()
}

export const config = {
  // Everything except Next internals, the API proxy paths, and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|v1.0|v2.0).*)']
}
