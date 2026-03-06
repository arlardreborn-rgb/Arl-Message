import './globals.css'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'

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
    <html lang="ru">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}