import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Banner from '@/components/Banner'
import DrawingCard from '@/components/DrawingCard'
import { getAllDrawings } from '@/lib/drawings'

export const metadata: Metadata = {
  title: 'Drawings',
  description: 'Architectural drawings by Nirav Ramdhanie.',
}

export default function DrawingsPage() {
  const drawings = getAllDrawings()

  return (
    <>
      <Hero img="/images/articles_bg.jpg">
        <Banner>
          <h1
            className="px-4 text-5xl font-bold uppercase tracking-[6px] text-[var(--text-on-dark)] md:text-7xl"
            style={{ textShadow: '0 0 2px black' }}
          >
            Drawings
          </h1>
        </Banner>
      </Hero>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-[1170px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {drawings.map((drawing) => (
            <DrawingCard key={drawing.slug} drawing={drawing} />
          ))}
        </div>
      </section>
    </>
  )
}
