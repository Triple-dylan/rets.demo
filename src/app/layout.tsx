import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RETS AI - Real Estate Investment Assistant',
  description: 'AI-powered real estate investment analysis and deal sourcing',
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