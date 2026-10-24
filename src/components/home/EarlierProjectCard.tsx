'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

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

export default function EarlierProjectCard() {
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
    <section aria-labelledby="previous-projects">
      <h2
        id="previous-projects"
        className="mb-5 text-sm font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary)]"
      >
        Previous Projects
      </h2>
      <Link
        href="/projects/restricted-n-body-basins"
        className="group relative flex min-h-44 overflow-hidden rounded-2xl text-[var(--text-on-dark)] no-underline shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-1 md:min-h-52"
      >
        <div className="absolute inset-0">
          {SLIDES.map((slide, i) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={i === index ? slide.alt : ''}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover transition-opacity duration-1000"
              style={{ opacity: i === index ? 1 : 0 }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />

        <div className="relative z-[1] flex w-full flex-col gap-3 px-6 py-6 text-left md:px-8 md:py-7">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display min-w-0 text-xl font-bold leading-tight tracking-tight md:text-2xl">
              Mapping Chaotic Gravitational Basins
            </h3>
            <span className="inline-flex shrink-0 items-center gap-2 pt-1 text-sm font-bold uppercase tracking-[var(--main-spacing)]">
              View
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>
          <p className="text-sm text-white/70">September 2026</p>
          <p className="max-w-md text-sm leading-relaxed text-white/85 md:text-base">
            Are you an asteroid? Because I was just impressed.
          </p>
        </div>
      </Link>
    </section>
  )
}
