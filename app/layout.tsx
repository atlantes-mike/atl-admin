import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Atlantes Admin',
  description: 'Internal admin portal — enterprises, agents, hotels'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
