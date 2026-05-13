import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bran Studio',
  description: 'A local-first interface design studio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
