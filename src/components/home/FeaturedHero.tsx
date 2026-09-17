'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Github, Sparkles, BookOpen } from 'lucide-react'
import { useEffect, useState, type RefObject } from 'react'

const SLIDES = [
  {
    src: '/images/nbody/equilateral_basins.jpg',
    alt: 'Collision basins for three equal masses on an equilateral triangle.',
  },
  {
    src: '/images/nbody/time_basins.jpg',
    alt: 'The same basins coloured by time-to-hit.',
  },
  {
    src: '/images/nbody/3d_render.jpg',
    alt: 'A 3-flat through the 4-D lattice of initial conditions.',
  },
] as const

const INTERVAL_MS = 10_000

interface Props {
  title: string
  eyebrow: string
  repo: string
  author: string
  articleRef: RefObject<HTMLAnchorElement | null>
  titleRef: RefObject<HTMLHeadingElement | null>
  taglineRef: RefObject<HTMLParagraphElement | null>
  triggerRef: RefObject<HTMLSpanElement | null>
  buttonsRef: RefObject<HTMLDivElement | null>
  copyRef: RefObject<HTMLDivElement | null>
}

export default function FeaturedHero({
  title,
  eyebrow,
  repo,
  author,
  articleRef,
  titleRef,
  taglineRef,
  triggerRef,
  buttonsRef,
  copyRef,
}: Props) {
  const [index, setIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  return (
    <section className="relative overflow-hidden px-4 py-24 text-center text-[var(--text-on-dark)] md:py-32">
      <div className="absolute inset-0 bg-[var(--primary-dark)]">
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={i === index ? slide.alt : ''}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover transition-opacity duration-1000"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.48) 42%, rgba(0,0,0,0.14) 72%, transparent 100%)',
        }}
      />

      <div ref={copyRef} className="relative z-[2] mx-auto max-w-3xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary-light)]">
          {eyebrow}
        </p>
        <h1
          ref={titleRef}
          className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl"
        >
          {title}
        </h1>
        <p
          ref={taglineRef}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90"
        >
          Visualising what the gravitational basins for <em>n</em> fixed masses may look like.
          Clicking{' '}
          <span ref={triggerRef} className="underline decoration-white/50 decoration-dotted underline-offset-4">
            this button
          </span>{' '}
          will frac…tal your mind. Yeah, that sounded better in my head.
        </p>
        <div
          ref={buttonsRef}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            ref={articleRef}
            href="/articles/restricted-n-body-basins"
            data-asteroid-wall
            className="inline-flex items-center gap-2 rounded bg-white px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-[var(--primary-dark)] no-underline transition-transform duration-300 hover:scale-105"
          >
            <BookOpen size={18} />
            Read the full article
          </Link>
          <a
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
            data-asteroid-wall
            className="inline-flex items-center gap-2 rounded border-2 border-white px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-white no-underline transition-all duration-300 hover:bg-white hover:text-[var(--primary-dark)]"
          >
            <Github size={18} />
            View on GitHub
          </a>
          <a
            href="#visualizer"
            className="inline-flex items-center gap-2 rounded px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-white/90 no-underline transition-colors hover:text-white"
          >
            <Sparkles size={18} />
            Explore the visualiser
          </a>
        </div>
        <p className="mt-8 text-sm text-white/60">
          An open-source physics simulation by {author}.
        </p>
      </div>
    </section>
  )
}
