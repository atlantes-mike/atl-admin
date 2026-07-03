import type { NextConfig } from 'next'

// Same-origin API access: the browser calls /v1.0/* and /v2.0/* on this app's
// own origin and Next proxies them to the booking-api server-side. This avoids
// CORS entirely and sidesteps the local https://localhost proxy's self-signed
// cert quirks — the server-to-server hop can target http://localhost:4000.
const BOOKING_API_URL = process.env.BOOKING_API_URL ?? 'http://localhost:4000'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/v1.0/:path*', destination: `${BOOKING_API_URL}/v1.0/:path*` },
      { source: '/v2.0/:path*', destination: `${BOOKING_API_URL}/v2.0/:path*` }
    ]
  }
}

export default nextConfig
