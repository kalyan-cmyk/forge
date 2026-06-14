import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forge — Compatibility Forged Through Adversity',
  description: 'Discover real compatibility through shared challenge. Forge designs custom adventures that reveal what partners are truly made of.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
