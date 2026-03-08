import './globals.css'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { PresenceHeartbeat } from '@/components/presence/heartbeat'

export const metadata: Metadata = {
  title: 'Secure Messenger',
  description: 'Простой защищённый мессенджер',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
          <PresenceHeartbeat />
          <SiteHeader />
          {children}
      </body>
    </html>
  )
}