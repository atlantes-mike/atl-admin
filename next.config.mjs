// Plain JS (not .ts) on purpose: next.config is transpiled at runtime by
// `next start`, and production installs prune devDependencies (typescript),
// so a .ts config crashes the dyno with "Cannot find module 'typescript'".

/** @type {import('next').NextConfig} */
const BOOKING_API_URL = process.env.BOOKING_API_URL ?? 'http://localhost:4000'

// Same-origin API access: the browser calls /v1.0/* and /v2.0/* on this app's
// own origin and Next proxies them to the booking-api server-side (no CORS).
const nextConfig = {
  async rewrites() {
    return [
      { source: '/v1.0/:path*', destination: `${BOOKING_API_URL}/v1.0/:path*` },
      { source: '/v2.0/:path*', destination: `${BOOKING_API_URL}/v2.0/:path*` }
    ]
  }
}

export default nextConfig
