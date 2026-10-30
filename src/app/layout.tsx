import type { Metadata } from 'next'
import { Bricolage_Grotesque, Josefin_Sans, Syne_Tactile } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const josefin = Josefin_Sans({
  variable: '--font-josefin',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

const syne = Syne_Tactile({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://niravramdhanie.com'),
  title: {
    default: 'Snap, Crackle and Pop',
    template: '%s | Snap, Crackle and Pop',
  },
  description: 'Physics, mathematics and drawings by Nirav Ramdhanie — from finite-element simulation to chaotic gravitational basins and architectural sketches.',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Snap, Crackle and Pop',
    description: 'Physics, mathematics and drawings by Nirav Ramdhanie — from finite-element simulation to chaotic gravitational basins and architectural sketches.',
    siteName: 'Snap, Crackle and Pop',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Gravitational basins of the equilateral three-body configuration' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snap, Crackle and Pop',
    description: 'Physics, mathematics and drawings by Nirav Ramdhanie — from finite-element simulation to chaotic gravitational basins and architectural sketches.',
    images: ['/og.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${josefin.variable} ${bricolage.variable} ${syne.variable} antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
