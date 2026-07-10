import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Digital Health Score Challenge - seofox.io',
  description: 'Get your free Digital Health Score in 60 seconds. Win ₹1,000 cash!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
