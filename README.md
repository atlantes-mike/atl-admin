# atl-admin

Internal admin portal for the Atlantes booking system — where **Atlantes staff**
(not tenant advisors) manage **enterprises**, **agents (accounts)**, and hotels.

It is a pure client of `atl-booking-api`, talking only to its `atlantes_admin`-scoped
endpoints. It holds no database and no supplier credentials.

## Stack

- Next.js 16 (App Router) + React 19, TypeScript (strict)
- Tailwind CSS v4
- TanStack React Query (server state) + Zustand (auth/session)
- `lucide-react` icons

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in the bootstrap key (see below)
npm run dev                         # http://localhost:3002
npm run build                       # production build (also type-checks)
npm run typecheck                   # tsc --noEmit
```

The local `atl-booking-api` must be running (its docker app container is on
`http://localhost:4000`). This app proxies `/v1.0/*` and `/v2.0/*` to it
server-side (see `next.config.ts`), so the browser only ever talks to this
app's own origin — no CORS, and the https://localhost proxy's cert quirks are
irrelevant.

## Auth

- Sign in as an **`atlantes_admin`** account (seed one with
  `atl-booking-api/scripts/seedAtlantesAdmin.ts`). Non-admin accounts are
  refused at login and by the server on every request.
- The browser holds only a **low-privilege platform Basic key**
  (`NEXT_PUBLIC_ADMIN_API_KEY_*`) whose sole job is authorizing
  `POST /v1.0/auth/token`. All authority comes from the `atlantes_admin`
  account scope after login.

See `AGENTS.md` for structure and conventions, and
`atl-booking-api/docs/auth-roles.md` for the role model.
