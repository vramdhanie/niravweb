import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import Banner from '@/components/Banner'
import Title from '@/components/Title'
import DrawingCard from '@/components/DrawingCard'
import { getAllDrawings } from '@/lib/drawings'

export default function DrawsHomePage() {
  const featured = getAllDrawings().slice(0, 4)

  return (
    <>
      <Hero img="/images/nirav_01.jpg" home>
        <Image
          src="/images/nirav_logo.png"
          alt="Nirav Draws"
          width={300}
          height={275}
          priority
          sizes="(max-width: 768px) 220px, 300px"
          className="w-[220px] md:w-[300px]"
          style={{ height: 'auto' }}
        />
        <Banner title="Nirav Draws" info="Physics, Mathematics, Drawings">
          <Link
            href="/draws/drawings"
            className="inline-block border-2 border-white px-6 py-2 font-bold uppercase tracking-[var(--main-spacing)] text-white no-underline transition-all duration-300 hover:bg-white hover:text-[var(--primary-dark)]"
          >
            explore drawings
          </Link>
        </Banner>
      </Hero>

      <section className="bg-[var(--main-white)] px-4 py-16">
        <div className="mx-auto max-w-[1170px]">
          <Title title="Featured" subtitle="Items" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((drawing) => (
              <DrawingCard key={drawing.slug} drawing={drawing} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
