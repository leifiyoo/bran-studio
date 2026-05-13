import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Bran Studio',
  description: 'A local-first interface design studio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", GeistSans.variable)} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
