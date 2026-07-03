# AGENTS.md — atl-admin

Entry point for AI coding agents. Read this first.

> **Keep this file current.** When you add a route group, `lib/api` module,
> store, env key, or change the auth flow, update this doc in the same change.
> If code and this doc disagree, trust the code.

## What this is

`atl-admin` is the **internal admin portal** for the Atlantes booking system —
for **Atlantes staff**, not tenant advisors. It manages **enterprises**,
**agents (accounts)**, and hotels by calling the `atlantes_admin`-scoped
endpoints of `atl-booking-api`. It is a **pure client**: no database, no
supplier calls, and it never holds supplier or backend secrets.

It is the crown-jewels surface (enterprise supplier credentials), so it is a
**separate app / deploy / access boundary** from `atl-travel-desk`.

## Tech stack

- Next.js 16 (App Router) + React 19, TypeScript (strict)
- Tailwind CSS v4
- TanStack React Query (server state) + Zustand (auth/session)
- `lucide-react` icons; `@/*` path alias → repo root

## Project structure

```
app/
  (auth)/login/      Public sign-in
  (app)/             Auth-guarded shell (sidebar) — enterprises, agents
  layout.tsx         Root layout · providers.tsx  React Query provider
lib/
  api/client.ts      apiRequest() — the one fetch wrapper (Bearer/Basic + 401 refresh)
  api/auth.ts        login() — token + /auth/me, rejects non-atlantes_admin
  api/<resource>.ts  Typed calls per backend resource (add here, Phase 4)
  auth/refresh.ts    Silent token refresh
  utils.ts           cn()
stores/authStore.ts  Admin session (persisted; mirrored to the atl-admin-token cookie)
middleware.ts        Edge gate — no cookie ⇒ /login
types/               Shared types
```

## API & auth (the booking-api boundary)

- The booking-api is the only backend. All calls go through `apiRequest`
  (`lib/api/client.ts`): **`Bearer <token>`** when signed in, **`Basic <key>`**
  for the token bootstrap; a `401` triggers one silent refresh then a retry.
- **Same-origin proxy:** the browser calls `/v1.0/*` on this app; `next.config.ts`
  rewrites to `BOOKING_API_URL` (default `http://localhost:4000`) server-side.
  Don't hardcode the API host in components.
- **Admin identity:** login requires the `atlantes_admin` role
  (`lib/api/auth.ts`). The server re-enforces `atlantes_admin` scope on every
  admin route — client checks are presentation hints only.
- Responses are **JSON:API-shaped** (`{ data, meta }`); reference fields use
  `xxxId` in request payloads (mirrors the booking-api).

## Conventions

- **Server components by default;** add `'use client'` only for interactivity.
- **All backend calls go through `lib/api/*`** → `apiRequest`. Never `fetch` the
  API from a component; fetch server data with React Query.
- **State split:** Zustand owns auth/session only; React Query owns server data.
  Don't stash server data in a store.
- Reuse `cn()` and Tailwind utilities; keep components grouped by domain.

## Security & secrets

- **Everything in `NEXT_PUBLIC_*` ships to the browser.** Only the low-privilege
  platform bootstrap Basic key (`NEXT_PUBLIC_ADMIN_API_KEY_*`) belongs there —
  never a backend/provider/admin secret.
- The FE never displays raw supplier credentials: the booking-api masks them
  (`{ set, hint }`), and credential **writes** are write-only. Don't try to read
  or echo a secret client-side.
- `.env.local` is git-ignored; don't commit real keys.

## Env

| Key | Purpose |
|---|---|
| `BOOKING_API_URL` | server-side rewrite target (not exposed) — default `http://localhost:4000` |
| `NEXT_PUBLIC_API_URL` | leave empty for the same-origin proxy |
| `NEXT_PUBLIC_ADMIN_API_KEY_ID` / `_SECRET` | low-priv platform bootstrap Basic key (from `seedAtlantesAdmin.ts`) |

## Related

- `atl-booking-api/AGENTS.md` — endpoint contracts
- `atl-booking-api/docs/auth-roles.md` — the role model (`atlantes_admin`, scope resolution)
