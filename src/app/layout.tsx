import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Nirav Draws',
    template: '%s | Nirav Draws',
  },
  description: 'Physics, mathematics and drawings by Nirav Ramdhanie.',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Nirav Draws',
    description: 'Physics, mathematics and drawings by Nirav Ramdhanie.',
    siteName: 'Nirav Draws',
  },
  twitter: {
    card: 'summary',
    title: 'Nirav Draws',
    description: 'Physics, mathematics and drawings by Nirav Ramdhanie.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
