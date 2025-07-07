import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import PushInit from './PushInit'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SismosRD',
  description: 'Últimos sismos en RD y Caribe',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* manifest ya estaba */}
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>

      <body>
        <PushInit />
        {children}
      </body>
    </html>
  )
}
