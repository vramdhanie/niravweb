import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Games',
  description: 'Games by Nirav Ramdhanie.',
}

const eyebrow =
  'text-sm font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary)]'

const COVER =
  '/images/Games/Aperiodic Cellular Automata/Screenshot 2026-11-02 230832.png'

export default function GamesPage() {
  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-4 py-16 text-center md:py-24">
        <Image
          src={COVER}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.48) 42%, rgba(0,0,0,0.14) 72%, transparent 100%)',
          }}
        />
        <div className="relative z-[2] w-full max-w-3xl">
          <p className={`mb-4 ${eyebrow}`}>Featured game</p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[var(--text-on-dark)] md:text-6xl">
            Aperiodic Cellular Automata
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90">
            Remember Conway&apos;s game of life? Well this is basically the same thing but on a Penrose tiling. The rules are slightly different
            but same idea. This game was inspired by Adam P. Goucher&apos;s paper, <a href="https://cp4space.hatsya.com/wp-content/uploads/2012/11/2012-penrose-gliders.pdf" target="_blank" rel="noopener noreferrer" className="text-[var(--secondary)] hover:text-[var(--primary-light)]">Gliders in cellular automata on Penrose tilings</a>.
          </p>
          <Link
            href="/games/aperiodic-cellular-automata"
            className="mt-10 inline-flex items-center rounded bg-white px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-[var(--primary-dark)] no-underline transition-transform duration-300 hover:scale-105"
          >
            Play
          </Link>
        </div>
      </section>

      <section className="border-t border-black/10 px-4 py-14">
        <div className="mx-auto max-w-[1170px] text-center">
          <p className={eyebrow}>More games</p>
          <p className="mt-4 text-[var(--primary-light)]">Perchance there may be more games here.</p>
        </div>
      </section>
    </div>
  )
}
