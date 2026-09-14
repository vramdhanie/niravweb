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
    default: 'Snap, Crackle and Pop',
    template: '%s | Snap, Crackle and Pop',
  },
  description: 'Physics, mathematics and drawings by Nirav Ramdhanie.',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Snap, Crackle and Pop',
    description: 'Physics, mathematics and drawings by Nirav Ramdhanie.',
    siteName: 'Snap, Crackle and Pop',
  },
  twitter: {
    card: 'summary',
    title: 'Snap, Crackle and Pop',
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
